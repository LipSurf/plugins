/// <reference path="../@types/store.d.ts" />
/// <reference path="../common/browser-interface.ts" />
/// <reference path="./plugin-manager.ts" />
import * as _ from "lodash";
import { storage } from "../common/browser-interface";
import { PluginManager } from "./plugin-manager";

// combined local and sync settings in a form that's
// easily digestable by the consumers: options page, PM, Recg
export interface IPluginConfig extends IDisableable, IToggleableHomophones {
    id: string,
    friendlyName: string,
    expanded: boolean,
    version: string,
    match: RegExp[],
    cs: string,
    commands: IPluginConfigCommand[],
    description?: string,
}

export interface IPluginConfigCommand extends ICommonCommand, IDisableable {

}

export interface IToggleableHomophones {
    homophones?: {
        enabled: boolean,
        source: string,
        destination: string,
    }[],
}

/* 
 *  User preferences as well as parsed plugins
 */
export class Store {
    public pluginsConfig: IPluginConfig[];
    private listeners: ((plugins?: IPluginConfig[]) => void)[] = [];

    constructor(private fetchPlugin: (id: string, version: string) => Promise<ILocalPluginData>) { }

    static DEFAULT_PREFERENCES: ISyncData = {
        showLiveText: true,
        installedPlugins: {
            'Browser': {
                version: '1.0.0',
                enabled: true,
                expanded: true,
                disabledCommands: [],
                disabledHomophones: []
            },
            'Reddit': {
                version: '1.0.0',
                enabled: true,
                expanded: true,
                disabledCommands: [],
                disabledHomophones: []
            },
        }
    };

    // set plugins(plugins: IStorePlugin[]) {
    //     this._plugins = plugins;
    //     this.listeners.forEach((fn) => fn(this._plugins));
    //     storage.local.save({'store-plugin': plugins});
    // }
    // async setPreferences(preferences: IUserPreferences) {
    //     return await storage.remote.save(preferences);
    // }


    // the initial get (should only be called at startup or when preferences change?)
    async getPluginsConfig(): Promise<IPluginConfig[]> {
        let pluginPrefs: ISyncData = (await (storage.sync.load)('installedPlugins'));
        if (!(_.get(pluginPrefs, 'keys().length', 0) > 0)) {
            pluginPrefs = Store.DEFAULT_PREFERENCES;
        }
        let localData: ILocalData = (await (storage.local.load)('pluginData'));
        if (!localData || !localData.pluginData) {
            localData = {
                pluginData: {},
                activated: false,
            }
        }
        // digest plugins that don't match what we have in the 
        // local settings already
        // in case versions have changed (for example remotely)
        let localPluginIds = Object.keys(_.get(localData, 'pluginData', {}));
        let neededPluginIds = Object.keys(pluginPrefs.installedPlugins);

        let toInstallPluginIds = neededPluginIds.filter(id =>
            typeof localData.pluginData[id] === 'undefined'
            || localData.pluginData[id].version !== pluginPrefs.installedPlugins[id].version
        );

        localData.pluginData = (await Promise.all(toInstallPluginIds.map(async (id: string) =>
            ({ id, ...(await this.fetchPlugin(id, pluginPrefs.installedPlugins[id].version)) })
        ))).reduce((memo, x) => { memo[x.id] = _.omit(x, 'id'); return memo }, {});

        // purge plugins we don't need anymore
        // ... TODO

        this.pluginsConfig = Object.keys(localData.pluginData).map((id: string) => {
            let localPluginData = localData.pluginData[id];
            let syncPluginData = pluginPrefs.installedPlugins[id];
            return {
                id,
                commands: localPluginData.commands.map(cmd =>
                    Object.assign({
                        enabled: !syncPluginData.disabledCommands.includes(cmd.name),
                    }, cmd)
                ),
                homophones: Object.keys(localPluginData.homophones).map(homo =>
                    Object.assign({
                        enabled: !syncPluginData.disabledHomophones.includes(homo),
                        source: homo,
                        destination: localPluginData.homophones[homo],
                    })
                ),
                ..._.pick(localPluginData, 'friendlyName', 'match', 'cs', 'description', ),
                ..._.pick(syncPluginData, 'expanded', 'version', 'enabled'),
            }
        });
        return this.pluginsConfig;
    }

    // TODO: is this the right publish that we want?
    publish(newIPluginConfig: IPluginConfig[]) {
        this.listeners.forEach((fn) => fn(newIPluginConfig));
    }

    resetPreferences() {
        chrome.storage.local.clear();
    }

    // call fn when pluginconfig changes
    subscribe(fn: (plugins: IPluginConfig[]) => void) {
        this.listeners.push(fn);
    }
}

export class StoreSynced {

    constructor(private store: Store) {
        // call once on initial load so plugin data is ready
        this.init();
        this.storeUpdated(this.store.pluginsConfig);
        this.store.subscribe((newPluginsConfig) => {
            this.storeUpdated(newPluginsConfig);
        });
    }

    // We use init instead of a constructor because storeUpdated is called before the 
    // constructor is called on the inheriting class, so this init allows things 
    // to be initialized before storeUpdated (basically a constructor)
    protected init() {}

    // override this
    protected storeUpdated(newPluginsConfig: IPluginConfig[]) {

    }
}
