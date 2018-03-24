/// <reference path="./background/store.ts" />
/*
 * Included in the options.html script
 */
declare var riot: any;
import * as _ from "lodash";
import { Store, StoreSynced, IPluginConfig } from "./background/store";

// what's shown on the options page
interface IPluginOptionsPageStore {
    cmdGroups: IPluginPref[]
}

interface IPluginPref {
    expanded: boolean,
    enabled: boolean,
    friendlyName: string,
    version: string,
    commands: ICommandPref[]
    description?: string,
    homophones?: IHomophonePref[]
}

interface ICommandPref {
    enabled: boolean,
    name: string,
    match: string | string[],
    description?: string,
}

interface IHomophonePref {
    enabled: boolean,
    source: string,
    destination: string,
}


class OptionsPage extends StoreSynced {
    constructor(store: Store, private options: IPluginOptionsPageStore = <IPluginOptionsPageStore>{}) {
        super(store);
    }

    storeUpdated(newPluginsConfig: IPluginConfig[]) {
        Object.assign(this.options,  {
            cmdGroups: newPluginsConfig.map(plugin => ({
                    commands: _.map(plugin.commands, cmd => ({
                        match: typeof cmd.match !== 'function' ? cmd.match : '',
                        ... _.pick(cmd, 'enabled', 'name', 'description'),
                    })),
                    ... _.pick(plugin, 'version', 'expanded', 'enabled', 'friendlyName', 'description', 'homophones'),
            })),
        });
        riot.mount('options-page', this.options);
        // riot
    }
}


let store = new Store();
new OptionsPage(store);

// function _save(obj) {
//     // store.set
//     // chrome.storage.local.set({'cmdGroups': obj}, function() {
//     //     console.log("Settings saved " + JSON.stringify(obj));
//     // });
// }


// function _reset() {
//     store.resetPreferences();
// }



chrome.storage.onChanged.addListener(function (changes, namespace) {
    console.log("Chrome storage changes");
    for (let key in changes) {
        var storageChange = changes[key];
        console.log('Storage key "%s" in namespace "%s" changed. ' +
            'Old value was "%s", new value is "%s".',
            key,
            namespace,
            storageChange.oldValue,
            storageChange.newValue);
    }
});



// store.getPreferences().then((prefs) => {
//     let pluginData = store.plugins;
//     let combined = {
//         cmdGroups: pluginData.map((plugin) => {
//             let {disabledCommands, disabledHomophones, expanded, enabled} = prefs.plugins[plugin.id];
//             let ret:IPluginPref = {
//                 commands: plugin.commands.map((cmd) => {
//                     let ret: any = _.pick(cmd, ['name', 'match']);
//                     ret.enabled = ~disabledCommands.indexOf(cmd.name);
//                     return ret;
//                 }),
//                 homophones: plugin.homophones
//                     .map((homo) => {
//                         return { 
//                             enabled: ~disabledHomophones.indexOf(homo.source),
//                             ...homo 
//                         }
//                     }
//                 ),
//                 enabled,
//                 expanded,
//                 ... _.pick(plugin, ['friendlyName', 'description'])
//             };
//             return ret;
//         }),
//     };
//     startup(combined);
// });