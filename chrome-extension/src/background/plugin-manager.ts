/*
 * Resolve remote plugins into configurable objects and save/load this configuration
 * so it persists across chrome sessions.
 */
import * as _ from "lodash";
import * as CT from "../constants";
import { PluginSandbox } from "./plugin-sandbox";
import { store, IStorePlugin } from "./store";
import * as Preferences from "./preferences";
import { IPluginConfig } from "./preferences";
import { promisify } from "./util";
import { resolve } from "url";


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
        store.plugins.forEach((plugin) => {
            if (_.reduce(plugin.match, (memo, matchPattern) => matchPattern.test(url) || memo, true)) {
                promisify<any>(chrome.tabs.executeScript)(tabId, {code: plugin.cs, runAt: "document_start"});
            }
        });
    }

    // TODO: when ES6 System.import is supported, switch to using that
    // load options
    private fetchPluginCode(name: string): Promise<IPlugin> {
        return new Promise((resolve, reject) => {
            var plugin;
            var request = new XMLHttpRequest();
            request.open('GET', chrome.runtime.getURL(`dist/plugins/${name.toLowerCase()}.js`), true);

            request.onload = function() {
                if (request.status >= 200 && request.status < 400) {
                    let exports = {};
                    eval(`${request.responseText}`);
                    plugin = exports[`${name}Plugin`];
                } else {
                    // We reached our target server, but it returned an error

                }
                resolve(plugin);
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
        return resolvedPlugins.map((resolved) => {
            let resolvedPlugin = resolved.plugin;
            // everything that the user declares in the class
            // that might be shared in command run code.
            let commandsStr = resolvedPlugin.commands.filter((cmd) => cmd.runOnPage).map((cmd) => `commands['${resolvedPlugin.name}']['${cmd.name}'] = ${cmd.runOnPage.toString()}`);
            let csStr = `commands = commands || {}; ${resolvedPlugin.name}PluginCommon = (${resolved.common.toString()})(); commands['${resolvedPlugin.name}'] = {};${commandsStr.join(';')}`;
            return {
                enabled: true,
                commands: resolvedPlugin.commands.map((cmd) => {
                    return {
                        delay: _.flatten([cmd.delay]),
                        enabled: true,
                        // Make all the functions strings (because we can't store them directly)
                        runOnPage: cmd.runOnPage ? cmd.runOnPage.toString() : '() => null',
                        match: typeof cmd.match === 'function' ? cmd.match : _.flatten([cmd.match]),
                        _ordinalMatch: typeof cmd.match !== 'function' ? !!_.find(_.flatten(cmd.match), (matchStr) => ~matchStr.indexOf('#')) : false,
                        ..._.pick(cmd, 'name', 'description', 'run', 'nice'),
                    };
                }),
                cs: csStr,
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
