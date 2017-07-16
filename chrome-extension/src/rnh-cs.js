var on = false;
var lastCmdExecutedTime = 0;
var lastCmdExecuted = null;
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
const LABEL_FADE_TIME = 2000;
var $previewCmdBox;
var $helpBox;
var CONFIDENCE_THRESHOLD = 0;
var SCROLL_DISTANCE = 550;
var lblTimeout;
var helpBoxOpen = false;

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

function getFrameHtml(id) {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", chrome.extension.getURL(`views/${id}.html`), false);
    xmlhttp.send();

    return xmlhttp.responseText;
}


function attachOverlay(id) {
	var $iframe = $(`<iframe class="nhm-iframe" id="nhm-${id}"></iframe>`);
    $(document.body).append($iframe);
    $iframe[0].contentDocument.write(getFrameHtml(id));

    return $iframe;
}


function thingAtIndex(i) {
	return `#siteTable>div.thing:not(.promoted):not(.linkflair-modpost):not(.stickied):eq(${i - 1})`;
}


function sendMsgToBeacon(msg) {
    retrialAndError(() => {
    	console.log(`send msg to beacon msg: ${JSON.stringify(msg)}`)
        chrome.runtime.sendMessage({bubbleDown: msg}, function (response) {
            console.log("orig sender received response " + response);
            if (response) {
                console.log("RECEIVED response!");
            }
        });
	}, null, 2000, 2);
}


var COMMANDS = {
	'ClosePreview': (function() {
		return {
			ordinalMatch: ["close", "close preview", "shrink", "clothes"],
			run: function(i) {
				try {
					// close
					opened.click();
				} catch (e) {}
				opened = $(thingAtIndex(i) + ' .expando-button.expanded').click();
			}
		};
	})(),
	'ExpandPreview': (function() {
		var opened;
		return {
			ordinalMatch: ["preview", "expand"],
			run: function(i) {
				try {
					// close
					opened.click();
				} catch (e) {}
				opened = $(thingAtIndex(i) + ' .expando-button').click();
			}
		};
	})(),
    'HelpOpen': (function() {
        return {
            regx: /^help$|(open help|help open|commands)/,
            run: function() {
                if (!$.contains(document.body, $helpBox)) {
                    $helpBox = attachOverlay('help-box');
                }
                helpBoxOpen = true;
                $helpBox.show();
            }
        };
    })(),
    'HelpClose': (function() {
        return {
            regx: /(close help|help close|closeout|close up)/,
			nice: 'close help',
            run: function() {
            	helpBoxOpen = false;
                $helpBox.hide();
            }
        };
    })(),
	'NavigateBackward': (function() {
		return {
			regx: /(back|backwards|go back|navigate back|navigate backwards)/,
			run: function() {
				window.history.back();
			}
		};
	})(),
	'NavigateForward': (function() {
		return {
			regx: /(forward|ford|go forward|navigate forward|navigate ford)/,
			run: function() {
				window.history.forward();
			}
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
			run: function(subreddit_name) {
				window.location.href = `https://www.reddit.com/r/${subreddit_name}`;
			},
			nice: function(match) {
				return `go to r/${match}`;
			}
		};
	})(),
    'VideoFullScreen': (function() {
        return {
            regx: /^(?:fullscreen|full screen)$/,
            run: function(i) {
                let $ele = $('.thing .expando-button.expanded').closest('*[data-url]');
                let videoUrl = $ele.data('url');
                let redditId = $ele.data('fullname').split('_')[1];
                let $iframe = $ele.find('iframe');
                $iframe.toggleClass('nhm-full-screen', true);
                console.log(`video url ${videoUrl}. Reddit id ${redditId}`);

                sendMsgToBeacon({fullScreen: {redditId: redditId, videoUrl: videoUrl }});
            },
        };
    })(),
    'VideoUnFullScreen': (function() {
        return {
            regx: /(?:unfullscreen|unfull screen|on fullscreen|on full screen|unfold screen|no full screen)/,
            run: function(i) {
                let $ele = $('.thing .expando-button.expanded').closest('*[data-url]');
                let videoUrl = $ele.data('url');
                let redditId = $ele.data('fullname').split('_')[1];
                let $iframe = $ele.find('iframe');
                $iframe.toggleClass('nhm-full-screen', false);
                console.log(`video url ${videoUrl}. Reddit id ${redditId}`);

                sendMsgToBeacon({unFullScreen: {redditId: redditId, videoUrl: videoUrl }});
            },
        };
    })(),
	'VideoPause': (function() {
		return {
		    regx: /(pause|pause video)/,
			run: function(i) {
                let videoUrl = $('.thing .expando-button.expanded').closest('*[data-url]').data('url');
                console.log(`video url ${videoUrl}`);

                sendMsgToBeacon({pauseVideo: videoUrl});
			},
		};
	})(),
	'VideoPlay': (function() {
		return {
			ordinalMatch: ['play'],
			run: function(i) {
				// get the unique video url
				let videoUrl;
				$(thingAtIndex(i) + ' .expando-button.collapsed').click();
				videoUrl = $(thingAtIndex(i)).data('url');
				console.log(`video url ${videoUrl}`);

                sendMsgToBeacon({playVideo: videoUrl});
			},
		};
	})(),
    'VideoResume': (function() {
    	// Works with any video that may have started, even with the mouse
        return {
            regx: /(resume)/,
            run: function(i) {
                let videoUrl = $('.thing .expando-button.expanded').closest('*[data-url]').data('url');
                console.log(`video url ${videoUrl}`);
                // send it a few times
                sendMsgToBeacon({playVideo: videoUrl});
            },
        };
    })(),
	'Reddit': (function() {
		return {
			regx: /(home|reddit|reddit.com|read it)/,
			run: function() {
				document.location.href = "https://www.reddit.com";
			},
		};
	})(),
	'Refresh': (function() {
		return {
			regx: /refresh/,
			run: function() {
				location.reload();
			}
		};
	})(),
	'ScrollBottom': (function() {
		return {
		    regx: /(bottom|bottom of page|bottom of the page|scroll bottom|scroll to bottom|scroll to the bottom of page|scroll to the bottom of the page)/,
			run: function() {
				console.log("SCROLL BOTTOM");
				$('html, body').animate({ scrollTop:  document.body.scrollHeight });
			},
		};
	})(),
	'ScrollTop': (function() {
		return {
		    regx: /(top|top of page|top of the page|scroll top|scroll to top|scroll to the top of page|scroll to the top of the page)/,
			run: function() {
				$('html, body').animate({ scrollTop:  0 });
			},
		};
	})(),
	'ScrollDownLittle': (function() {
		return {
		    regx: /(little down|little scroll down|scroll little down)/,
			run: function() {
				$('html, body').animate({ scrollTop:  window.scrollY + SCROLL_DISTANCE/2 });
			},
		};
	})(),
	'ScrollDown': (function() {
		return {
		    regx: /(down|scroll down)/,
			run: function() {
				$('html, body').animate({ scrollTop:  window.scrollY + SCROLL_DISTANCE });
			},
		};
	})(),
	'ScrollUpLittle': (function() {
		return {
			regx: /(little up|little scroll up|scroll little up)/,
			run: function() {
				$('html, body').animate({ scrollTop:  window.scrollY - SCROLL_DISTANCE/2 });
			},
		};
	})(),
	'ScrollUp': (function() {
		return {
			regx: /(up|scroll up)/,
			run: function() {
				$('html, body').animate({ scrollTop:  window.scrollY - SCROLL_DISTANCE });
			},
		};
	})(),
	'Stop': (function() {
		return {
			regx: /stop/,
			run: function() {
				window.stop();
			}
		};
	})(),
	'VisitPost': (function() {
		return {
			ordinalMatch: ['click'],
			run: function(i) {
				$(thingAtIndex(i) + ' a.title')[0].click();
			},
		};
	})(),
	'ViewComments': (function() {
		return {
			ordinalMatch: ["comments", "view comments", "commons", "comets"],
			run: function(i) {
				$(thingAtIndex(i) + ' a.comments')[0].click();
			},
		};
	})(),
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


// f is what needs to be done
// f_check checks whether it was done
// delay is the gap between tries
function retrialAndError(f, f_check, delay, times) {
	if (times > 0) {
	    console.log("calling");
		f();
		setTimeout(function() {
			if (f_check && !f_check())	{
                return retrialAndError(f, f_check, delay, times - 1);
			} else if (!f_check) {
                return retrialAndError(f, f_check, delay, times - 1);
			}
		}, delay);
	}
}


function init(quiet) {
    retrialAndError(function() {
        $(document).ready(function () {
            if (on) {
                $previewCmdBox = attachOverlay('preview-cmd-box');
            }
            if (typeof quiet === 'undefined' || quiet === false) {
                showLabel("Ready", false, false);
            }
        });
    }, function() {
    	return document.body.contains($previewCmdBox[0]);
	}, LABEL_FADE_TIME - 200, 5);
    retrialAndError(function() {
		$(document).ready(function() {
			if (on) {
			    console.log("opening");
                $helpBox = attachOverlay('help-box');
                helpBoxOpen = true;
            }
		});
	}, function() {
        return !helpBoxOpen || document.body.contains($helpBox[0]);
	}, 2000, 5);
}


function destroy() {
	if (!on) {
		try {
			$previewCmdBox.remove();
		} catch(e) {}
        try {
            $helpBox.remove();
        } catch(e) {}
	}
}


function showLabel(text, isSuccess, isUnsure) {
	// our element might not get reattached or might get removed from
	//   * bf cache
	//   * dom body overwrites from js
	if (typeof $previewCmdBox === 'undefined' || !document.body.contains($previewCmdBox[0])) {
	    $previewCmdBox = attachOverlay('preview-cmd-box');
	}
    let $previewCmdLbl = $previewCmdBox.contents().find('.preview-cmd');
	clearTimeout(lblTimeout);
	$previewCmdLbl.toggleClass('success', isSuccess);
	$previewCmdLbl.toggleClass('unsure', isUnsure);
	$previewCmdLbl.text(text);
	$previewCmdLbl.toggleClass('visible', true);
	lblTimeout = setTimeout(function() {
		$previewCmdLbl.toggleClass('visible', false);
	}, LABEL_FADE_TIME);
}


// TODO: needs tests
chrome.runtime.onMessage.addListener(function(msg) {
	if (typeof msg.userInput !== 'undefined') {
		let elapsedTime = +new Date() - lastCmdExecutedTime;
	    if (elapsedTime > COOLDOWN_TIME) {
	        console.log(`elapsed time ${elapsedTime}`);
            let text = msg.userInput.transcript;
            if (msg.userInput.isFinal) {
                lastFinalTime = +new Date();
                if (msg.userInput.confidence <= CONFIDENCE_THRESHOLD) {
                    return showLabel(text, false, true);
                }
            }
            if (msg.userInput.confidence > CONFIDENCE_THRESHOLD) {
                // console.log(`start time ${+new Date()}`);
                let [cmdName, matchOutput] = getCmdForUserInput(text);
                let niceOutput = null;
                console.log(`input: ${text}, matchOutput: ${matchOutput}, cmdName: ${cmdName}`);
                // console.log(`end time ${+new Date()}`);
                if (cmdName) {
                    // prevent dupe commands when cmd is said once, but finalized much later by speech recg.
                    if (msg.userInput.isFinal && lastCmdExecuted && lastCmdExecuted === cmdName && (+new Date() - lastFinalTime) < FINAL_COOLDOWN_TIME) {
                    	console.log("Junked dupe.");
                    	return;
					}
                    let cmd = COMMANDS[cmdName];
                    if (typeof cmd.nice === 'string') {
                        niceOutput = cmd.nice;
                    } else if (typeof cmd.nice === 'function') {
                        niceOutput = cmd.nice(matchOutput);
                    }
                    console.log(`running command ${cmdName} isFinal:${msg.userInput.isFinal}`);
                    lastCmdExecuted = cmdName;
                    lastCmdExecutedTime = +new Date();
                    cmd.run(matchOutput);
                }
                return showLabel(niceOutput ? niceOutput : text, cmdName !== null, false);
            }
        }
	} else if (typeof msg.toggleOn !== 'undefined') {
		on = msg.toggleOn;
		if (on) {
			init();
		} else {
			destroy();
		}
	} else if (typeof msg.toggleActive !== "undefined") {
		if (msg.toggleActive) {
			init(true);
		} else {
			destroy();
		}
	}
});
