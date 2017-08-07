exports.init = function({chrome, CT, _} = {}) {
    var on = false;
    var audible = false;
    var currentActiveTabId;
    var needsPermission = false;
    var lastNonFinalCmdExecutedTime = 0;
    var lastNonFinalCmdExecuted = null;
    var delayCmd;
    var _syn_keys = Object.keys(CT.SYNONYMS).map((syn) => new RegExp(`\\b${syn}\\b`));
    var _syn_vals = Object.values(CT.SYNONYMS);


    // prefix or suffix match
    function ordinalOrNumberToDigit(input, keywords) {
        for (let i = 0; i < keywords.length; i++) {
            let keyword = keywords[i];
            let startI = input.indexOf(keyword);
            if (~startI) {
                let ordinal = input.replace(keyword, "").trim();
                console.log(`ordinal ${ordinal} keyword: ${keyword}`);
                try {
                    return CT.ORDINALS_TO_DIGITS[ordinal] || CT.NUMBERS_TO_DIGITS[ordinal];
                } catch(e) { console.error(e); }
            }
        }
    }


    function queryActiveTab(cb) {
        if (CT.DEBUG) {
            chrome.tabs.query({/*active: true, currentWindow: true,*/ windowType: "normal"}, function (tabs) {
                for (let tab of tabs) {
                    if (tab.url.startsWith('http')) {
                        return cb(tab);
                    }
                }
            });
        } else {
            chrome.tabs.query({active: true, currentWindow: true, windowType: "normal"}, function (tabs) {
                return cb(tabs[0]);
            });
        }
    }


    // Maybe we want to execute each command seperately? Like "down down" should
    // be two downs. If the user chains commands like "down up" then
    // maybe we should split and match the first valid part of the command?
    // Needs thought...
    function dedupe(input) {
        let existingWords = {};
        let processed = [];
        for (let word of input.split(' ')) {
            if (typeof existingWords[word] === 'undefined') {
                processed.push(word);
            }
        }
        return processed.join(' ');
    }


    function expandSynonyms(input) {
        for (let i = 0; i < _syn_keys.length; i++) {
            input = input.replace(_syn_keys[i], _syn_vals[i]);
        }
        return input;
    }


    function sendMsgToActiveTab(request) {
        queryActiveTab(function(tab) {
            chrome.tabs.sendMessage(tab.id, request);
        });
    }


    exports.getCmdForUserInput = function(input) {
        // simplifies the input into a more limited set of words
        let processedInput = expandSynonyms(input);
        // processedInput = dedupe(processedInput);
        for (let cmdName in COMMANDS) {
            let curCmd = COMMANDS[cmdName];
            let out;
            let i;
            if (typeof curCmd.ordinalMatch !== 'undefined') {
                out = ordinalOrNumberToDigit(processedInput, curCmd.ordinalMatch);
            }
            if (!out && typeof curCmd.regx !== 'undefined') {
                if (curCmd.regx.length) {
                    for (i = 0; i < curCmd.regx.length; i++) {
                        out = processedInput.match(curCmd.regx[i]);
                        if (out) {
                            break;
                        }
                    }
                } else {
                    out = processedInput.match(curCmd.regx);
                }
            }
            if (!out && typeof curCmd.matches !== 'undefined') {
                out = curCmd.matches(processedInput);
            }
            if (out) {
                let cmd = COMMANDS[cmdName];
                let delay = null;
                if (cmd.ordinalMatch) {
                    delay = CT.ORDINAL_CMD_DELAY;
                } else if (cmd.delay && typeof cmd.delay === 'object') {
                    delay = cmd.delay[i];
                } else if (typeof cmd.delay !== 'undefined') {
                    delay = cmd.delay;
                }
                return {cmdName: cmdName, matchOutput: out, delay: delay};
            }
        }
        return {};
    }


    function handleTranscript({isFinal, transcript, confidence} = {}) {
        let elapsedTime = +new Date() - lastNonFinalCmdExecutedTime;
        console.log(`elapsed time ${elapsedTime}`);
        if (elapsedTime > CT.COOLDOWN_TIME) {
            if (confidence > CT.CONFIDENCE_THRESHOLD) {
                // console.log(`start time ${+new Date()}`);
                let {cmdName, matchOutput, delay} = exports.getCmdForUserInput(transcript);
                let niceOutput = null;
                console.log(`input: ${transcript}, matchOutput: ${matchOutput}, cmdName: ${cmdName}`);
                // console.log(`end time ${+new Date()}`);
                if (cmdName) {
                    // prevent dupe commands when cmd is said once, but finalized much later by speech recg.
                    if (isFinal && lastNonFinalCmdExecuted && lastNonFinalCmdExecuted === cmdName && (+new Date() - lastFinalTime) < CT.FINAL_COOLDOWN_TIME) {
                        console.log("Junked dupe.");
                        return;
                    } else if (typeof delayCmd !== 'undefined') {
                        clearTimeout(delayCmd);
                    }

                    let cmd = COMMANDS[cmdName];

                    delayCmd = setTimeout(function () {
                        if (typeof cmd.nice === 'string') {
                            niceOutput = cmd.nice;
                        } else if (typeof cmd.nice === 'function') {
                            niceOutput = cmd.nice(matchOutput);
                        }
                        console.log(`running command ${cmdName} isFinal:${isFinal}`);
                        lastNonFinalCmdExecuted = isFinal ? null : cmdName;
                        lastNonFinalCmdExecutedTime = isFinal ? 0 : +new Date();

                        exports.execCmd({name: cmdName, matchStr: matchOutput});
                        console.log(`transcript in closure ${transcript}`);
                        return sendMsgToActiveTab({
                            liveText: {
                                text: niceOutput ? niceOutput : transcript,
                                isSuccess: true,
                            }
                        });
                    }, delay);
                    return sendMsgToActiveTab({
                        liveText: {
                            text: transcript,
                            hold: true,
                        }
                    });
                } else {
                    return sendMsgToActiveTab({
                        liveText: {
                            text: niceOutput ? niceOutput : transcript
                        }
                    });
                }
            }
            if (isFinal) {
                lastFinalTime = +new Date();
                if (confidence <= CT.CONFIDENCE_THRESHOLD) {
                    return sendMsgToActiveTab({liveText: {text: transcript, isUnsure: true}});
                }
            }
        }
    }


    exports.execCmd = function({name, matchStr} = {}) {
        if (typeof COMMANDS[name].run !== 'undefined') {
            COMMANDS[name].run(matchStr);
        } else {
            sendMsgToActiveTab({cmd: {name: name, match: matchStr}});
        }
    };


    var Detector = function() {
        let _intervalId;
        return {
            // sentinelFn -- returns true when something is detected
            // detectCb -- is run when sentinelFn returns true (once)
            // interval -- how often to run sentinelFn
            init: function(sentinelFn, detectCb, interval) {
                _intervalId = setInterval(function() {
                    let res = detectCb();
                    res ? clearTimeout(_intervalId) : null;
                });
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
            init: function () {
                _destroy();
                _timerId = setInterval(function() {
                    if (audible) {
                        chrome.tabs.query({audible: true}, function (tabs) {
                            if (!tabs || tabs.length === 0) {
                                audible = false;
                                console.warn(`audible ${audible}`);
                            }
                        });
                    } else {
                        chrome.tabs.query({audible: true}, function (tabs) {
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


    var Recognizer = (function() {
        var recognition;
        return {
            firstStart: function() {

            },
            start: function() {
                recognition = new webkitSpeechRecognition();
                recognition.continuous = true;
                recognition.interimResults = true;
                recognition.lang = 'en-US';
                recognition.maxAlternatives = 1;
                recognition.start();

                recognition.onresult = function(event) {
                    var lastE = event.results[event.results.length - 1];
                    needsPermission = false;
                    console.dir(event);
                    handleTranscript({
                        'isFinal': lastE.isFinal,
                        'confidence': lastE[0].confidence,
                        'transcript': lastE[0].transcript.trim().toLowerCase(),
                    });
                };

                // Error types:
                // 	'no-speech'
                //  'network'
                //  'not-allowed
                recognition.onerror = function(event) {
                    // open the options page if we don't have permission
                    if (!needsPermission) {
                        if (event.error === 'not-allowed') {
                            needsPermission = true;
                            chrome.runtime.openOptionsPage();
                        } else if (event.error !== 'no-speech') {
                            console.error(`unhandled error: ${event.error}`);
                        }
                    }
                };

                recognition.onnomatch = function(event) {
                    console.error(`No match! ${event}`);
                };

                recognition.onend = function() {
                    console.log("ended. Restarting: ");
                    recognition.start();
                };

            },
            shutdown: function() {
                try {
                    recognition.stop();
                } catch(e) {}
                try {
                    recognition.onresult = null;
                    recognition.onerror = null;
                    recognition.onend = null;
                } catch (e) {}
                recognition = null;
            }
        }
    })();


    var COMMANDS = {
        'Collapse': (function() {
            return {
                regx: /^(?:collapse)$/,
                ordinalMatch: ["close", "close preview", "collapse"],
            };
        })(),
        'CommentsExpandAll': (function() {
            return {
                regx: /^(?:expand all)$/
            };
        })(),
        'Expand': (function() {
            // expand previews or comments
            var opened;
            return {
                regx: /^(?:preview|expand)$/,  // in comments view
                ordinalMatch: ["preview", "expand"]   // in subreddit view
            };
        })(),
        'HelpOpen': (function() {
            return {
                regx: /^(help|open help|help open|commands)$/
            };
        })(),
        'HelpClose': (function() {
            return {
                regx: /^(close help|help close|closeout|close up)$/,
                nice: 'close help'
            };
        })(),
        'NavigateBackward': (function() {
            return {
                regx: /^(?:back|go back)$/
            };
        })(),
        'NavigateForward': (function() {
            return {
                regx: /^(?:forward|ford|go forward)$/
            };
        })(),
        'NavigateToSubreddit': (function() {
            var REGX = /^(?:go to |show )?(?:are|our|r) (.*)/;
            console.log("BUILDING");
            return {
                matches: function(input) {
                    let match = input.match(REGX);
                    console.log(`navigate subreddit input: ${input} match: ${match}`);
                    if (match) {
                        return match[1].replace(/\s/g, "");
                    }
                },
                delay: 1200,
                nice: function(match) {
                    return `go to r/${match}`;
                }
            };
        })(),
        'TabClose': (function() {
            return {
                regx: /^close tab$/,
                run: function() {
                    queryActiveTab(function(tab) {
                        chrome.tabs.remove(tab.id);
                    });
                }
            };
        })(),
        'TabNew': (function() {
            return {
                regx: /^(?:new tab|open tab|newtown)$/,
                run: function() {
                    chrome.tabs.create({active: true});
                }
            };
        })(),
        'TabPrevious': (function() {
            return {
                regx: /^(?:previous tab)$/,
                run: function() {
                    chrome.tabs.query({currentWindow: true}, function(tabs) {
                        let curIndex;
                        let maxIndex = tabs.length - 1;
                        for (let tab of tabs) {
                            if (tab.active) {
                                curIndex = tab.index;
                                break;
                            }
                        }
                        console.log(`maxIndex: ${maxIndex} curIndex: ${curIndex}`);
                        for (let tab of tabs) {
                            if (tab.index === (curIndex <= 0 ? maxIndex : curIndex - 1)) {
                                chrome.tabs.update(tab.id, {active: true});
                                console.log(`found prev index! ${tab.index}`);
                                break;
                            }
                        }
                    });
                }
            };
        })(),
        'TabSelect': (function() {
            return {
                ordinalMatch: ['tab', 'time'],
                run: function(i) {
                    chrome.tabs.query({index: i - 1, currentWindow: true}, function(tabs) {
                        chrome.tabs.update(tabs[0].id, {active: true});
                    });
                }
            }
        })(),
        'TabNext': (function() {
            return {
                regx: /^(?:next tab|next time)$/,
                run: function() {
                    chrome.tabs.query({currentWindow: true}, function(tabs) {
                        let curIndex;
                        let maxIndex = tabs.length - 1;
                        for (let tab of tabs) {
                            if (tab.active) {
                                curIndex = tab.index;
                                break;
                            }
                        }
                        console.log(`maxIndex: ${maxIndex} curIndex: ${curIndex}`);
                        for (let tab of tabs) {
                            if (tab.index === (curIndex >= maxIndex ? 0 : curIndex + 1)) {
                                chrome.tabs.update(tab.id, {active: true});
                                console.log(`found next index! ${tab.index}`);
                                break;
                            }
                        }
                    });
                }
            };
        })(),
        'VoteClear': (function() {
            return {
                ordinalMatch: ['clear vote',],
                regx: /^(?:clear vote)$/,
            };
        })(),
        'VoteDown': (function() {
            return {
                ordinalMatch: ['downvote', 'download'],
                regx: /^(?:downvote|download)$/,
                nice: function(i) {
                    return `downvote ${i}`;
                },
            };
        })(),
        'VoteUp': (function() {
            return {
                ordinalMatch: ['upvote', 'upload', 'about', 'i thought'],
                regx: /^(?:upvote|upload|about|i thought|a phone)$/,
                nice: function(i) {
                    return `upvote ${i}`;
                },
            };
        })(),
        'VideoFullScreen': (function() {
            return {
                regx: /^(?:fullscreen|full screen)$/
            };
        })(),
        'VideoUnFullScreen': (function() {
            return {
                regx: /^(?:unfullscreen|unfull screen|on fullscreen|on full screen|unfor screen|unfold screen|no full screen)$/
            };
        })(),
        'VideoPause': (function() {
            return {
                regx: /^(pause|pause video)$/
            };
        })(),
        'VideoPlay': (function() {
            return {
                ordinalMatch: ['play']
            };
        })(),
        'VideoResume': (function() {
            // Works with any video that may have started, even with the mouse
            return {
                regx: /^(resume)$/
            };
        })(),
        'Reddit': (function() {
            return {
                regx: /^(home|reddit|reddit.com|read it)$/
            };
        })(),
        'Refresh': (function() {
            return {
                regx: /^refresh$/
            };
        })(),
        'ScrollBottom': (function() {
            return {
                regx: /^(bottom|bottom of page|bottom of the page|scroll bottom|scroll to bottom|scroll to the bottom of page|scroll to the bottom of the page)$/
            };
        })(),
        'ScrollTop': (function() {
            return {
                regx: /^(top|top of page|scrolltop|top of the page|scroll top|scroll to top|scroll to the top of page|scroll to the top of the page)$/
            };
        })(),
        'ScrollDownLittle': (function() {
            return {
                regx: /^(little down|little scroll down|scroll little down|down little)$/
            };
        })(),
        'ScrollDown': (function() {
            return {
                regx: [/^down$/, /^scroll down$/],
                delay: [300, 0],
            };
        })(),
        'ScrollUpLittle': (function() {
            return {
                regx: /^(little up|little scroll up|scroll little up|up little)$/
            };
        })(),
        'ScrollUp': (function() {
            return {
                regx: [/^up$/, /^scroll up$/],
                delay: [300, 0],
            };
        })(),
        'Stop': (function() {
            return {
                regx: /^stop$/
            };
        })(),
        'VisitPost': (function() {
            return {
                ordinalMatch: ['click', 'quick'],
                nice: 'click'
            };
        })(),
        'ViewComments': (function() {
            return {
                ordinalMatch: ["comments", "view comments", "commons", "comets"]
            };
        })(),
    }
    chrome.browserAction.setIcon({path: on ? CT.ON_ICON : CT.OFF_ICON });

    chrome.browserAction.onClicked.addListener(function(tab) {
        on = !on;
        if (on) {
            Recognizer.start();
            InterferenceAudioDetector.init();
        } else {
            Recognizer.shutdown();
            InterferenceAudioDetector.destroy();
        }
        chrome.browserAction.setIcon({path: on ? CT.ON_ICON : CT.OFF_ICON});
        sendMsgToActiveTab({'toggleOn': on})

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
            chrome.tabs.sendMessage(currentActiveTabId, {"toggleActive": false });
        }
        chrome.tabs.sendMessage(activeInfo.tabId, {"toggleActive": true });
    });


    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        if (request.bubbleDown) {
            queryActiveTab(function(tab) {
                if (typeof request.bubbleDown.fullScreen !== 'undefined') {
                    console.log(`1. full screen`);
                    chrome.windows.update(tab.windowId, {state: "fullscreen"}, function (windowUpdated) {
                        //do whatever with the maximized window
                        fullscreen = true;
                    });
                } else if (typeof request.bubbleDown.unFullScreen !== 'undefined') {
                    console.log(`2. unfull screen`);
                    chrome.windows.update(tab.windowId, {state: "maximized"}, function (windowUpdated) {
                        //do whatever with the maximized window
                    });
                }
                chrome.tabs.sendMessage(tab.id, request, function (response) {
                    // not working (cannot get message in other content script
                    sendResponse(response);
                });
            });
        }
    });

    // for debug mode
    if (CT.DEBUG) {
        exports.handleTranscript = handleTranscript;
    }
    return exports;
};

if (typeof chrome !== 'undefined') {
    exports.init({chrome: chrome, CT: exports.CT, _: exports._});
}
