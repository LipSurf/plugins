import { storage } from "../common/browser-interface";
import * as _ from 'lodash';

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
    return await storage.remote.save(preferences);
}


// Load the defaults if nothing is in the preferences
export async function load(): Promise<IPreferences> {
    let loaded = <IPreferences>(await (storage.remote.load)('plugin-preferences'));
    if (!(_.get(loaded, 'plugins.length', 0) > 0)) {
        loaded = DEFAULT_PREFERENCES;
    }
    return loaded;
}
