// /*
//  * Included in the options.html script
//  */
// declare var riot: any;
// import * as _ from "lodash";
// import { Store } from "./background/store";

// interface IPluginOptionsPageStore {

// }

// let store = new Store();



// function _save(obj) {
//     // store.set
//     // chrome.storage.local.set({'cmdGroups': obj}, function() {
//     //     console.log("Settings saved " + JSON.stringify(obj));
//     // });
// }


// function _reset() {
//     store.resetPreferences();
// }



// chrome.storage.onChanged.addListener(function (changes, namespace) {
//     console.log("Chrome storage changes");
//     for (let key in changes) {
//         var storageChange = changes[key];
//         console.log('Storage key "%s" in namespace "%s" changed. ' +
//             'Old value was "%s", new value is "%s".',
//             key,
//             namespace,
//             storageChange.oldValue,
//             storageChange.newValue);
//     }
// });

// // what's shown on the options page
// interface IDisplayablePref {
//     cmdGroups: IPluginPref[]
// }

// interface IPluginPref {
//     expanded: boolean,
//     enabled: boolean,
//     friendlyName: string,
//     commands: ICommandPref[]
//     description?: string,
//     homophones?: IHomophonePref[]
// }

// interface ICommandPref {
//     enabled: boolean,
//     name: string,
//     match: string | string[],
// }

// interface IHomophonePref {
//     enabled: boolean,
//     source: string,
//     destination: string,
// }


// function startup(cmdGroups: IDisplayablePref) {
//     // chrome.storage.local.get('store-plugin', function(loaded: IPluginConfig) {
//     //     startup(loaded.);
//     // });
//     riot.mount('options-page', { cmdGroups });
// }


// // store.getPreferences().then((prefs) => {
// //     let pluginData = store.plugins;
// //     let combined = {
// //         cmdGroups: pluginData.map((plugin) => {
// //             let {disabledCommands, disabledHomophones, expanded, enabled} = prefs.plugins[plugin.id];
// //             let ret:IPluginPref = {
// //                 commands: plugin.commands.map((cmd) => {
// //                     let ret: any = _.pick(cmd, ['name', 'match']);
// //                     ret.enabled = ~disabledCommands.indexOf(cmd.name);
// //                     return ret;
// //                 }),
// //                 homophones: plugin.homophones
// //                     .map((homo) => {
// //                         return { 
// //                             enabled: ~disabledHomophones.indexOf(homo.source),
// //                             ...homo 
// //                         }
// //                     }
// //                 ),
// //                 enabled,
// //                 expanded,
// //                 ... _.pick(plugin, ['friendlyName', 'description'])
// //             };
// //             return ret;
// //         }),
// //     };
// //     startup(combined);
// // });