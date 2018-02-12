/*
 * Resolve remote plugins into configurable objects and save/load this configuration
 * so it persists across chrome sessions.
 */
import * as _ from "lodash";
import * as CT from "./constants";
import { PluginSandbox } from "./plugin-sandbox";
import { store, IStorePlugin } from "./store";
import * as Preferences from "./preferences";
import { IPluginConfig } from "./preferences";
import { promisify } from "./util";
import { resolve } from "url";

// what the raw fetched plugin looks like.
// 3rd party developers make this version
interface IPluginModule {
    name: string,
    description: string,
    version: string,
    commands: {
        name: string,
        description: string,
        match: (() => boolean) | string[] | string,
        delay: Number | Number[],
        runOnPage: () => null,
        nice: (match: string) => string,
        run: () => null,
    }[],
    homophones: { string: string }[],
    match: RegExp | RegExp[],
    pageInit: () => void,
}

export class PluginManager {
    private pluginSandbox: PluginSandbox;

    constructor(pluginSandbox: PluginSandbox) {
        this.pluginSandbox = pluginSandbox;

        this.loadPluginStoreFromSyncStorage().then((loadedStorePlugin) => store.plugins = loadedStorePlugin);
    }

    // TODO: wait for promise of plugins loaded?
    // checks the given url and loads the necessary plugin command
    // code into the given tabId if the url matches.
    async loadCommandCodeIntoPage(tabId: number, url: string) {
        for (let i = 0; i < store.plugins.length; i++) {
            if (_.reduce(store.plugins[i].match, (memo, matchPattern) => matchPattern.test(url) && memo, true)) {
                return promisify<any>(chrome.tabs.executeScript)(tabId, {code: store.plugins[i].cs, runAt: "document_start"});
            }
        }
    }

    // TODO: when ES6 System.import is supported, switch to using that
    // load options
    private fetchPluginCode(name: string): Promise<IPluginModule> {
        return new Promise((resolve, reject) => {
            var cmdFn;
            var request = new XMLHttpRequest();
            request.open('GET', chrome.runtime.getURL(`plugins/${name.toLowerCase()}.js`), true);

            request.onload = function() {
                if (request.status >= 200 && request.status < 400) {
                    let module = {exports: {}};
                    eval(`${request.responseText}`);
                    cmdFn = module.exports;
                } else {
                    // We reached our target server, but it returned an error

                }
                resolve(cmdFn);
            };

            request.onerror = function() {
                // There was a connection error of some sort
            };

            request.send();
        });
    }

    // Make more useable "PluginStore" by combining condensed preferences
    // with remote plugin code
    async loadPluginStoreFromSyncStorage(): Promise<IStorePlugin[]> {
        let pluginPrefs = (await Preferences.load()).plugins;
        let pluginResolvers = pluginPrefs.map((plugin) => this.fetchPluginCode(plugin.name));
        // and transform into a plugin object in the form that it is used
        let resolvedPlugins = await Promise.all(pluginResolvers);
        return resolvedPlugins.map((resolvedPlugin) => {
            return {
                enabled: true,
                commands: resolvedPlugin.commands.map((cmd) => {
                    return {
                        delay: _.flatten([cmd.delay]),
                        enabled: true,
                        // Make all the functions strings (because we can't store them directly)
                        runOnPage: cmd.runOnPage ? cmd.runOnPage.toString() : '() => null',
                        match: typeof cmd.match === 'function' ? cmd.match : _.flatten([cmd.match]),
                        _ordinalMatch: false,
                        ..._.pick(cmd, 'name', 'description', 'run', 'nice'),
                    };
                }),
                cs: `${resolvedPlugin.pageInit ? '(' + resolvedPlugin.pageInit.toString() + ')();' : ''}commands['${resolvedPlugin.name}'] = {}; ${resolvedPlugin.commands.map((c) => `commands['${resolvedPlugin.name}']['${c.name}'] = ${c.runOnPage};`).join(';')}`,
                homophones: Object.keys(resolvedPlugin.homophones).map((key, index) => {
                    return {
                        enabled: true,
                        source: key,
                        destination: resolvedPlugin.homophones[key],
                    };
                }),
                match: _.flatten([resolvedPlugin.match]),
                ... _.pick(resolvedPlugin, 'name')
            };
        });
    }
}
