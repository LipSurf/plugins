/// <reference path="../@types/store.d.ts" />
/// <reference path="../common/browser-interface.ts" />
import { mapValues, pick, flatten, assignIn, zip, fromPairs } from "lodash";
import { instanceOfDynamicMatch, objectAssignDeep} from "../common/util";
import { getOptions, getStoredOrDefault, IOptions, } from "../common/store-lib";
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
        storage.local.registerOnChangeCb((changes) => {
            // handles changes such as missingLangPack, confirmLangPack, problem etc.
            this.getOptions(true).then(() => this.publish());
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
        let serializedLocalData: any = {};

        let toInstallPluginIds = neededPluginIds.filter(id =>
            typeof localData.pluginData[id] === 'undefined'
            || localData.pluginData[id].version !== syncData.plugins[id].version
        );

        let newlyInstalledLocalPluginData = await Promise.all(
            toInstallPluginIds.map(
                async (id: string) => await this.fetchPlugin(id, syncData.plugins[id].version)
            )
        );

        let idToNewPlugins = fromPairs(zip(toInstallPluginIds, newlyInstalledLocalPluginData));

        // TODO: purge sync data for plugins that are uninstalled?

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
                        if (cmd.run)
                            obj.run = cmd.run.toString();
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
                                    // @ts-ignore
                                    obj.nice = matcher.nice.toString();
                                }
                                return obj;
                            }),
                        }
                    }),
                });
            }),
        };

        // now save the newly rebuilt cache
        await (storage.local.save)(serializedLocalData);
    }

    async getOptions(forceRefresh = false): Promise<IOptions> {
        if (!this.options || forceRefresh) {
            this.options = await getOptions();
        }
        return this.options;
    }

    // save user preference changes
    // don't need to include DEFAULT_PREFERENCES because those are used on loads only
    async save(partialOptions: NestedPartial<IOptions>) {
        console.log(`saving options ${JSON.stringify(partialOptions)}`);
        // first merge plugin arrays manually -- otherwise the arrays just get overwritten naively by the latest merge obj
        if (partialOptions.plugins) {
            partialOptions.plugins = partialOptions.plugins.map(plugin => {
                let merger = this.options.plugins.find(x => x.id === plugin.id);
                if (merger) 
                    return objectAssignDeep({}, merger, plugin);
                return plugin;
            });
        }
        objectAssignDeep(this.options, partialOptions);

        let localSave = storage.local.save({
            ...pick(partialOptions, 'activated', 'missingLangPack', 'confirmLangPack', 'busyDownloading', 'problem')
        });

        // extract just the sync part from options
        // not sure why this has a ts error
        // @ts-ignore
        let syncSave = storage.sync.save({
            plugins: this.options.plugins.reduce((memo, plugin) => {
                memo[plugin.id] = {
                    disabledCommands: Object.keys(plugin.commands).filter(x => !plugin.commands[x].enabled),
                    disabledHomophones: flatten(Object.keys(plugin.localized).map(lang => plugin.localized[lang].homophones.filter(x => !x.enabled).map(x => x.source))),
                    ... pick(plugin, 'enabled', 'version', 'expanded', 'showMore', 'settings')    
                };
                return memo;
            }, {}),
            ... pick(this.options, 'language', 'showLiveText', 'noHeadphonesModes', 'inactivityAutoOffMins', 'tutorialMode'),
        });

        await Promise.all([syncSave, localSave]);
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
