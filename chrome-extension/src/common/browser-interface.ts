/// <reference path="../@types/store.d.ts" />
declare let DEBUG:boolean;
import { promisify, Detector } from './util';


type LocalSaveable = ISerializedLocalData | IActivated;
type LocalLoadable = keyof ISerializedLocalData;
type SyncSaveable = ISyncData | {plugins: IndexedPlugins} | {inactivityAutoOffMins: number} | {showLiveText: boolean} | {tutorialMode: number} | {language: string};
type SyncLoadable = keyof ISyncData;


export module storage {
    export module local {
        export async function save(data: LocalSaveable): Promise<void> {
            return promisify<void>(chrome.storage.local.set)(data);
        }
        export async function load(key: LocalLoadable): Promise<ISerializedLocalData> {
            return promisify<ISerializedLocalData>(chrome.storage.local.get)(key);
        }
        export async function clear(): Promise<void> {
            return promisify<void>(chrome.storage.local.clear)();
        }
        export function registerOnChangeCb(cb: (changes) => void) {
            // namespace is either "sync" or "local"
            chrome.storage.onChanged.addListener(function(rawChanges, namespace) {
                if (namespace === "local") {
                    // we don't use the specific changes yet -- so this is unnecessary for now
                    // let changes = Object.keys(rawChanges).reduce((memo, key) => Object.assign(memo, {[key]: rawChanges[key].newValue}), {});
                    cb(rawChanges);
                }
            });
        }

    }

    export module sync {
        export async function save(data: SyncSaveable): Promise<void> {
            return promisify<void>(chrome.storage.sync.set)(data);
        }
        export async function load<T extends SyncSaveable>(key:SyncLoadable = null): Promise<T> {
            return promisify<T>(chrome.storage.sync.get)(key);
        }
        export async function clear(): Promise<void> {
            return promisify<void>(chrome.storage.sync.clear)();
        }
        export function registerOnChangeCb(cb: (changes) => void) {
            // namespace is either "sync" or "local"
            chrome.storage.onChanged.addListener(function(rawChanges, namespace) {
                if (namespace === "sync") {
                    // we don't use the specific changes yet -- so this is unnecessary for now
                    // let changes = Object.keys(rawChanges).reduce((memo, key) => Object.assign(memo, {[key]: rawChanges[key].newValue}), {});
                    cb(rawChanges);
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
        chrome.tabs.onActivated.addListener(
            function ({tabId, windowId}) {
                chrome.tabs.get(tabId, function(tab) {
                    if (tab.url)
                        cb(tab.url);
                });
            }
        );
    }

    export async function sendMsgToTab(tabId: number, msg: object): Promise<any[]> {
        return await promisify<any[]>(chrome.tabs.sendMessage)(tabId, msg);
    }
}

export module notifications {
    export async function create(title: string, message: string, optionsButton: boolean = false): Promise<any> {
        let id = '1';
        let opts = {
            type: 'basic',
            iconUrl: 'assets/icon-48.png',
            title, 
            message,
        };
        if (optionsButton) {
            // @ts-ignore
            opts.buttons = [{
                title: 'Options'
            }];
        }
        chrome.notifications.onButtonClicked.addListener((notificationId) => {
            if (notificationId === id) {
                chrome.runtime.openOptionsPage();
            }
        });
        chrome.notifications.create(id, opts);
    }
}

export namespace ExtensionUtil {
    async function _queryActiveTab(): Promise<chrome.tabs.Tab> {
        let promisifiedChromeTabsQuery = promisify<chrome.tabs.Tab[]>(chrome.tabs.query);
        if (DEBUG) {
            let mostActive;
            let tabs = await promisifiedChromeTabsQuery({ /*active: true, currentWindow: true,*/
                windowType: "normal"
            });
            for (let tab of tabs) {
                if (tab.url.startsWith('http') || tab.url.startsWith('chrome-extension://')) {
                    if (tab.active) {
                        return tab;
                    }
                    mostActive = tab;
                }
            }
            return mostActive;
        } else {
            let tabs = await promisifiedChromeTabsQuery({
                active: true,
                currentWindow: true,
                windowType: "normal"
            });

            if (tabs.length > 0) {
                return tabs[0];
            } else {
                // try again soon
            }
        }
    }

    export async function queryActiveTab(): Promise<chrome.tabs.Tab> {
        let promisifiedChromeTabsQuery = promisify<chrome.tabs.Tab[]>(chrome.tabs.query);
        // sometimes tab is null (perhaps when actions are done very quickly)
        let det = new Detector(async (resolve, reject) => {
                let tab = await _queryActiveTab();
                if (tab) {
                    resolve(tab);
                } else {
                    reject();
                }
            },
            200,
            2
        );
        return await det.detected();
    }

    export async function toggleActivated(_activated:boolean): Promise<void> {
        return await storage.local.save({ activated: _activated });
    }
}

export let queryActiveTab = ExtensionUtil.queryActiveTab;
