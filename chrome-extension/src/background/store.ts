/// <reference path="../@types/store.d.ts" />
/// <reference path="../common/browser-interface.ts" />
import * as _ from "lodash";
import { storage } from "../common/browser-interface";

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
    private pluginsConfig: IPluginConfig[];
    private listeners: ((plugins?: IPluginConfig[]) => void)[] = [];

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

    // the initial get (should only be called at extension startup or when preferences change)
    // saves to settings
    async rebuildLocalPluginCache(fetchPlugin: (id: string, version: string) => Promise<ILocalPluginData>): Promise<void> {
        let [syncData, localData] = await this.getStoredOrDefault();
        // digest plugins that don't match what we have in the 
        // local settings already
        // in case versions have changed (for example remotely)
        let neededPluginIds = Object.keys(syncData.installedPlugins);

        let toInstallPluginIds = neededPluginIds.filter(id =>
            typeof localData.pluginData[id] === 'undefined'
            || localData.pluginData[id].version !== syncData.installedPlugins[id].version
        );

        // also purges plugins we don't need anymore
        localData.pluginData = (await Promise.all(toInstallPluginIds.map(async (id: string) =>
            ({ id, ...(await fetchPlugin(id, syncData.installedPlugins[id].version)) })
        ))).reduce((memo, x) => { memo[x.id] = _.omit(x, 'id'); return memo }, {});

        // TODO: purge sync data for plugins that are uninstalled?

        // convert to JSON safe values
        let serializedLocalData = Object.assign(localData, {
            pluginData: _.mapValues(localData.pluginData, (val:any, id, obj) => {
                val.match = val.match.map(x => x.toString().substr(1, val.match.toString().length - 2))
                val.commands.map((cmd) => {
                    if (cmd.nice)
                        cmd.nice = cmd.nice.toString();
                    if (cmd.run) 
                        cmd.run = cmd.run.toString();
                    // make function matchers not in an array so we can distinguish them during deserialization
                    // distinguish them
                    return typeof cmd.match === 'function' ? cmd.match.toString() : cmd.match.map(cmd => cmd.toString());
                });
                return val
            })
        });

        // now save the newly rebuilt cache
        await (storage.local.save)(localData);
    }

    private transformToPluginsConfig(localPluginData: { [id: string]: ILocalPluginData }, syncPluginData: { [id: string]: ISyncPluginData }) {
        return Object.keys(localPluginData).map((id: string) => {
            let _localPluginData = localPluginData[id];
            let _syncPluginData = syncPluginData[id];
            return {
                id,
                commands: _localPluginData.commands.map(cmd =>
                    Object.assign({
                        enabled: !_syncPluginData.disabledCommands.includes(cmd.name),
                    }, cmd)
                ),
                homophones: Object.keys(_localPluginData.homophones).map(homo =>
                    Object.assign({
                        enabled: !_syncPluginData.disabledHomophones.includes(homo),
                        source: homo,
                        destination: _localPluginData.homophones[homo],
                    })
                ),
                ..._.pick(_localPluginData, 'friendlyName', 'match', 'cs', 'description', ),
                ..._.pick(_syncPluginData, 'expanded', 'version', 'enabled'),
            }
        });
    }

    private async getStoredOrDefault(): Promise<[ISyncData, ILocalData]> {
        let syncData: ISyncData = (await (storage.sync.load)('installedPlugins'));
        if (!(_.get(syncData, 'keys().length', 0) > 0)) {
            syncData = Store.DEFAULT_PREFERENCES;
        }
        let serializedLocalData: Partial<ISerializedLocalData> = (await (storage.local.load)('pluginData'));
        if (!serializedLocalData || !serializedLocalData.pluginData) {
            serializedLocalData = {
                pluginData: {},
                activated: false,
            }
        }
        // parse serialized regex/fns
        let localData = Object.assign(serializedLocalData, {
            pluginData: _.mapValues(serializedLocalData.pluginData, (val: any, id, pluginData) => {
                val.match = typeof val.match === 'string' ? eval(val.match) : val.match.map(matchItem => RegExp(matchItem));
                val.commands = val.commands.map(cmd => {
                    if (cmd.nice) 
                        cmd.nice = eval(cmd.nice);
                    if (cmd.run)
                        cmd.run = eval(cmd.run)
                    return cmd;
                });
                return val;
            }),
        });
        return [syncData, <ILocalData>localData];
    }

    async getPluginsConfig(): Promise<IPluginConfig[]> {
        if (!this.pluginsConfig) {
            let [syncData, localData] = await this.getStoredOrDefault();
            this.pluginsConfig = this.transformToPluginsConfig(localData.pluginData, syncData.installedPlugins);
        }
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
        this.store.getPluginsConfig().then(pluginsConfig => {
            this.storeUpdated(pluginsConfig);
        })
        this.store.subscribe((newPluginsConfig) => {
            this.storeUpdated(newPluginsConfig);
        });
    }

    // We use init instead of a constructor because storeUpdated is called before the 
    // constructor is called on the inheriting class, so this init allows things 
    // to be initialized before storeUpdated (basically a constructor)
    protected init() { }

    // override this
    protected storeUpdated(newPluginsConfig: IPluginConfig[]) {

    }
}
