/// <reference path="./store.ts" />
/// <reference path="../common/util.ts" />
/*
 * Resolve remote plugins into configurable objects and save/load this configuration
 * so it persists across chrome sessions.
 */
import { flatten, pick, find, assignIn, mapValues, omit, get, isEqual, } from "lodash";
import { StoreSynced, } from "./store";
import { instanceOfDynamicMatch, httpReq } from "../common/util";
import { IOptions } from "../common/store-lib";
import { BlankPlugin } from "../common/plugin-lib";
import { tabs } from  "../common/browser-interface";

// Plugin content-script store for easily loading front-end
// code into pages
interface IPluginCSStore extends IDisableable {
    match: RegExp[],
    cs: string,
    // if it has at least 1 global command
    hasGlobalCmd: boolean,
}

export class PluginManager extends StoreSynced {
    private pluginsCSStore:IPluginCSStore[];

    protected async storeUpdated(newOptions: IOptions) {
        // match is a regex, we can't jsonify it, so exclude it from checking for needed updates to propagate 
        // downwards for now
        let oldCSStore = JSON.parse(JSON.stringify((this.pluginsCSStore || []).map(plugin => omit(plugin, 'match'))));
        this.pluginsCSStore = newOptions.plugins.map(pluginConfig =>
            ({
                hasGlobalCmd: !!find(pluginConfig.commands, cmd => cmd.global),
                ...pick(pluginConfig, ['enabled', 'cs', 'match']),
            }));
        if (this.pluginsCSStore.length > 0 && !isEqual(oldCSStore, this.pluginsCSStore.map(plugin => omit(plugin, 'match')))) {
            console.log('Resending CS code to tabs!');
            // refresh the cs code on all the tabs
            tabs.sendMsgToTabs({
                type: 'plugin',
                code: await ((tab) => this.getPluginCSCode(tab.url)),
            }) 
        }
    }

    // checks the given url and returns the plugin cs code for it
    // used to work with chrome.tabs.executeScript(tabId)... but eval'ing
    // on the page CS is cleaner
    async getPluginCSCode(url: string): Promise<string> {
        // make sure at least the initial load has happened
        await this.initialLoad;
        // either matches the url, or has at least one global
        let compiledCsStr = this.pluginsCSStore
            .filter(plugin => plugin.enabled && (plugin.hasGlobalCmd || plugin.match.reduce((acc, matchPattern) => acc || matchPattern.test(url), false)))
            .map(plugin => plugin.cs).join('\n');
		// can't promisify here because we need to access lastError
        // return `${typeof this.initialLoad} ${this.initialLoad} ${JSON.stringify(this.initialLoad)}`;
        return compiledCsStr;
    }

    static async fetchAndDigestPlugin(id: string, version: string):Promise<ILocalPluginData> {
        try {
            let content = await PluginManager.fetchPluginCode(id);
            return await PluginManager.digestNewPlugin(id, version, content);
        } catch(e) {
            console.error(`Could not fetch plugin: ${id}`);
        }
    }

    // Take PluginBase subclass and
    // put into shape compatible with the global shared store (IOptions)
    // only needs to be run when plugin version is changed
    // (most commonly when fetching new plugins, or updating version of
    // existing plugins)
    static async digestNewPlugin(id: string, version: string, content: string): Promise<ILocalPluginData> {
        let plugin = await PluginManager.evalPluginCode(id, content);
        let csCmdsStr = plugin.commands
                .filter((cmd) => cmd.pageFn)
                .map((cmd) => {
                    let cmdVal:any = {
                        pageFn: cmd.pageFn.toString(),
                    };
                    if (instanceOfDynamicMatch(cmd.match)) {
                        let dynMatchFns = [`en: ${cmd.match.fn.toString()}`];
                        // add other languages
                        for (let ln in plugin.languages) {
                            let matchFn = get(plugin.languages[ln], ['commands', cmd.name, 'match', 'fn'], (input) => undefined);
                            dynMatchFns.push(`${ln}: ${matchFn.toString()}`);
                        }
                        cmdVal.match = `{${dynMatchFns.join(',')}}`
                    }
                    let cmdValStr = Object.keys(cmdVal).map((key) => `${key}:${cmdVal[key]}`).join(',');
                    return `'${cmd.name}': {${cmdValStr}}`
                });
        // members that the plugin uses internally (shared across commands)
        let privateMembers = Object.keys(plugin)
                .filter((member) => !(member in BlankPlugin))
                .map((member) => {
                    let val = plugin[member];
                    let _type = typeof val;
                    if (_type === 'function')
                        val = val.toString()
                    else if (_type === 'object') {
                        if (plugin[member] instanceof Set) {
                            val = `new Set(${JSON.stringify(Array.from(plugin[member]))})`
                        } else {
                            val = JSON.stringify(plugin[member]);
                        }
                    } else if (_type === 'string') {
                        // wrap it up
                        val = ['`', val, '`'].join('');
                    }
                    return `${id}Plugin.Plugin.${member} = ${val};`
                });
        let autoGenerated = `${id}Plugin.Plugin.getPluginOption = function(name) { return PluginBase.getPluginOption('${id}', name); };
                             ${id}Plugin.Plugin.setPluginOption = function(name, val) { return PluginBase.setPluginOption('${id}', name, val); };`;
        // make reg fn into a arrow fn
        let initAndDestrStr = ['init', 'destroy'].map(x => plugin[x] ? `${id}Plugin.Plugin.${x}=${plugin[x].toString().replace(/(.*)\(\s*\)\s*{/, '()=>{')}` : '').join(';');
        // IIFE
        let cs = `allPlugins.${id}Plugin = (function(){let ${id}Plugin = {Plugin: {}};
                ${id}Plugin.Plugin.commands = {${csCmdsStr.join(',')}};
                ${privateMembers.join('\n')}
                ${autoGenerated}
                ${initAndDestrStr}; return ${id}Plugin.Plugin;})()`;
        return {
            commands: plugin.commands.reduce((memo, cmd) => {
                memo[cmd.name] = pick(cmd, 'fn', 'global');
                return memo;
            }, {}),
            localized: assignIn({
                "en": {
                    matchers: PluginManager.makeMatcher(plugin.commands.reduce((memo, cmd) =>
                        Object.assign(memo, {[cmd.name]: cmd})
                    , {})),
                    homophones: plugin.homophones,
                    ... pick(plugin, 'niceName', 'description', ),
                },
                }, mapValues(plugin.languages, localizedPlugin => {
                    return {
                        matchers: PluginManager.makeMatcher(localizedPlugin.commands),
                        ...omit(localizedPlugin, 'commands', 'authors', ),
                    };
                })
            ),
            match: flatten([plugin.match]),
            cs,
            version,
        };
    }

    static makeMatcher(commands:{[cmdName: string]: ILocalizedCommand}): {[cmdName: string]: IMatcher } {
        return mapValues(commands, cmd => {
            let ret: any = {
                // Make all the functions strings (because we can't store them directly)
                match: instanceOfDynamicMatch(cmd.match) ? cmd.match : flatten([cmd.match]),
                ... pick(cmd, 'name', 'description', 'nice', ),
            };
            if (cmd.delay) {
                ret.delay = flatten([cmd.delay]);
            }
            return ret;
        });
    }

    static evalPluginCode(id: string, text: string): IPlugin {
        let plugin;
        // HACK
        // needed to prevent undefined error in common (init) code
        // TODO: load plugin code in frontend --> send up the properties
        // that must be stored (as strings if they have things undefined
        // in the bg (get eval'd in the cs)). This way we don't have
        // to define dumby PluginUtil shit here
        // takes ~1ms

        let $ = () => { return {ready: () => null}};
        let PluginBase = {
            languages: {},
            setOption: undefined,
            getOptions: undefined,
        };
        try {
            eval(`${text}; plugin = ${id}Plugin.Plugin`);
        } catch (e) {
            console.error(e);
            console.error(`Error eval'ing ${id}. Skipping.`);
        }
        // END HACK

        return plugin;
    }

    // TODO: when ES6 System.import is supported, switch to using that?
    // load options
    // Needs to be public to keep this testable
    static fetchPluginCode(id: string): Promise<string>  {
        return httpReq(`dist/plugins/${id.toLowerCase()}.js`);
    }
}
