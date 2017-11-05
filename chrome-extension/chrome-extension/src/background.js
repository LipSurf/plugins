exports.Background = function({
    chrome,
    _,
    CT, // constants
    PM, // plugin manager
    Recognizer, // speech -> command
} = {}) {
    var on = false;
    var audible = false;
    var permissionDetector;
    var currentActiveTabId;
    var needsPermission = false;
    var delayCmd;
    var loadedPlugins = new Promise((resolve, reject) => {
        PM.loadPlugins().then((res) => {
            var plgs = res[0];
            var homos = res[1];
            Recognizer.setPlugins(plgs, homos);
            resolve();
        });
    });


    function queryActiveTab(cb) {
        if (CT.DEBUG) {
            chrome.tabs.query({ /*active: true, currentWindow: true,*/
                windowType: "normal"
            }, function(tabs) {
                for (let tab of tabs) {
                    if (tab.url.startsWith('http')) {
                        return cb(tab);
                    }
                }
            });
        } else {
            chrome.tabs.query({
                active: true,
                currentWindow: true,
                windowType: "normal"
            }, function(tabs) {
                return cb(tabs[0]);
            });
        }
    }



    function sendMsgToActiveTabCb(request) {
        queryActiveTab(function(tab) {
            chrome.tabs.sendMessage(tab.id, request);
        });
    }



    var Detector = function() {
        let _intervalId;
        let _checks = 0;
        let _maxChecks;
        let _sentinelFn;
        let _detectCb;

        function _check() {
            _checks += 1;
            new Promise(_sentinelFn).then(() => {
                console.log('yep 5');
                clearInterval(_intervalId);
                _detectCb();
            }, () => {});
            if (typeof(_maxChecks) !== 'undefined' && _checks > _maxChecks) {
                clearInterval(_intervalId);
            }
        }

        return {
            // sentinelFn -- returns true when something is detected
            // detectCb -- is run when sentinelFn returns true (once)
            // interval -- how often to run sentinelFn
            init: function(sentinelFn, detectCb, interval, maxChecks) {
                _maxChecks = maxChecks;
                _sentinelFn = sentinelFn;
                _detectCb = detectCb;
                _check();
                _intervalId = setInterval(function() {
                    _check();
                }, interval);
                return this;
            },

            destroy: function() {
                clearInterval(_intervalId);
            },
        };
    };


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


    function turnOn() {
        on = true;
        chrome.browserAction.setIcon({
            path: on ? CT.ON_ICON : CT.OFF_ICON
        });
        sendMsgToActiveTabCb({
            'toggleOn': on
        });
        queryActiveTab((tab) => {
            PM.loadContentScriptsForUrl(tab.id, tab.url);
        });
        // only allow recognizer to start if at least default
        // commands are loaded
        loadedPlugins.then(() => {
            Recognizer.start({
                sendMsgToActiveTabCb: sendMsgToActiveTabCb,
            });
        });
        InterferenceAudioDetector.init();
    }


    chrome.browserAction.setIcon({
        path: on ? CT.ON_ICON : CT.OFF_ICON
    });


    chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
        if (on && changeInfo.status == "complete") {
            PM.loadContentScriptsForUrl(tabId, tab.url);
        }
    });


    chrome.browserAction.onClicked.addListener(function(tab) {
        if (on) {
            on = false;
            chrome.browserAction.setIcon({
                path: on ? CT.ON_ICON : CT.OFF_ICON
            });
            sendMsgToActiveTabCb({
                'toggleOn': on
            });
            Recognizer.shutdown();
            InterferenceAudioDetector.destroy();
        } else {
            navigator.mediaDevices.getUserMedia({ audio: true }).then(() => {
                console.log("easy on");
                turnOn();
            }, () => {
                // Aw. No permission (or no microphone available).
                needsPermissionCb();
                if (!permissionDetector) {
                    // check a maximum of 15 times (~23s)
                    permissionDetector = new Detector().init(
                        (resolve, reject) => navigator.mediaDevices.getUserMedia({ audio: true })
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
                            }).catch(() => { }),
                        turnOn,
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


    chrome.tabs.onActivated.addListener(function(activeInfo) {
        if (typeof currentActiveTabId !== 'undefined') {
            chrome.tabs.sendMessage(currentActiveTabId, {
                "toggleActive": false
            });
        }
        chrome.tabs.sendMessage(activeInfo.tabId, {
            "toggleActive": true
        });
    });


    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        if (request.bubbleDown) {
            queryActiveTab(function(tab) {
                if (typeof request.bubbleDown.fullScreen !== 'undefined') {
                    console.log(`1. full screen`);
                    chrome.windows.update(tab.windowId, {
                        state: "fullscreen"
                    }, function(windowUpdated) {
                        //do whatever with the maximized window
                        fullscreen = true;
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
        }
    });

    return exports;
};

// When the bg pages are loaded in a non-node env, we need to
// initialize the modules manually
if (typeof chrome !== 'undefined') {
    exports.PM = exports.PM({
        chrome: chrome,
        _: _,
        CT: exports.CT,
    });
    exports.Recognizer = exports.Recognizer({
        CT: CT,
        _: _,
        webkitSpeechRecognition: webkitSpeechRecognition,
    });
    exports.Background({
        chrome: chrome,
        _: _,
        CT: exports.CT,
        PM: exports.PM,
        Recognizer: exports.Recognizer,
    });
}