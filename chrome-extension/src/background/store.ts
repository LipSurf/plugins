/// <reference path="../@types/store.d.ts" />
/// <reference path="../@types/plugin-interface.d.ts" />
/// <reference path="../common/browser-interface.ts" />
import { omit, mapValues, pick } from "lodash";
import { promisify } from "../common/util";
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
        installedPlugins: [
                ['Browser', '1.0.0'],
                ['Google', '1.0.0'],
                ['Reddit', '1.0.0'],
            ].reduce((memo, [id, version]) => Object.assign(memo, {
                [id]: {
                    version,
                    enabled: true,
                    expanded: true,
                    disabledHomophones: [],
                    disabledCommands: []
                }}), {})
    };

    // fetchPlugin is only required to be set by one instance of store -- the one
    // that is responsible for updating the local cache (such as just the background
    // page, instead of both the background page and the options page, etc.)
    constructor(private fetchPlugin: (id: string, version: string) => Promise<ILocalPluginData> = null) {
        storage.sync.registerOnChangeCb((changes) => {
            // changes is not used currently, may be later

            if (this.fetchPlugin) {
                // might need to fetch new plugins
                this.rebuildLocalPluginCache().then(async () => {
                    await this.getPluginsConfig(true);
                    this.publish();
                });
            } else {
                this.getPluginsConfig(true).then(() => this.publish());
            }
        });
    }

    // the initial get (should only be called at extension startup or when preferences change)
    // saves to settings
    async rebuildLocalPluginCache(): Promise<void> {
        let [syncData, localData] = await this.getStoredOrDefault();
        // digest plugins that don't match what we have in the
        // local settings already
        // in case versions have changed (for example remotely)
        let neededPluginIds = Object.keys(syncData.installedPlugins);

        let toInstallPluginIds = neededPluginIds.filter(id =>
            typeof localData.pluginData[id] === 'undefined'
            || localData.pluginData[id].version !== syncData.installedPlugins[id].version
        );

        Object.assign(localData.pluginData, (await Promise.all(toInstallPluginIds.map(async (id: string) =>
            ({ id, ...(await this.fetchPlugin(id, syncData.installedPlugins[id].version)) })
        ))).reduce((memo, x) => { memo[x.id] = omit(x, 'id'); return memo }, {}));

        // TODO: purge sync data for plugins that are uninstalled?

        // convert to JSON safe values
        let serializedLocalData = Object.assign(localData, {
            pluginData: mapValues(localData.pluginData, (val:any, id, obj) => {
                val.match = val.match.map(x => x.toString().substr(1, val.match.toString().length - 2))
                val.commands.map((cmd) => {
                    if (cmd.nice)
                        cmd.nice = cmd.nice.toString();
                    if (cmd.run)
                        cmd.run = cmd.run.toString();
                    // make function matchers not in an array so we can distinguish them during deserialization
                    // distinguish them
                    cmd.match = typeof cmd.match === 'function' ? cmd.match.toString() : cmd.match.map(cmd => cmd.toString());
                    return cmd;
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
                ... pick(_localPluginData, 'friendlyName', 'match', 'cs', 'description', ),
                ... pick(_syncPluginData, 'expanded', 'version', 'enabled'),
            }
        });
    }

    private async getStoredOrDefault(): Promise<[ISyncData, ILocalData]> {
        let syncData: ISyncData = (await (storage.sync.load)('installedPlugins'));
        if (!syncData || Object.keys(syncData).length == 0) {
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
            pluginData: mapValues(serializedLocalData.pluginData, (val: any, id, pluginData) => {
                val.match = val.match.map(matchItem => RegExp(matchItem));
                val.commands = val.commands.map(cmd => {
                    if (cmd.nice)
                        eval(`cmd.nice = ${cmd.nice}`);
                    if (typeof cmd.match === 'string')
                        cmd.match = eval(cmd.match);
                    return cmd;
                });
                return val;
            }),
        });
        return [syncData, <ILocalData>localData];
    }

    async getPluginsConfig(forceRefresh = false): Promise<IPluginConfig[]> {
        if (!this.pluginsConfig || forceRefresh) {
            let [syncData, localData] = await this.getStoredOrDefault();
            this.pluginsConfig = this.transformToPluginsConfig(localData.pluginData, syncData.installedPlugins);
        }
        return this.pluginsConfig;
    }

    // save user preference changes
    async save(data: ISyncData) {
        await promisify(storage.sync.save)(data);
        this.pluginsConfig = await this.getPluginsConfig(true);
        this.publish();
    }

    // publish changes
    publish() {
        this.listeners.forEach((fn) => fn(this.pluginsConfig));
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

    constructor(public store: Store) {
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
