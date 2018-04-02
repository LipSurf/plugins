/// <reference path="./background/store.ts" />
/*
 * Included in the options.html script
 */
import riot from 'riot';
import { pick }  from "lodash";
import { Store, StoreSynced, IPluginConfig } from "./background/store";
require('./tags/options-page.tag');

// what's shown on the options page
interface IPluginOptionsPageStore {
    showLiveText: boolean,
    cmdGroups: IPluginPref[]
}

interface IPluginPref {
    expanded: boolean,
    enabled: boolean,
    id: string,
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
        riot.observable(this.options);
        riot.mount('options-page', {store: this.options});
    }

    storeUpdated(newPluginsConfig: IPluginConfig[]) {
        Object.assign(this.options,  {
            cmdGroups: newPluginsConfig.map(plugin => ({
                    commands: plugin.commands.map(cmd => ({
                        match: typeof cmd.match !== 'function' ? cmd.match : '',
                        ... pick(cmd, 'enabled', 'name', 'description'),
                    })),
                    ... pick(plugin, 'version', 'expanded', 'enabled', 'friendlyName', 'id', 'description', 'homophones'),
            })),
        });
        // trigger exists once we call riot.observable
        (this.options as any).trigger('update', this.options);
    }

    save() {
        this.store.save({
            installedPlugins: this.options.cmdGroups.reduce((memo, cmdGroup) => {
                memo[cmdGroup.id] = {
                    disabledCommands: cmdGroup.commands.filter(x => !x.enabled).map(cmd => cmd.name),
                    disabledHomophones: cmdGroup.homophones.filter(x => !x.enabled).map(homo => homo.source),
                    ... pick(cmdGroup, 'version', 'expanded', 'enabled'),
                };
                return memo;
            }, {}),
            ... pick(this.options, 'showLiveText'),
        });
    }
}


let store = new Store();
let options = new OptionsPage(store);

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

// so riot can access the options as well
window['options'] = options;


// store.getPreferences().then((prefs) => {
//     let pluginData = store.plugins;
//     let combined = {
//         cmdGroups: pluginData.map((plugin) => {
//             let {disabledCommands, disabledHomophones, expanded, enabled} = prefs.plugins[plugin.id];
//             let ret:IPluginPref = {
//                 commands: plugin.commands.map((cmd) => {
//                     let ret: any = pick(cmd, ['name', 'match']);
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
//                 ... pick(plugin, ['friendlyName', 'description'])
//             };
//             return ret;
//         }),
//     };
//     startup(combined);
// });
