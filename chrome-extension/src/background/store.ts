/// <reference path="../@types/store.d.ts" />
/// <reference path="../common/browser-interface.ts" />
import { mapValues, pick, flatten, assignIn, zip, fromPairs, isEqual, omit } from "lodash";
import { instanceOfDynamicMatch, objectAssignDeep, difference, promiseSerial } from "../common/util";
import { getOptions, getStoredOrDefault, IOptions, GENERAL_PREFERENCES, SHARED_LOCAL_DATA, ILocalData, ISyncData, createDefaultSyncPrefs } from "../common/store-lib";
import { storage } from "../common/browser-interface";


/*
 *  User preferences as well as parsed plugins
 */
export class Store {
    private options: IOptions;
    private listeners: {[id: number]: ((plugins?: IOptions) => void)} = {};
    // we need to keep track of the last one, because if the same author submits two changes in a row, we don't get the
    // author id the 2nd time because it hasn't changed
    private lastSyncAuthorId = null;
    private lastLocalAuthorId = null;

    // fetchPlugin is only required to be set by one instance of store -- the one
    // that is responsible for updating the local cache (such as just the background
    // page, instead of both the background page and the options page, etc.)
    constructor(fetchAndDigestPlugin: (id: string, version: string) => Promise<ILocalPluginData> = null) {
        storage.sync.registerOnChangeCb((changes) => {
            // changes is not used currently, maybe later
            this.lastLocalAuthorId = changes.authorId ? changes.authorId.newValue : this.lastLocalAuthorId;

            if (Object.keys(omit(changes, 'authorId')).length > 0) {
                if (fetchAndDigestPlugin) {
                    // might need to fetch new plugins
                    this.rebuildLocalPluginCache(fetchAndDigestPlugin).then(() => {
                        this.getOptions(true).then(() => this.publish(this.lastSyncAuthorId));
                    });
                } else {
                    this.getOptions(true).then(() => this.publish(this.lastSyncAuthorId));
                }
            }
        });
        storage.local.registerOnChangeCb((changes) => {
            this.lastSyncAuthorId = changes.authorId ? changes.authorId.newValue : this.lastSyncAuthorId;
            if (Object.keys(omit(changes, 'authorId')).length > 0) {
                // handles changes such as missingLangPack
                this.getOptions(true).then(() => this.publish(this.lastSyncAuthorId));
            }
        });
    }

    // the initial get (should only be called at extension startup or when preferences change)
    // saves to settings
    async rebuildLocalPluginCache(fetchAndDigestPlugin: (id: string, version: string) => Promise<ILocalPluginData>): Promise<void> {
        let [syncData, localData] = await getStoredOrDefault();
        // digest plugins that don't match what we have in the
        // local settings already
        // in case versions have changed (for example remotely)
        let neededPluginIds = Object.keys(syncData.plugins);

        let toInstallPluginIds = neededPluginIds.filter(id =>
            typeof localData.pluginData[id] === 'undefined'
            || localData.pluginData[id].version !== syncData.plugins[id].version
        );

        let newlyInstalledLocalPluginData = await Promise.all(
            toInstallPluginIds.map(
                async (id: string) => await fetchAndDigestPlugin(id, syncData.plugins[id].version)
            )
        );

        let idToNewPlugins = fromPairs(zip(toInstallPluginIds, newlyInstalledLocalPluginData));
        if (toInstallPluginIds.length > 0) {
            this.installNewPlugins(idToNewPlugins, false);
        }

        // TODO: purge sync data for plugins that are uninstalled?
    }

    async installNewPlugins(idToNewPlugins: {[id: string]: ILocalPluginData}, sync=true): Promise<void> {
        let [syncData, localData] = await getStoredOrDefault();
        let serializedLocalData: any = {};

        // extend the existing plugins with the new ones
        assignIn(localData.pluginData, idToNewPlugins);

        // serialize data
        serializedLocalData = {
            ... pick(localData),
            pluginData: mapValues(localData.pluginData, localPluginData => {
                return Object.assign(localPluginData, {
                    // regex need to get rid of / at head and tail
                    match: localPluginData.match.map(x => x.toString().substr(1, localPluginData.match.toString().length - 2)),
                    commands: mapValues(localPluginData.commands, cmd => {
                        let obj:any = Object.assign({}, cmd);
                        if (cmd.fn)
                            obj.fn = cmd.fn.toString();
                        return obj;
                    }),
                    localized: mapValues(localPluginData.localized, local => {
                        return {
                            ...local,
                            matchers: mapValues(local.matchers, (matcher:IMatcher) => {
                                let obj = {
                                    ... matcher,
                                    match: instanceOfDynamicMatch(matcher.match) ? { ...matcher.match, fn: matcher.match.fn.toString()} : matcher.match,
                                };
                                if (matcher.nice) {
                                    if (typeof matcher.nice === 'string') {
                                        obj.nice = matcher.nice;
                                    } else {
                                        // it's a function
                                        // @ts-ignore
                                        obj.nice = { fn: matcher.nice.toString() };
                                    }
                                }
                                return obj;
                            }),
                        }
                    }),
                });
            }),
        };

        // now save the newly rebuilt cache
        let promises = [storage.local.save(serializedLocalData)];

        // save to sync as well
        if (sync) {
            let newSyncData = Object.keys(idToNewPlugins).reduce((memo, id) => Object.assign(memo, createDefaultSyncPrefs(id, idToNewPlugins[id].version)), {})
            promises.push(storage.sync.save({plugins: Object.assign(syncData.plugins, newSyncData)}));
        }

        Promise.all(promises);
    }

    async getOptions(forceRefresh = false): Promise<IOptions> {
        if (!this.options || forceRefresh) {
            this.options = await getOptions();
        }
        return this.options;
    }

    // save user preference changes
    // don't need to include DEFAULT_PREFERENCES because those are used on loads only
    async save(partialOptions: NestedPartial<IOptions>, authorId:number = null) {
        // first merge plugin arrays manually -- otherwise the arrays just get overwritten naively by the latest merge obj
        if (partialOptions.plugins) {
            partialOptions.plugins = partialOptions.plugins.map(plugin => {
                let merger = this.options.plugins.find(x => x.id === plugin.id);
                if (merger)
                    return objectAssignDeep({}, merger, plugin);
                return plugin;
            });
        }

        let promises:Promise<any>[] = [];
        let localPicked:Partial<StoreSerialized<ILocalData>> = pick(partialOptions, Object.keys(SHARED_LOCAL_DATA));
        let syncPicker = (options) => {
            let ret;
            if (options.plugins) {
                ret = {
                    plugins: options.plugins.reduce((memo, plugin) => {
                        memo[plugin.id] = {
                            disabledCommands: Object.keys(plugin.commands).filter(x => !plugin.commands[x].enabled),
                            disabledHomophones: flatten(Object.keys(plugin.localized).map(lang => plugin.localized[lang].homophones.filter(x => !x.enabled).map(x => x.source))),
                            ... pick(plugin, 'enabled', 'version', 'expanded', 'showMore', 'settings')
                        };
                        return memo;
                    }, {}),
                };
            } else {
                ret = {};
            }
            return {...ret, ...pick(options, Object.keys(GENERAL_PREFERENCES))};
        };
        let syncPicked = syncPicker(partialOptions);

        if (Object.keys(localPicked).length > 0) {
            // console.log(`local difference detected ${JSON.stringify(localPicked)}`);

            // does not do pluginData or langData
            promises.push(storage.local.save(localPicked, authorId));
        }

        if (Object.keys(syncPicked).length > 0) {
            // console.log(`sync difference detected ${JSON.stringify(syncPicked)}`);
            // extract just the sync part from options
            promises.push(storage.sync.save(syncPicked, authorId));
        }

        if (promises.length > 0) {
            await Promise.all(promises);
        } else {
            console.log("store -- no change detected, not publishing options changes");
        }
    }

    // publish changes (exclude an authorId, the author of the changes)
    publish(excludeId:number = null) {
        promiseSerial(Object.values(omit(this.listeners, excludeId)).map(fn => fn.bind(null, this.options)));
    }

    async resetPreferences() {
        await Promise.all([storage.sync.clear(), storage.local.clear()]);
        this.options = await this.getOptions(true);
        this.publish();
    }

    // returns a unique author id that the subscriber should use
    // call fn when pluginconfig changes
    subscribe(fn: (plugins: IOptions) => void): number {
        let id = Math.ceil(Math.random() * Number.MAX_SAFE_INTEGER);
        this.listeners[id] = fn;
        return id;
    }
}

export abstract class StoreSynced {

    private authorId: number;
    // fulfilled when the initial load has happened (useful to make sure stuff
    // doesn't happen until then)
    private initialLoadResolver = () => undefined;
    protected initialLoad: Promise<any> = new Promise((resolve, reject) => {
        this.initialLoadResolver = resolve;
    });

    constructor(public store: Store) {
        // call once on initial load so plugin data is ready
        this.init();
        this.store.getOptions().then(async options => {
            await this.storeUpdated(options);
            this.initialLoadResolver()
        });
        this.authorId = this.store.subscribe(async newOptions => {
            await this.storeUpdated(newOptions);
        });
    }

    protected save(partialOptions:NestedPartial<IOptions>) {
        this.store.save(partialOptions, this.authorId)
    }

    // We use init instead of a constructor because storeUpdated is called before the
    // constructor is called on the inheriting class, so this init allows things
    // to be initialized before storeUpdated (basically a constructor)
    protected init() { }

    // override this
    protected async storeUpdated(newOptions: IOptions) {

    }
}
