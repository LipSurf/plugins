/// <reference path="./store.ts" />
/// <reference path="../common/util.ts" />
/*
 * Resolve remote plugins into configurable objects and save/load this configuration
 * so it persists across chrome sessions.
 */
import { flatten, pick } from "lodash";
import { StoreSynced, IPluginConfig, } from "./store";
import { promisify } from "../common/util";
// HACK
// Force PluginBase class to be included so that eval doesn't bitch
let { PluginBase } = require("../common/plugin-lib");

// Plugin content-script store for easily loading front-end
// code into pages
interface IPluginCSStore extends IDisableable {
    match: RegExp[],
    cs: string,
}


export class PluginManager extends StoreSynced {
    private pluginsCSStore:IPluginCSStore[];

    protected storeUpdated(newPluginsConfig: IPluginConfig[]) {
        this.pluginsCSStore = newPluginsConfig.map((pluginConfig) =>
            pick(pluginConfig, ['enabled', 'cs', 'match']));
    }

    // TODO: wait for promise of plugins loaded?
    // checks the given url and loads the necessary plugin command
    // code into the given tabId if the url matches.
    async loadCommandCodeIntoPage(tabId: number, url: string) {
        let csStrs = this.pluginsCSStore
            .filter((plugin) => plugin.enabled && plugin.match.reduce((acc, matchPattern) => acc || matchPattern.test(url), false))
            .map((plugin) => plugin.cs);
        await promisify<any>(chrome.tabs.executeScript)(tabId, {code: csStrs.join('\n'), runAt: "document_start"});
    }

    // Take PluginBase subclass and
    // put into form ready for the plugin store
    // only needs to be run when plugin version is changed
    // (most commonly when fetching new plugins, or updating version of
    // existing plugins)
    static async digestNewPlugin(id: string, version: string): Promise<ILocalPluginData> {
        let plugin = PluginManager.evalPluginCode(id, (await PluginManager.fetchPluginCode(id)));
        // everything that the user declares in the class
        // that might be shared in command run code.
        let commandsStr = plugin.commands
                .filter((cmd) => cmd.runOnPage)
                .map((cmd) => {
                    let cmdVal:any = {
                        runOnPage: cmd.runOnPage.toString(),
                    };
                    if (typeof cmd.match === 'function')
                        cmdVal.match = cmd.match.toString()
                    let cmdValStr = Object.keys(cmdVal).map((key) => `${key}:${cmdVal[key]}`).join(',');
                    return `'${cmd.name}': {${cmdValStr}}`
                });
        // members that the plugin uses internally (shared across commands)
        let privateMembers = Object.keys(plugin)
                .filter((member) => typeof PluginBase[member] === 'undefined')
                .map((member) => {
                    let val;
                    let _type = typeof plugin[member];
                    if (_type === 'function')
                        val = plugin[member].toString()
                    else if (_type === 'object') {
                        if (plugin[member] instanceof Set) {
                            val = `new Set(${JSON.stringify(Array.from(plugin[member]))})`
                        } else {
                            val = JSON.stringify(plugin[member]);
                        }
                    }
                    return `${id}Plugin.${member} = ${val};`
                });
        let initStr = plugin.init ? plugin.init.toString() : '';
        let cs = `${id}Plugin = class ${id}Plugin {};
                ${id}Plugin.commands = {${commandsStr.join(',')}};
                ${privateMembers.join('\n')}
                ${initStr.substr(0, initStr.lastIndexOf('}')).replace(/init\(\)\s*{/, '')};
                    `;
        return {
            commands: plugin.commands.map((cmd) => {
                let delay;
                if (cmd.delay)
                    delay = flatten([cmd.delay]);
                return {
                    // Make all the functions strings (because we can't store them directly)
                    match: typeof cmd.match === 'function' ? cmd.match : flatten([cmd.match]),
                    delay,
                    // don't pick test... perhaps others (so we whitelist)
                    ... pick(cmd, 'run', 'name', 'description', 'nice', 'global',),
                };
            }),
            match: flatten([plugin.match]),
            cs,
            version,
            ... pick(plugin, 'friendlyName', 'homophones')
        };
    }

    static evalPluginCode(id: string, text: string): typeof PluginBase {
        let plugin;
        // HACK
        // needed to prevent undefined error in common (init) code
        // TODO: load plugin code in frontend --> send up the properties
        // that must be stored (as strings if they have things undefined
        // in the bg (get eval'd in the cs)). This way we don't have
        // to define dumby PluginUtil shit here
        // takes ~1ms
        let $ = () => { return {ready: () => null}};
        eval(`${text}; plugin = ${id}Plugin;`);
        // END HACK
        return plugin;
    }

    // TODO: when ES6 System.import is supported, switch to using that?
    // load options
    // Needs to be public to keep this testable
    static fetchPluginCode(id: string): Promise<string>  {
        return new Promise((resolve, reject) => {
            let plugin: typeof PluginBase;
            let request = new XMLHttpRequest();
            request.open('GET', chrome.runtime.getURL(`dist/plugins/${id.toLowerCase()}.js`), true);

            request.onload = () => {
                if (request.status >= 200 && request.status < 400) {
                    resolve(request.responseText);
                } else {
                    // We reached our target server, but it returned an error
                    reject();
                }
            };

            request.onerror = function() {
                // There was a connection error of some sort
            };

            request.send();
        });
    }
}
