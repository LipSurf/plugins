/// <reference path="../@types/cs-interface.d.ts"/>
declare let INCLUDE_SPEECH_TEST_HARNESS: boolean;
declare let CLEAR_SETTINGS: boolean;
import { pick } from "lodash";
import { ON_ICON, OFF_ICON } from "../common/constants";
import { Recognizer, IRecognizedCallback, IRecognizedCmd, IRecognizedText } from "./recognizer";
import { PluginManager } from "./plugin-manager";
import { PluginSandbox } from "./plugin-sandbox";
import { Store } from "./store";
import { Detector } from "../common/util";
import { storage, tabs } from "../common/browser-interface";

export interface IWindow extends Window {
    webkitSpeechRecognition: any;
}
const { webkitSpeechRecognition }: IWindow = <IWindow>window;

let activated = false;
let audible = false;
let permissionDetector;
let store = new Store(PluginManager.digestNewPlugin);
let recg;

// initial load -> get plugins from storage
store.rebuildLocalPluginCache().then(() => {
    recg = new Recognizer(store, 
        tabs.onUrlUpdate, 
        tabs.queryActiveTab, 
        tabs.sendMsgToTab,
        webkitSpeechRecognition
    );
    let ps = new PluginSandbox(store);
    let pm = new PluginManager(store);

    chrome.runtime.onMessage.addListener(async function (request, sender, sendResponse) {
        if (request.bubbleDown) {
            let tab = await tabs.queryActiveTab();
            if (typeof request.bubbleDown.fullScreen !== 'undefined') {
                console.log(`1. full screen`);
                chrome.windows.update(tab.windowId, {
                    state: "fullscreen"
                }, function (windowUpdated) {
                    //do whatever with the maximized window
                    this.fullscreen = true;
                });
            } else if (typeof request.bubbleDown.unFullScreen !== 'undefined') {
                console.log(`2. unfull screen`);
                chrome.windows.update(tab.windowId, {
                    state: "maximized"
                }, function (windowUpdated) {
                    //do whatever with the maximized window
                });
            }
            chrome.tabs.sendMessage(tab.id, request, function (response) {
                // not working (cannot get message in other content script
                sendResponse(response);
            });
        } else if (request.bubbleUp) {
            // go back up to all the frames
            let tab = await tabs.queryActiveTab();
            chrome.tabs.connect(tab.id, { name: 'getVideos' });
        } else if (request === 'loadPlugins') {
            let tab = await tabs.queryActiveTab();
            pm.loadCommandCodeIntoPage(tab.id, tab.url);
        }
    });

    chrome.browserAction.onClicked.addListener(function (tab) {
        if (activated) {
            toggleActivated(false);
        } else {
            navigator.mediaDevices.getUserMedia({ audio: true }).then(() => {
                console.log("easy on");
                toggleActivated();
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
                    toggleActivated();
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


    function toggleActivated(_activated = true) {
        activated = _activated;
        storage.local.save({ activated: activated });
        chrome.browserAction.setIcon({
            path: activated ? ON_ICON : OFF_ICON
        });
        sendMsgToActiveTab({
            'toggleActivated': activated
        });
        if (activated) {
            // only allow recg to start if at least default
            // commands are loaded
            recg.start(cmdRecognizedCb);
            InterferenceAudioDetector.init();
        } else {
            recg.shutdown();
            InterferenceAudioDetector.destroy();
        }
    }

    function instanceOfCmd(object: any): object is IRecognizedCmd {
        return 'cmdName' in object;
    }

    function cmdRecognizedCb(request: IRecognizedCallback): void {
        if (instanceOfCmd(request)) {
            let cmdPart: ICmdParcel = pick(request, ['cmdName', 'cmdPluginId', 'cmdArgs']);
            ps.run(cmdPart);
            sendMsgToActiveTab(cmdPart);
            sendMsgToActiveTab({
                liveText: pick(request, ['text', 'isSuccess'])
            });
        } else {
            sendMsgToActiveTab(<ILiveTextParcel>{
                liveText: request
            });
        }
    }
});


chrome.browserAction.setIcon({
    path: activated ? ON_ICON : OFF_ICON
});
storage.local.save({ activated: false });


async function sendMsgToActiveTab(request: IBackgroundParcel) {
    let tab = await tabs.queryActiveTab();
    chrome.tabs.sendMessage(tab.id, request);
}


function needsPermissionCb() {
    chrome.runtime.openOptionsPage();
}


// TODO: Refactor to use Detector
var InterferenceAudioDetector = (function () {
    let _timerId = null;

    function _destroy() {
        try {
            clearTimeout(_timerId);
        } catch (e) {
            console.error(`error clearing interference audio detector ${e}`);
        }
    }

    return {
        init: function () {
            _destroy();
            _timerId = setInterval(function () {
                if (audible) {
                    chrome.tabs.query({
                        audible: true
                    }, function (tabs) {
                        if (!tabs || tabs.length === 0) {
                            audible = false;
                            console.warn(`audible ${audible}`);
                        }
                    });
                } else {
                    chrome.tabs.query({
                        audible: true
                    }, function (tabs) {
                        if (tabs && tabs.length > 0) {
                            audible = true;
                            console.warn(`audible ${audible}`);
                        }
                    });
                }
            }, 3000);
        },
        destroy: () => {
            _destroy();
        }
    }
})();


// compile time optional includes
if (CLEAR_SETTINGS) {
    chrome.storage.local.clear();
    chrome.storage.sync.clear();
}
if (INCLUDE_SPEECH_TEST_HARNESS) {
    chrome.runtime.onConnect.addListener(function(port) {
        if (port.name == 'test-probe') {
            port.onMessage.addListener(function(msg:any) {
                console.log(`RECEIVED A FKIN MSG`);
                eval(msg.cmd);
            });
        }
    });
}
