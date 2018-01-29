exports.Background = function (_a) {
    var _b = _a === void 0 ? {} : _a, chrome = _b.chrome, _ = _b._, CT = _b.CT, // constants
    PM = _b.PM, // plugin manager
    Recognizer = _b.Recognizer, // speech -> command
    Util = _b.Util, PS = _b.PS;
    var activated = false;
    var audible = false;
    var permissionDetector;
    var currentActiveTabId;
    var needsPermission = false;
    var delayCmd;
    var loadedPlugins = new Promise(function (resolve, reject) {
        PM.loadPlugins().then(function (res) {
            var plgs = res[0];
            var homos = res[1];
            Recognizer.setPlugins(plgs, homos);
            resolve();
        });
    });
    chrome.storage.local.set({ 'activated': false });
    function cmdRecognizedCb(request) {
        if (request.cmdName) {
            var cmdPart = _.pick(request, ['cmdName', 'cmdPluginName', 'cmdArgs']);
            PS.run(cmdPart);
            sendMsgToActiveTab(cmdPart);
            sendMsgToActiveTab({
                liveText: _.pick(request, ['text', 'isSuccess'])
            });
        }
        else {
            sendMsgToActiveTab({
                liveText: request
            });
        }
    }
    function sendMsgToActiveTab(request) {
        Util.queryActiveTab(function (tab) {
            chrome.tabs.sendMessage(tab.id, request);
        });
    }
    // TODO: Refactor to use Detector
    var InterferenceAudioDetector = (function () {
        var _timerId = null;
        function _destroy() {
            try {
                clearTimeout(_timerId);
            }
            catch (e) {
                console.error("error clearing interference audio detector " + e);
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
                                console.warn("audible " + audible);
                            }
                        });
                    }
                    else {
                        chrome.tabs.query({
                            audible: true
                        }, function (tabs) {
                            if (tabs && tabs.length > 0) {
                                audible = true;
                                console.warn("audible " + audible);
                            }
                        });
                    }
                }, 3000);
            },
            destroy: function () {
                _destroy();
            }
        };
    })();
    function needsPermissionCb() {
        chrome.runtime.openOptionsPage();
    }
    function toggleActivated(_activated) {
        if (_activated === void 0) { _activated = true; }
        activated = _activated;
        chrome.storage.local.set({ 'activated': activated });
        chrome.browserAction.setIcon({
            path: activated ? CT.ON_ICON : CT.OFF_ICON
        });
        sendMsgToActiveTab({
            'toggleActivated': activated
        });
        if (activated) {
            // only allow recognizer to start if at least default
            // commands are loaded
            loadedPlugins.then(function () {
                Recognizer.start({
                    cmdRecognizedCb: cmdRecognizedCb
                });
            });
            InterferenceAudioDetector.init();
        }
        else {
            Recognizer.shutdown();
            InterferenceAudioDetector.destroy();
        }
    }
    chrome.browserAction.setIcon({
        path: activated ? CT.ON_ICON : CT.OFF_ICON
    });
    chrome.browserAction.onClicked.addListener(function (tab) {
        if (activated) {
            toggleActivated(false);
        }
        else {
            navigator.mediaDevices.getUserMedia({ audio: true }).then(function () {
                console.log("easy on");
                toggleActivated();
            }, function () {
                // Aw. No permission (or no microphone available).
                needsPermissionCb();
                if (!permissionDetector) {
                    // check a maximum of 15 times (~23s)
                    permissionDetector = new Util.Detector().init(function (resolve, reject) { return navigator.mediaDevices.getUserMedia({ audio: true })
                        .then(function (stream) {
                        console.log("yep1");
                        if (typeof (stream) !== 'undefined') {
                            console.log("yep2");
                            resolve();
                        }
                        else {
                            reject();
                        }
                    }, function () {
                        reject();
                    })["catch"](function () { }); }, toggleActivated, 1500, 15);
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
    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        if (request.bubbleDown) {
            Util.queryActiveTab(function (tab) {
                if (typeof request.bubbleDown.fullScreen !== 'undefined') {
                    console.log("1. full screen");
                    chrome.windows.update(tab.windowId, {
                        state: "fullscreen"
                    }, function (windowUpdated) {
                        //do whatever with the maximized window
                        fullscreen = true;
                    });
                }
                else if (typeof request.bubbleDown.unFullScreen !== 'undefined') {
                    console.log("2. unfull screen");
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
            });
        }
        else if (request.bubbleUp) {
            // go back up to all the frames
            Util.queryActiveTab(function (tab) {
                chrome.tabs.connect(tab.id, { name: 'getVideos' });
            });
        }
        else if (request === 'loadPlugins') {
            Util.queryActiveTab(function (tab) {
                PM.loadContentScriptsForUrl(tab.id, tab.url);
            });
        }
    });
    return exports;
};
// When the bg pages are loaded in a non-node env, we need to
// initialize the modules manually
if (typeof chrome !== 'undefined') {
    exports.Util = exports.Util({
        chrome: chrome,
        _: _,
        CT: exports.CT
    });
    exports.PS = exports.PS({
        chrome: chrome,
        _: _,
        Util: exports.Util
    });
    exports.PM = exports.PM({
        chrome: chrome,
        _: _,
        CT: exports.CT,
        PS: exports.PS
    });
    exports.Recognizer = exports.Recognizer({
        CT: CT,
        _: _,
        webkitSpeechRecognition: webkitSpeechRecognition
    });
    exports.Background({
        chrome: chrome,
        _: _,
        CT: exports.CT,
        PM: exports.PM,
        Recognizer: exports.Recognizer,
        Util: exports.Util,
        PS: exports.PS
    });
}
