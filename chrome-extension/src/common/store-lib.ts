import { storage } from "./browser-interface";
import { omit, mapValues, pick } from "lodash";
import { objectAssignDeep } from "./util";

export const GENERAL_PREFERENCES = {
    language: <LanguageCode>"en-US",
    showLiveText: true,
    noHeadphonesMode: false,
    tutorialMode: 1,
    inactivityAutoOffMins: 20,
};

const DEFAULT_PREFERENCES = {
    ... GENERAL_PREFERENCES,
    plugins: <IndexedPlugins>[
            ['Browser', '1.0.0'],
            ['Google', '1.0.0'],
            ['Reddit', '1.0.0'],
            ['Wanikani', '1.0.0'],
        ].reduce((memo, [id, version]) => Object.assign(memo, {
            [id]: {
                version,
                enabled: true,
                expanded: false,
                showMore: false,
                disabledHomophones: [],
                disabledCommands: []
            }}), {})
};

// aren't exposed in the getOptions meta API call for plugins
// but exposed in the internal getOptions
const SHARED_LOCAL_DATA = {
    // is the plugin "on"
    activated: false,
    // we need to download a lang pack for the selected language
    missingLangPack: false,
    // user has given permission to download the lang pack
    confirmLangPack: false,
    // busy downloading a new lang pack
    busyDownloading: false,
    // if there is some kind of error that needs attention in the options
    problem: false,
}

// data to be persisted in the extension that is not user prefs (those are synced) 
// not exposed in getOptions
const DEFAULT_LOCAL_DATA = {
    ... SHARED_LOCAL_DATA,
    pluginData: <{[id: string]: ILocalPluginData}>{},
    langData: null,
}


export type IGeneralPreferences = typeof GENERAL_PREFERENCES;
type ISharedLocalData = typeof SHARED_LOCAL_DATA;
// this is what's saved in chrome.syncdata
// all the user preferences for a plugin
// (we don't store the entire plugin code as there's a limit to the chrome syncdata space)
export type ISyncData = typeof DEFAULT_PREFERENCES;
export type ILocalData = typeof DEFAULT_LOCAL_DATA;

/*
 *  Houses the shape of the options -- that is used internally 
 *  the version that can be retrieved via plugin meta api should be slightly different (hide some props)
 */
export interface IOptions extends IGeneralPreferences, ISharedLocalData {
    plugins: IPluginConfig[];
}


function transformToPluginsConfig(localPluginData: { [id: string]: ILocalPluginData }, syncPluginData: { [id: string]: ISyncPluginData }): IPluginConfig[] {
    return Object.keys(localPluginData).map((id: string) => {
        let _localPluginData = localPluginData[id];
        let _syncPluginData = syncPluginData[id];
        return {
            id,
            commands: mapValues(_localPluginData.commands, (cmd, cmdName) =>
                Object.assign({
                    enabled: !_syncPluginData.disabledCommands.includes(cmdName),
                }, cmd)
            ),
            localized: mapValues(_localPluginData.localized, (langData, lang) => 
                Object.assign(langData, {
                    homophones: Object.keys(langData.homophones || {}).map(homoSource =>
                        ({
                            enabled: !_syncPluginData.disabledHomophones.includes(homoSource),
                            source: homoSource,
                            destination: langData.homophones[homoSource],
                        })
                    ),
                })
            ),
            match: _localPluginData.match.map(matchStr => new RegExp(matchStr)),
            ... pick(_localPluginData, 'cs', ),
            ... pick(_syncPluginData, 'expanded', 'version', 'enabled', 'showMore', 'settings'),
        }
    });
}

export async function getStoredOrDefault(): Promise<[ISyncData, ILocalData]> {
    let [syncData, serializedLocalData] = await Promise.all([storage.sync.load<ISyncData>(), storage.local.load()]);
    let localData = deserialize(serializedLocalData);
    syncData = objectAssignDeep(null, DEFAULT_PREFERENCES, syncData);
    if (!localData || !localData.pluginData) {
        localData = DEFAULT_LOCAL_DATA;
    }
    return [syncData, localData];
}


export function deserialize(serializedLocalData: StoreSerialized<ILocalData>): ILocalData {
    // parse serialized regex/fns
    return Object.assign(serializedLocalData, {
        pluginData: mapValues(serializedLocalData.pluginData, (val, id, pluginData) => {
            return {
                ... val,
                match: val.match.map(matchItem => RegExp(matchItem)),
                localized: mapValues(val.localized, local => {
                    return {
                        ...local,
                        matchers: mapValues(local.matchers, matcher => {
                            if (matcher.nice)
                                eval(`matcher.nice = ${matcher.nice}`);
                            if (typeof matcher.match === 'string')
                                matcher.match = eval(matcher.match);
                            return matcher;
                        }),
                    };
                }),
            };
        }),
    });
}

// cannot handle rebuilding local plugin cache, that's for store.ts to do
export async function getOptions(): Promise<IOptions> {
    let [syncData, localData] = await getStoredOrDefault();
    return {
        ... syncData,
        plugins: transformToPluginsConfig(localData.pluginData, syncData.plugins),
        ... <typeof SHARED_LOCAL_DATA>pick(localData, Object.keys(SHARED_LOCAL_DATA))
    }
}
