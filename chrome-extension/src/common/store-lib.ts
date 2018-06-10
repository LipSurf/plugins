import { storage } from "./browser-interface";
import { omit, mapValues, pick } from "lodash";
import { objectAssignDeep } from "./util";

const DEFAULT_PREFERENCES: ISyncData = {
    language: "en-US",
    showLiveText: true,
    noHeadphonesMode: false,
    tutorialMode: 1,
    inactivityAutoOffMins: 20,
    plugins: [
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
        localData = {
            pluginData: {},
            activated: false,
        };
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
    }
}
