/// <reference path="../@types/store.d.ts" />
import { promisify } from './util';


type LocalSaveable = ISerializedLocalData | IActivated;
type LocalLoadable = keyof ISerializedLocalData;
type SyncSaveable = ISyncData;
type SyncLoadable = keyof ISyncData;


export module storage {
    export module local {
        export async function save(data: LocalSaveable) {
            return promisify(chrome.storage.local.set)(data);
        }
        export async function load(key: LocalLoadable): Promise<ISerializedLocalData> {
            return promisify<ISerializedLocalData>(chrome.storage.local.get)(key);
        }
    }

    export module sync {
        export async function save(data: SyncSaveable) {
            return promisify(chrome.storage.sync.set)(data);
        }
        export async function load(key: SyncLoadable): Promise<ISyncData> {
            return promisify<ISyncData>(chrome.storage.sync.get)(key);
        }
        export function registerOnChangeCb(cb: (changes) => void) {
            // namespace is either "sync" or "local"
            chrome.storage.onChanged.addListener(function (changes, namespace) {
                if (namespace === "sync") {
                    cb(changes);
                }
            });
        }

    }
}

export module tabs {
    export function onUrlUpdate(cb: ((url: string) => void)) {
        chrome.tabs.onUpdated.addListener(
            function (tabId, changeInfo, tab) {
                if (changeInfo.url)
                    cb(tab.url);
            }
        );
    }
}