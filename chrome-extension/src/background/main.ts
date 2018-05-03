/// <reference path="../@types/cs-interface.d.ts"/>
declare let INCLUDE_SPEECH_TEST_HARNESS: boolean;
declare let CLEAR_SETTINGS: boolean;
// automatically activate addon when installed (for faster testing)
declare let AUTO_ON: boolean;
declare let PRETEND_FIRST_INSTALL: boolean;
import { pick, omit } from "lodash";
import { ON_ICON, OFF_ICON } from "../common/constants";
import { Recognizer, IRecognizedCallback } from "./recognizer";
import { PluginManager } from "./plugin-manager";
import { PluginSandbox } from "./plugin-sandbox";
import { Store, StoreSynced } from "./store";
import { Detector, ResettableTimeout, instanceOfCmdLiveTextParcel, instanceOfTextParcel, promisify } from "../common/util";
import { storage, tabs, queryActiveTab } from "../common/browser-interface";

export interface IWindow extends Window {
    webkitSpeechRecognition: any;
}

interface IMainStore {
    inactivityAutoOffMins: number,
    showLiveText: boolean,
    noHeadphonesMode: boolean,
}

const { webkitSpeechRecognition }: IWindow = <IWindow>window;

let permissionDetector;
let store = new Store(PluginManager.digestNewPlugin);

// initial load -> get plugins from storage
let fullyLoadedPromise = store.rebuildLocalPluginCache().then((): Promise<any> => {
    let recg = new Recognizer(store,
        tabs.onUrlUpdate,
        queryActiveTab,
        tabs.sendMsgToTab,
        webkitSpeechRecognition
    );
    let ps = new PluginSandbox(store);
    let pm = new PluginManager(store);
    let mn = new Main(store, pm, ps, recg);

    if (AUTO_ON) {
        // HACK
        setTimeout(mn.toggleActivated.bind(mn), 100);
        // refresh all tabs
        chrome.tabs.query({}, function (tabs) {
            for (let tab of tabs) {
                if (tab.url.indexOf('chrome://') === -1)
                    chrome.tabs.reload(tab.id);
            }
        })
    }

    storage.local.registerOnChangeCb((changes) => {
        if (changes && changes.activated && mn.activated !== changes.activated.newValue) {
            mn.toggleActivated(changes.activated.newValue);
        }
    });

    return new Promise((resolve, reject) => resolve());
});


class Main extends StoreSynced {

    private inactiveTimer:ResettableTimeout;
    private mainStore: IMainStore;
    public activated = false;

    constructor(public store: Store, private pm: PluginManager, private ps: PluginSandbox, private recg: Recognizer) {
        super(store)

        if (INCLUDE_SPEECH_TEST_HARNESS) {
            chrome.runtime.onConnect.addListener((port) => {
                if (port.name == 'test-probe') {
                    port.onMessage.addListener((msg:any) => {
                        console.log(`RECEIVED A HXOR MSG`);
                        eval(msg.cmd);
                    });
                }
            });
        }

        // this must be sync and return true in order to use sendResponse
        chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
            // if (request.bubbleDown) {
            //     // let tab = await queryActiveTab();
            //     if (typeof request.bubbleDown.fullScreen !== 'undefined') {
            //         console.log(`1. full screen`);
            //         chrome.windows.update(tab.windowId, {
            //             state: "fullscreen"
            //         }, function (windowUpdated) {
            //             //do whatever with the maximized window
            //             this.fullscreen = true;
            //         });
            //     } else if (typeof request.bubbleDown.unFullScreen !== 'undefined') {
            //         console.log(`2. unfull screen`);
            //         chrome.windows.update(tab.windowId, {
            //             state: "maximized"
            //         }, function (windowUpdated) {
            //             //do whatever with the maximized window
            //         });
            //     }
            //     chrome.tabs.sendMessage(tab.id, request, function (response) {
            //         // not working (cannot get message in other content script
            //         sendResponse(response);
            //     });
            // } else if (request.bubbleUp) {
            //     // go back up to all the frames
            //     // let tab = await queryActiveTab();
            //     chrome.tabs.connect(tab.id, { name: 'getVideos' });
            if (request === 'loadPlugins') {
                let tab = sender.tab;
                pm.injectCmdCodeIntoPage(tab.id, tab.url).then(() => {
                    // not sure this is needed
                    sendResponse(null);
                });
            }
            return true;
        });

        chrome.browserAction.onClicked.addListener(tab => {
            if (this.activated) {
                this.toggleActivated(false);
            } else {
                navigator.mediaDevices.getUserMedia({ audio: true }).then(() => {
                    console.log("easy on");
                    this.toggleActivated();
                }, async () => {
                    // Aw. No permission (or no microphone available).
                    needsPermissionCb();
                    if (!permissionDetector) {
                        // check a maximum of 15 times (~23s)
                        permissionDetector = new Detector(
                            (resolve, reject) => navigator.mediaDevices.getUserMedia({ audio: true })
                            .then((stream) => {
                                console.log("yep1");
                                if (typeof (stream) !== 'undefined') {
                                    console.log("yep2");
                                    resolve();
                                } else {
                                    reject();
                                }
                            }, function () {
                                reject();
                            }).catch(() => { }),
                            1500,
                            15);
                        await permissionDetector.detected();
                        this.toggleActivated();
                    }
                });
            }

            // REMOVE THIS
            // send test msg
            // let cmds = ['play first', 'fullscreen'];
            // for (let i = 0; i < cmds.length; i++) {
            //     setTimeout(function() {
            //         handleTranscript({
            //             'isFinal': true,
            //             'confidence': 1.0,
            //             'transcript': cmds[i].trim().toLowerCase(),
            //         });
            //     }, 3500 * (i + 1));
            // }
        });
    }

    protected storeUpdated(newOptions: IOptions) {
        this.mainStore = pick(newOptions, ['inactivityAutoOffMins', 'showLiveText', 'noHeadphonesMode']);
    }

    async toggleActivated(_activated = true) {
        let inactivityMins = this.mainStore.inactivityAutoOffMins;
        if (_activated && inactivityMins) {
            this.inactiveTimer = new ResettableTimeout(() => {
                this.toggleActivated(false);
            }, inactivityMins * 60 * 1000);
        } else if (this.inactiveTimer) {
            this.inactiveTimer.clear();
            this.inactiveTimer = undefined;
        }
        this.activated = _activated;
        storage.local.save({ activated: this.activated });
        chrome.browserAction.setIcon({
            path: this.activated ? ON_ICON : OFF_ICON
        });
        if (this.activated) {
            // only allow recg to start if at least default
            // commands are loaded
            this.recg.start(this.cmdRecognizedCb.bind(this));
        } else {
            this.recg.shutdown();
        }
    }

    async cmdRecognizedCb(request: IRecognizedCallback): Promise<void> {
        if (instanceOfCmdLiveTextParcel(request)) {
            let cmdPart = pick(request, ['cmdName', 'cmdPluginId', 'cmdArgs']);
            if (this.inactiveTimer)
                this.inactiveTimer.reset();
            this.ps.run(cmdPart);
        }
        if (!this.mainStore.showLiveText) {
            if (instanceOfCmdLiveTextParcel(request)) {
                request = <ICmdParcel>omit(request, ['text', 'isSuccess', 'isFinal', 'hold']);
            } else if (instanceOfTextParcel(request)) {
                // don't send an instanceOfText
                return;
            }
        }
        if (this.mainStore.noHeadphonesMode && instanceOfTextParcel(request)) {
            if ((await promisify<chrome.tabs.Tab[]>(chrome.tabs.query)({ audible: true })).length > 0) {
                // don't send an instanceOfText
                return;
            }
        }
        sendMsgToActiveTab(request);
    }
}


chrome.browserAction.setIcon({
    path: OFF_ICON
});
storage.local.save({ activated: false });

// "install", "update", "chrome_update", or "shared_module_update"
chrome.runtime.onInstalled.addListener(async (details) => {
    console.log(`Installed reason: ${details.reason}`);
    if (details.reason === 'install' || PRETEND_FIRST_INSTALL) {
        // don't open the tutorial until the plugin is done loading
        let tutMode = await storage.sync.load<ITutorialMode>("tutorialMode");
        if (typeof tutMode.tutorialMode === 'undefined' || tutMode.tutorialMode) {
            await fullyLoadedPromise;
            openTutorial();
        }
    }
});


async function sendMsgToActiveTab(request: IBackgroundParcel) {
    let tab = await queryActiveTab();
    chrome.tabs.sendMessage(tab.id, request);
}


async function needsPermissionCb() {
    let tutMode = await storage.sync.load<ITutorialMode>("tutorialMode");
    if (tutMode.tutorialMode) {
        openTutorial();
    } else {
        chrome.runtime.openOptionsPage();
    }
}

function openTutorial() {
    let foundExisting = false;
    let tutUrl = chrome.extension.getURL(`views/tutorial.html`);
    chrome.tabs.query({}, (tabs) => {
        for (let tab of tabs) {
            if (tab.url.indexOf(tutUrl) == 0) {
                chrome.windows.update(tab.windowId, {focused: true});
                chrome.tabs.update(tab.id, {active: true, url: `${tutUrl}#slide/1`});
                foundExisting = true;
            }
        }
        if (!foundExisting) {
            chrome.tabs.create({
                active: true,
                url: chrome.extension.getURL(`views/tutorial.html`)
            });
        }
    });
}


// compile time optional includes
if (CLEAR_SETTINGS) {
    chrome.storage.local.clear();
    chrome.storage.sync.clear();
}
