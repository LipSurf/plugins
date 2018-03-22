/// <reference path="./store.ts" />
/// <reference path="../common/util.ts" />
/*
 * Resolve remote plugins into configurable objects and save/load this configuration
 * so it persists across chrome sessions.
 */
import * as _ from "lodash";
import { StoreSynced, IPluginConfig, } from "./store";
import { promisify } from "../common/util";

// Plugin content-script store for easily loading front-end
// code into pages
interface IPluginCSStore extends IDisableable {
    match: RegExp[],
    cs: string,
}

// HACK
class PluginBase {
    static friendlyName =  '';
    static description = '';
    static version = '';
    static match = /^$/;

    static commands: IPluginDefCommand[] = [];
    static homophones: IPluginDefHomophones = {};
    static init = () => null;

    static util: IPluginUtil = {
        queryAllFrames: () => null,
        postToAllFrames: () => null,
        sendMsgToBeacon: () => null,
        toggleHelpBox: (enabeld) => null,
        getScrollDistance: () => 0,
        scrollToAnimated: () => null,
        isInView: () => true,
        getNoCollisionUniqueAttr: () => '',
    }
};

export class PluginManager extends StoreSynced {
    private pluginsCSStore:IPluginCSStore[];

    protected storeUpdated(newPluginsConfig: IPluginConfig[]) {
        this.pluginsCSStore = newPluginsConfig.map((pluginConfig) => 
            _.pick(pluginConfig, ['enabled', 'cs', 'match']));
    }

    // TODO: wait for promise of plugins loaded?
    // checks the given url and loads the necessary plugin command
    // code into the given tabId if the url matches.
    async loadCommandCodeIntoPage(tabId: number, url: string) {
        let csStrs = this.pluginsCSStore
            .filter((plugin) => plugin.enabled && _.reduce(plugin.match, (acc, matchPattern) => acc || matchPattern.test(url), false))
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
                .map((cmd) => `'${cmd.name}': ${cmd.runOnPage.toString()}`);
        // members that the plugin uses internally (shared across commands)
        let privateMembers = Object.keys(plugin)
                .filter((member) => typeof PluginBase[member] === 'undefined')
                .map((member) => `${id}Plugin.${member} = ${plugin[member] ? plugin[member].toString(): plugin[member]};`);
        let initStr = plugin.init.toString();
        let cs = `window.${id}Plugin = class ${id}Plugin {};
                ${id}Plugin.commands = {${commandsStr.join(',')}};
                ${privateMembers.join('\n')}
                ${initStr.substr(0, initStr.lastIndexOf('}')).replace('init() {', '')};
                    `;
        return {
            commands: plugin.commands.map((cmd) => {
                return {
                    delay: cmd.delay ? _.flatten([cmd.delay]) : [],
                    // Make all the functions strings (because we can't store them directly)
                    match: typeof cmd.match === 'function' ? cmd.match : _.flatten([cmd.match]),
                    ..._.pick(cmd, 'run', 'name', 'description', 'nice'),
                };
            }),
            match: _.flatten([plugin.match]),
            cs,
            version,
            ... _.pick(plugin, 'friendlyName', 'homophones')
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
