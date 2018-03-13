import { storage } from "../common/browser-interface";
import * as _ from 'lodash';


export class Preferences {
    static DEFAULT_PREFERENCES: IUserPreferences = {
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
    };


    async save(preferences: IUserPreferences): Promise<any> {
        return await storage.remote.save(preferences);
    }


    // Load the defaults if nothing is in the preferences
    async load(): Promise<IUserPreferences> {
        debugger;
        let loaded = <IUserPreferences>(await (storage.remote.load)('plugin-preferences'));
        if (!(_.get(loaded, 'plugins.length', 0) > 0)) {
            loaded = Preferences.DEFAULT_PREFERENCES;
        }
        return loaded;
    }
}