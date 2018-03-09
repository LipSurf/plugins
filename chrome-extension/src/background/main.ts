import * as _ from "lodash";
import * as CT from "../constants";
import * as Util from "./util";
import { Recognizer } from "./recognizer";
import { PluginManager } from "./plugin-manager";
import { PluginSandbox } from "./plugin-sandbox";
import { Store } from "./store";

var activated = false;
var audible = false;
var permissionDetector;
var currentActiveTabId;
var needsPermission = false;
var delayCmd;
var recg = new Recognizer();
var ps = new PluginSandbox();
var pm = new PluginManager(ps);

chrome.storage.local.set({'activated': false});

function cmdRecognizedCb(request) {
    if (request.cmdName) {
        let cmdPart = _.pick(request, ['cmdName', 'cmdPluginName', 'cmdArgs']);
        ps.run(request.cmdName, request.cmdPluginName, request.cmdArgs);
        sendMsgToActiveTab(cmdPart);
        sendMsgToActiveTab({
            liveText: _.pick(request, ['text', 'isSuccess'])
        });
    } else {
        sendMsgToActiveTab({
            liveText: request
        });
    }
}


function sendMsgToActiveTab(request) {
    Util.queryActiveTab(function(tab) {
        chrome.tabs.sendMessage(tab.id, request);
    });
}


// TODO: Refactor to use Detector
var InterferenceAudioDetector = (function() {
    let _timerId = null;

    function _destroy() {
        try {
            clearTimeout(_timerId);
        } catch (e) {
            console.error(`error clearing interference audio detector ${e}`);
        }
    }

    return {
        init: function() {
            _destroy();
            _timerId = setInterval(function() {
                if (audible) {
                    chrome.tabs.query({
                        audible: true
                    }, function(tabs) {
                        if (!tabs || tabs.length === 0) {
                            audible = false;
                            console.warn(`audible ${audible}`);
                        }
                    });
                } else {
                    chrome.tabs.query({
                        audible: true
                    }, function(tabs) {
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


function needsPermissionCb() {
    chrome.runtime.openOptionsPage();
}


function toggleActivated(_activated=true) {
    activated = _activated;
    chrome.storage.local.set({ 'activated': activated });
    chrome.browserAction.setIcon({
        path: activated ? CT.ON_ICON : CT.OFF_ICON
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


chrome.browserAction.setIcon({
    path: activated ? CT.ON_ICON : CT.OFF_ICON
});


chrome.browserAction.onClicked.addListener(function(tab) {
    if (activated) {
        toggleActivated(false);
    } else {
        navigator.mediaDevices.getUserMedia({ audio: true }).then(() => {
            console.log("easy on");
            toggleActivated();
        }, () => {
            // Aw. No permission (or no microphone available).
            needsPermissionCb();
            if (!permissionDetector) {
                // check a maximum of 15 times (~23s)
                permissionDetector = new Util.Detector((resolve, reject) => navigator.mediaDevices.getUserMedia({ audio: true })
                    .then((stream) => {
                        console.log("yep1");
                        if (typeof(stream) !== 'undefined') {
                            console.log("yep2");
                            resolve();
                        } else {
                            reject();
                        }
                    }, function() {
                        reject();
                    }).catch(() => {}),
                    toggleActivated,
                    1500,
                    15);
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


chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.bubbleDown) {
        Util.queryActiveTab(function(tab) {
            if (typeof request.bubbleDown.fullScreen !== 'undefined') {
                console.log(`1. full screen`);
                chrome.windows.update(tab.windowId, {
                    state: "fullscreen"
                }, function(windowUpdated) {
                    //do whatever with the maximized window
                    this.fullscreen = true;
                });
            } else if (typeof request.bubbleDown.unFullScreen !== 'undefined') {
                console.log(`2. unfull screen`);
                chrome.windows.update(tab.windowId, {
                    state: "maximized"
                }, function(windowUpdated) {
                    //do whatever with the maximized window
                });
            }
            chrome.tabs.sendMessage(tab.id, request, function(response) {
                // not working (cannot get message in other content script
                sendResponse(response);
            });
        });
    } else if (request.bubbleUp) {
        // go back up to all the frames
        Util.queryActiveTab((tab) => {
            chrome.tabs.connect(tab.id, { name: 'getVideos' });
        });
    } else if (request === 'loadPlugins') {
        Util.queryActiveTab((tab) => {
           pm.loadCommandCodeIntoPage(tab.id, tab.url);
        });
    }
});
