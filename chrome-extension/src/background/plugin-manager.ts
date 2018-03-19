/*
 * Resolve remote plugins into configurable objects and save/load this configuration
 * so it persists across chrome sessions.
 */
import * as _ from "lodash";
import { Store } from "./store";
import { Preferences } from "./preferences";
import { promisify } from "../common/util";

// HACK
class PluginBase {
    static friendlyName =  '';
    static description = '';
    static version = '';
    static match = /^$/;

    static commands = [];
    static homophones = {};
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

    // Make more useable "PluginStore" by combining condensed preferences
    // with remote plugin code
    static async combinePrefsAndPlugins(pluginPrefs: IPluginConfig[]): Promise<IStorePlugin[]> {
        // and transform into a plugin object in the form that it is used
        return Promise.all(pluginPrefs.map(async (pluginPrefs) => {
            let plugin = this.evalPluginCode(pluginPrefs.id, (await this.fetchPluginCode(pluginPrefs.id)));
            // everything that the user declares in the class
            // that might be shared in command run code.
            let commandsStr = plugin.commands
                    .filter((cmd) => cmd.runOnPage)
                    .map((cmd) => `'${cmd.name}': ${cmd.runOnPage.toString()}`);
            // members that the plugin uses internally (shared across commands)
            let privateMembers = Object.keys(plugin)
                    .filter((member) => typeof PluginBase[member] === 'undefined')
                    .map((member) => `${pluginPrefs.id}Plugin.${member} = ${plugin[member] ? plugin[member].toString(): plugin[member]};`);
            let initStr = plugin.init.toString();
            let csStr = `window.${pluginPrefs.id}Plugin = class ${pluginPrefs.id}Plugin {};
                    ${pluginPrefs.id}Plugin.commands = {${commandsStr.join(',')}};
                    ${privateMembers.join('\n')}
                    ${initStr.substr(0, initStr.lastIndexOf('}')).replace('init() {', '')};
                     `;
            return {
                id: pluginPrefs.id,
                enabled: true,
                commands: plugin.commands.map((cmd: ICommand) => {
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
                homophones: Object.keys(plugin.homophones).map((key, index) => {
                    return {
                        enabled: true,
                        source: key,
                        destination: plugin.homophones[key],
                    };
                }),
                match: _.flatten([plugin.match]),
                ... _.pick(plugin, 'friendlyName')
            };
        }));
    }
}
