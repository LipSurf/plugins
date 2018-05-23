import { storage } from "./browser-interface";
import { omit, mapValues, pick } from "lodash";
import { objectAssignDeep } from "./util";


export const DEFAULT_PREFERENCES: ISyncData = {
    language: "en-US",
    showLiveText: true,
    noHeadphonesMode: false,
    tutorialMode: 1,
    inactivityAutoOffMins: 20,
    plugins: [
            ['Browser', '1.0.0'],
            ['Google', '1.0.0'],
            ['Reddit', '1.0.0'],
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


export async function getStoredOrDefault(): Promise<[ISyncData, ILocalData]> {
    let syncData = await storage.sync.load<ISyncData>();
    syncData = objectAssignDeep(null, DEFAULT_PREFERENCES, syncData);
    let serializedLocalData: Partial<ISerializedLocalData> = (await (storage.local.load)('pluginData'));
    if (!serializedLocalData || !serializedLocalData.pluginData) {
        serializedLocalData = {
            pluginData: {},
            activated: false,
        };
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

function transformToPluginsConfig(localPluginData: { [id: string]: ILocalPluginData }, syncPluginData: { [id: string]: ISyncPluginData }) {
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
            ... pick(_localPluginData, 'niceName', 'match', 'cs', 'description', 'languages', ),
            ... pick(_syncPluginData, 'expanded', 'version', 'enabled', 'showMore', 'settings'),
        }
    });
}

export async function getOptions(): Promise<IOptions> {
    let [syncData, localData] = await getStoredOrDefault();
    return {
        ... syncData,
        plugins: transformToPluginsConfig(localData.pluginData, syncData.plugins),
    }
}
