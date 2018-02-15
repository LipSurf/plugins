import { promisify } from './util';
import * as _ from 'lodash';

export interface IPreferences {
    plugins: IPluginConfig[],
    showLiveText: boolean,
}

// this is what's saved in chrome.syncdata
// all the user preferences for a plugin
// (we don't store the entire plugin code as there's a limit to the chrome syncdata space)
export interface IPluginConfig {
    name: string,    // the name of the plugin that's installed (used to find the plugin code on MealtimeBrowsing.com)
    version: string, // semantic versioning
    enabled: boolean,
    expanded: boolean,
    disabledCommands: string[],
    disabledHomophones: string[],  // the "less common" misheard part
} 


const DEFAULT_PREFERENCES: IPreferences = {
    plugins: [
        {
            name: 'Browser',
            version: '1.0.0',
            enabled: true,
            expanded: true,
            disabledCommands: [],
            disabledHomophones: []
        },
        {
            name: 'Reddit',
            version: '1.0.0',
            enabled: true,
            expanded: true,
            disabledCommands: [],
            disabledHomophones: []
        },
    ],
    showLiveText: true
}


export async function save(preferences: IPreferences) {
    return promisify(chrome.storage.sync.set)(preferences);
}

// Load the defaults if nothing is in the preferences
export async function load(): Promise<IPreferences> {
    let loaded = await promisify<IPreferences>(chrome.storage.sync.get)(null);
    if (!(_.get(loaded, 'plugins.length', 0) > 0)) {
        loaded = DEFAULT_PREFERENCES;
    }
    return loaded;
}