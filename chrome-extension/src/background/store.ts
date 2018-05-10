/// <reference path="../@types/store.d.ts" />
/// <reference path="../@types/plugin-interface.d.ts" />
/// <reference path="../common/browser-interface.ts" />
import { omit, mapValues, pick, reduce } from "lodash";
import { promisify, instanceOfDynamicMatch, objectAssignDeep} from "../common/util";
import { getStoredOrDefault, getOptions } from "../common/store-lib";
import { storage } from "../common/browser-interface";

/*
 *  User preferences as well as parsed plugins
 */
export class Store {
    private options: IOptions;
    private listeners: ((plugins?: IOptions) => void)[] = [];

    // fetchPlugin is only required to be set by one instance of store -- the one
    // that is responsible for updating the local cache (such as just the background
    // page, instead of both the background page and the options page, etc.)
    constructor(private fetchPlugin: (id: string, version: string) => Promise<ILocalPluginData> = null) {
        storage.sync.registerOnChangeCb((changes) => {
            // changes is not used currently, may be later

            if (this.fetchPlugin) {
                // might need to fetch new plugins
                this.rebuildLocalPluginCache().then(async () => {
                    await this.getOptions(true);
                    this.publish();
                });
            } else {
                this.getOptions(true).then(() => this.publish());
            }
        });
    }

    // the initial get (should only be called at extension startup or when preferences change)
    // saves to settings
    async rebuildLocalPluginCache(): Promise<void> {
        let [syncData, localData] = await getStoredOrDefault();
        // digest plugins that don't match what we have in the
        // local settings already
        // in case versions have changed (for example remotely)
        let neededPluginIds = Object.keys(syncData.plugins);

        let toInstallPluginIds = neededPluginIds.filter(id =>
            typeof localData.pluginData[id] === 'undefined'
            || localData.pluginData[id].version !== syncData.plugins[id].version
        );

        Object.assign(localData.pluginData, (await Promise.all(toInstallPluginIds.map(async (id: string) =>
            ({ id, ...(await this.fetchPlugin(id, syncData.plugins[id].version)) })
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
                    cmd.match = instanceOfDynamicMatch(cmd.match) ? {  ...cmd.match, fn: cmd.match.fn.toString() }  : cmd.match.map(match => match.toString());
                    return cmd;
                });
                return val
            })
        });

        // now save the newly rebuilt cache
        await (storage.local.save)(localData);
    }

    async getOptions(forceRefresh = false): Promise<IOptions> {
        if (!this.options || forceRefresh) {
            this.options = await getOptions();
        }
        return this.options;
    }

    // save user preference changes
    // don't need to include DEFAULT_PREFERENCES because those are used on loads only
    async save(partialOptions: Partial<IOptions>) {
        // first merge plugin arrays manually -- otherwise the arrays just get overwritten naively by the latest merge obj
        if (partialOptions.plugins) {
            partialOptions.plugins = partialOptions.plugins.map(plugin => {
                let merger = this.options.plugins.find(x => x.id === plugin.id);
                if (merger) 
                    return objectAssignDeep({}, merger, plugin);
                return plugin;
            });
        }
        let newOptions:IOptions = objectAssignDeep({}, this.options, partialOptions);
        // extract just the sync part from options
        await promisify(storage.sync.save)({
            ... omit(newOptions, 'plugins'),
            plugins: newOptions.plugins.reduce((memo, plugin) => {
                memo[plugin.id] = {
                    disabledCommands: plugin.commands.filter(x => !x.enabled).map(x => x.name),
                    disabledHomophones: plugin.homophones.filter(x => !x.enabled).map(x => x.source),
                    ... pick(plugin, 'enabled', 'version', 'expanded', 'showMore', 'settings')    
                };
                return memo;
            }, {}),
        });
        this.publish();
    }

    // publish changes
    publish() {
        this.listeners.forEach((fn) => fn(this.options));
    }

    async resetPreferences() {
        await Promise.all([storage.sync.clear(), storage.local.clear()]);
        this.options = await this.getOptions(true);
        this.publish();
    }

    // call fn when pluginconfig changes
    subscribe(fn: (plugins: IOptions) => void) {
        this.listeners.push(fn);
    }
}

export class StoreSynced {

    // fulfilled when the initial load has happened (useful to make sure stuff
    // doesn't happen until then)
    private initialLoadResolver = () => undefined;
    protected initialLoad: Promise<any> = new Promise((resolve, reject) => {
        this.initialLoadResolver = resolve;
    });

    constructor(public store: Store) {
        // call once on initial load so plugin data is ready
        this.init();
        this.store.getOptions().then(options => {
            this.storeUpdated(options);
            this.initialLoadResolver()
        });
        this.store.subscribe(newOptions => {
            this.storeUpdated(newOptions);
        });
    }

    // We use init instead of a constructor because storeUpdated is called before the
    // constructor is called on the inheriting class, so this init allows things
    // to be initialized before storeUpdated (basically a constructor)
    protected init() { }

    // override this
    protected storeUpdated(newOptions: IOptions) {

    }
}
