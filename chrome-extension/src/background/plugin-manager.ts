/*
 * Resolve remote plugins into configurable objects and save/load this configuration
 * so it persists across chrome sessions.
 */
import * as _ from "lodash";
import { Store } from "./store";
import { Preferences } from "./preferences";
import { promisify } from "../common/util";


export class PluginManager {

    constructor(private store: Store, private preferences: Preferences) {
        this.preferences.load().then(async (pluginPrefs) => {
            let resolvedPlugin = await PluginManager.combinePrefsAndPlugins(pluginPrefs.plugins);
            this.store.plugins = resolvedPlugin;
        });

    }

    // TODO: wait for promise of plugins loaded?
    // checks the given url and loads the necessary plugin command
    // code into the given tabId if the url matches.
    async loadCommandCodeIntoPage(tabId: number, url: string) {
        this.store.plugins.forEach((plugin) => {
            if (_.reduce(plugin.match, (memo, matchPattern) => matchPattern.test(url) || memo, true)) {
                promisify<any>(chrome.tabs.executeScript)(tabId, {code: plugin.cs, runAt: "document_start"});
            }
        });
    }

    // TODO: when ES6 System.import is supported, switch to using that
    // load options
    // Needs to be public to keep this testable
    static _fetchPluginCode(name: string): Promise<IPlugin> {
        return new Promise((resolve, reject) => {
            var plugin;
            var request = new XMLHttpRequest();
            request.open('GET', chrome.runtime.getURL(`dist/plugins/${name.toLowerCase()}.js`), true);

            request.onload = function() {
                if (request.status >= 200 && request.status < 400) {
                    let exports = {Plugin: null};
                    eval(`${request.responseText}`);
                    // we use the [] syntax to work around exports getting renamed to background_plugin_manager
                    plugin = exports['Plugin'];
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
    static async combinePrefsAndPlugins(pluginPrefs: IPluginConfig[]): Promise<IStorePlugin[]> {
        let pluginResolvers = pluginPrefs.map((plugin) => this._fetchPluginCode(plugin.name));
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
