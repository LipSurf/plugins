import { promisify } from './util';

type LocalSaveable = IStorePlugins | IActivated;
type LocalGettable = 'activated' | 'store-plugin';
type RemoteSaveable = IPreferences;
type RemoteGettable = 'plugin-preferences';

export module storage {
    export module local {
        export async function save(data: LocalSaveable) {
            return promisify(chrome.storage.local.set)(data);
        }
        export async function load(key: LocalGettable): Promise<LocalSaveable> {
            return promisify<LocalSaveable>(chrome.storage.local.get)(key);
        }
    }

    export module remote {
        export async function save(data: RemoteSaveable) {
            return promisify(chrome.storage.sync.set)(data);
        }
        export async function load(key: RemoteGettable): Promise<RemoteSaveable> {
            return promisify<RemoteSaveable>(chrome.storage.sync.get)(key);
        }
    }
}
