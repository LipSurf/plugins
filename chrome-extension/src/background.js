var on = false;
var audible = false;
var currentActiveTabId;
var needsPermission = false;
var ON_ICON = "assets/icon-on-128.png";
var OFF_ICON = "assets/icon-off-128.png";
var lastNonFinalCmdExecutedTime = 0;
var lastNonFinalCmdExecuted = null;
// how long to wait before allowing another command
const COOLDOWN_TIME = 900;
// max time to require before resetting the isFinal switch
// that blocks a command from being run twice (once before isFinal
// and once after)
const FINAL_COOLDOWN_TIME = 2200;
const ORDINALS_TO_DIGITS = {
    "first": 1,
    "1st": 1,
    "i": 1,
    "second": 2,
    "2nd": 2,
    "ii": 2,
    "third": 3,
    "3rd": 3,
    "iii": 3,
    "fourth": 4,
    "forth": 4,
    "4th": 4,
    "iv": 4,
    "fifth": 5,
    "fit": 5,
    "5th": 5,
    "v": 5,
    "sixth": 6,
    "sex": 6,
    "6th": 6,
    "vi": 6,
    "seventh": 7,
    "7th": 7,
    "vii": 7,
    "eigth": 8,
    "8th": 8,
    "viii": 8,
    "ninth": 9,
    "9th": 9,
    "ix": 9,
    "tenth": 10,
    "10th": 10,
    "x": 10,
    "eleventh": 11,
    "11th": 11,
    "xi": 11,
    "twelfe": 12,
    "twelve": 12,
    "12th": 12,
    "xii": 12,
    "thirteenth": 13,
    "13th": 13,
    "xiii": 13,
    "fourteenth": 14,
    "14th": 14,
    "fourteen": 14,
    "xiv": 14,
    "fifteenth": 15,
    "15th": 15,
    "xv": 15,
    "sixteenth": 16,
    "16th": 16,
    "xvi": 16,
    "seventeenth": 17,
    "17th": 17,
    "xvii": 17,
    "eighteenth": 18,
    "18th": 18,
    "xviii": 18,
    "nineteenth": 19,
    "19th": 19,
    "xix": 19,
    "twentieth": 20,
    "20th": 20,
    "xx": 20,
};
const NUMBERS_TO_DIGITS = {
    "1": 1,
    "one": 1,
    "2": 2,
    "to": 2,
    "too": 2,
    "two": 2,
    "3": 3,
    "three": 3,
    "4": 4,
    "four": 4,
    "5": 5,
    "five": 5,
    "6": 6,
    "six": 6,
    "7": 7,
    "seven": 7,
    "8": 8,
    "eight": 8,
    "9": 9,
    "nine": 9,
    "10": 10,
    "ten": 10,
    "11": 11,
    "eleven": 11,
    "12": 12,
    "twelve": 12,
    "13": 13,
    "thirteen": 13,
    "14": 14,
    "fourteen": 14,
    "15": 15,
    "fifteen": 15,
    "16": 16,
    "sixteen": 16,
    "17": 17,
    "seventeen": 17,
    "18": 18,
    "eighteen": 18,
    "19": 19,
    "nineteen": 19,
    "20": 20,
    "twenty": 20
};
// less common -> common
const SYNONYMS = {
    'downwards': 'down',
    'upwards': 'up',
    'school': 'scroll',
    'screw': 'scroll',
    'small': 'little',
    'paws': 'pause',
};
var CONFIDENCE_THRESHOLD = 0;


// prefix or suffix match
function ordinalOrNumberToDigit(input, keywords) {
    for (let i = 0; i < keywords.length; i++) {
        let keyword = keywords[i];
        let startI = input.indexOf(keyword);
        if (~startI) {
            let ordinal = input.replace(keyword, "").trim();
            console.log(`ordinal ${ordinal} keyword: ${keyword}`);
            try {
                return ORDINALS_TO_DIGITS[ordinal] || NUMBERS_TO_DIGITS[ordinal];
            } catch(e) { console.error(e); }
        }
    }
}

function expandSynonyms(input) {
    for (let syn in SYNONYMS) {
        input = input.replace(syn, SYNONYMS[syn]);
    }
    return input;
}


function init() {
	chrome.browserAction.setIcon({path: on ? ON_ICON : OFF_ICON });
}


function sendMsgToActiveTab(request) {
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, request);
    });
}


function getCmdForUserInput(input) {
    // simplifies the input into a more limited set of words
    let processedInput = expandSynonyms(input);
    for (let cmdName in COMMANDS) {
        let curCmd = COMMANDS[cmdName];
        let out;
        if (typeof curCmd.regx != 'undefined') {
            out = input.match(curCmd.regx);
        } else if (typeof curCmd.ordinalMatch != 'undefined') {
            out = ordinalOrNumberToDigit(input, curCmd.ordinalMatch);
        } else {
            out = curCmd.matches(input);
        }
        if (out) {
            return [cmdName, out];
        }
    }
    return [null, null];
}


function handleTranscript({isFinal, transcript, confidence} = {}) {
    let elapsedTime = +new Date() - lastNonFinalCmdExecutedTime;
    if (elapsedTime > COOLDOWN_TIME) {
        console.log(`elapsed time ${elapsedTime}`);
        if (isFinal) {
            lastFinalTime = +new Date();
            if (confidence <= CONFIDENCE_THRESHOLD) {
                return sendMsgToActiveTab({'liveText': {'text': transcript, 'isSuccess': false, 'isUnsure': true}});
            }
        }
        if (confidence > CONFIDENCE_THRESHOLD) {
            // console.log(`start time ${+new Date()}`);
            let [cmdName, matchOutput] = getCmdForUserInput(transcript);
            let niceOutput = null;
            console.log(`input: ${transcript}, matchOutput: ${matchOutput}, cmdName: ${cmdName}`);
            // console.log(`end time ${+new Date()}`);
            if (cmdName) {
                // prevent dupe commands when cmd is said once, but finalized much later by speech recg.
                if (isFinal && lastNonFinalCmdExecuted && lastNonFinalCmdExecuted === cmdName && (+new Date() - lastFinalTime) < FINAL_COOLDOWN_TIME) {
                    console.log("Junked dupe.");
                    return;
                }
                let cmd = COMMANDS[cmdName];
                if (typeof cmd.nice === 'string') {
                    niceOutput = cmd.nice;
                } else if (typeof cmd.nice === 'function') {
                    niceOutput = cmd.nice(matchOutput);
                }
                console.log(`running command ${cmdName} isFinal:${isFinal}`);
                lastNonFinalCmdExecuted = isFinal ? null : cmdName;
                lastNonFinalCmdExecutedTime = isFinal ? 0 : +new Date();

                executeCmd({name: cmdName, matchStr: matchOutput});
            }
            return sendMsgToActiveTab({'liveText': {'text': niceOutput ? niceOutput : transcript, 'isSuccess': cmdName !== null, 'isUnsure': false}});
        }
    }
}


function executeCmd({name, matchStr} = {}) {
    if (typeof COMMANDS[name].run !== 'undefined') {
        COMMANDS[name].run(matchStr);
    } else {
        sendMsgToActiveTab({'cmd': {'name': name, 'match': matchStr}});
    }
}


chrome.browserAction.onClicked.addListener(function(tab) {
	on = !on;
	if (on) {
		Recognizer.start();
		InterferenceAudioDetector.init();
	} else {
		Recognizer.shutdown();
        InterferenceAudioDetector.destroy();
	}
    chrome.browserAction.setIcon({path: on ? ON_ICON : OFF_ICON});
	sendMsgToActiveTab({'toggleOn': on})
});


chrome.tabs.onActivated.addListener(function(activeInfo) {
	if (typeof currentActiveTabId !== 'undefined') {
		chrome.tabs.sendMessage(currentActiveTabId, {"toggleActive": false });
	}
	chrome.tabs.sendMessage(activeInfo.tabId, {"toggleActive": true });
});


chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	if (request.bubbleDown) {
        chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
            if (request.bubbleDown.fullScreen) {
                chrome.windows.update(tabs[0].windowId, {state: "fullscreen"}, function (windowUpdated) {
                    //do whatever with the maximized window
                });
            } else if (request.bubbleDown.unFullScreen) {
                chrome.windows.update(tabs[0].windowId, {state: "maximized"}, function (windowUpdated) {
                    //do whatever with the maximized window
                });
			}
            chrome.tabs.sendMessage(tabs[0].id, request, function (response) {
                // not working (cannot get message in other content script
                sendResponse(response);
            });
        });
    }
});


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
                            console.warning(`audible ${audible}`);
                        }
                    });
                } else {
                    chrome.tabs.query({audible: true}, function (tabs) {
                        if (tabs && tabs.length > 0) {
                            audible = true;
                            console.warning(`audible ${audible}`);
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
				console.dir(event);
				chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                    handleTranscript({
                        'isFinal': lastE.isFinal,
                        'confidence': lastE[0].confidence,
                        'transcript': lastE[0].transcript.trim().toLowerCase(),
                    });
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
			    if (!needsPermission) {
                    console.log("ended. Restarting: ");
                    recognition.start();
                }
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
    'ClosePreview': (function() {
        return {
            ordinalMatch: ["close", "close preview", "shrink", "clothes"]
        };
    })(),
    'ExpandPreview': (function() {
        var opened;
        return {
            ordinalMatch: ["preview", "expand"]
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
            regx: /^(back|backwards|go back|navigate back|navigate backwards)$/
        };
    })(),
    'NavigateForward': (function() {
        return {
            regx: /^(forward|ford|go forward|navigate forward|navigate ford)$/
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
            nice: function(match) {
                return `go to r/${match}`;
            }
        };
    })(),
    'TabClose': (function() {
        return {
            regx: /^close tab$/,
            run: function() {
                chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
                    chrome.tabs.remove(tabs[0].id);
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
    'VideoFullScreen': (function() {
        return {
            regx: /^(?:fullscreen|full screen)$/
        };
    })(),
    'VideoUnFullScreen': (function() {
        return {
            regx: /^(?:unfullscreen|unfull screen|on fullscreen|on full screen|unfold screen|no full screen)$/
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
            regx: /^(top|top of page|top of the page|scroll top|scroll to top|scroll to the top of page|scroll to the top of the page)$/
        };
    })(),
    'ScrollDownLittle': (function() {
        return {
            regx: /^(little down|little scroll down|scroll little down)$/
        };
    })(),
    'ScrollDown': (function() {
        return {
            regx: /^(down|scroll down)$/
        };
    })(),
    'ScrollUpLittle': (function() {
        return {
            regx: /^(little up|little scroll up|scroll little up)$/
        };
    })(),
    'ScrollUp': (function() {
        return {
            regx: /^(up|scroll up)$/
        };
    })(),
    'Stop': (function() {
        return {
            regx: /^stop$/
        };
    })(),
    'VisitPost': (function() {
        return {
            ordinalMatch: ['click']
        };
    })(),
    'ViewComments': (function() {
        return {
            ordinalMatch: ["comments", "view comments", "commons", "comets"]
        };
    })(),
}


init();