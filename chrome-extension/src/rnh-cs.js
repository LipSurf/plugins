var on = false;
const ORDINALS_TO_DIGITS = {
	"first": 1,
	"1st": 1,
	"I": 1,
	"second": 2,
	"2nd": 2,
	"II": 2,
	"third": 3,
	"3rd": 3,
	"III": 3,
	"fourth": 4,
	"forth": 4,
	"4th": 4,
	"IV": 4,
	"fifth": 5,
	"5th": 5,
	"V": 5,
	"sixth": 6,
	"6th": 6,
	"VI": 6,
	"seventh": 7,
	"7th": 7,
	"VII": 7,
	"eigth": 8,
	"8th": 8,
	"VIII": 8,
	"ninth": 9,
	"9th": 9,
	"IX": 9,
	"tenth": 10,
	"10th": 10,
	"X": 10,
	"eleventh": 11,
	"11th": 11,
	"XI": 11,
	"twelfe": 12,
	"twelve": 12,
	"12th": 12,
	"XII": 12,
	"thirteenth": 13,
	"13th": 13,
	"XIII": 13,
	"fourteenth": 14,
	"14th": 14,
	"fourteen": 14,
	"XIV": 14,
	"fifteenth": 15,
	"15th": 15,
	"XV": 15,
	"sixteenth": 16,
	"16th": 16,
	"XVI": 16,
	"seventeenth": 17,
	"17th": 17,
	"XVII": 17,
	"eighteenth": 18,
	"18th": 18,
	"XVIII": 18,
	"nineteenth": 19,
	"19th": 19,
	"XIX": 19,
	"twentieth": 20,
	"20th": 20,
	"XX": 20,
};
const NUMBERS_TO_DIGITS = {
	"1": 1,
	"one": 1,
	"2": 2,
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
var $previewCommandBox = $('<div class="cont"><div class="preview-command">Hi</div></div>');
var $previewCommandLbl = $previewCommandBox.find('.preview-command');
var $helpBox = $(`<div class="help-box">
	<div class="top-bar">
		<span class="close-btn">×</span>
    </div>
	<h4>Command Examples</h4>
	<div>Click [number - eg. six/sixth]</div>
	<div>Preview [number]</div>
	<div>Comments [number]</div>
	<div>Scroll down</div>
	<div>Top</div>
	<div>Scroll down a little</div>
	<div>Back</div>
	<div>Forward</div>
	<div>R [subreddit name] (goes to subreddit r/[subreddit name])</div>
	<div>Play 7</div>
	<div>Pause</div>
	<div>Resume</div>
	<div>Refresh</div>
	<div>Reddit</div>
	<div>Help</div>
	<div>Close help</div>
</div>`);
var CONFIDENCE_THRESHOLD = 0;
var SCROLL_DISTANCE = 550;
var lblTimeout;

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


function thingAtIndex(i) {
	return `#siteTable>div.thing:not(.promoted):not(.linkflair-modpost):not(.stickied):eq(${i - 1})`;
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
                $helpBox.show();
            }
        };
    })(),
    'HelpClose': (function() {
        return {
            regx: /(close help|help close)/,
            run: function() {
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
				return `Go to r/${match}`;
			}
		};
	})(),
	'PreviewPause': (function() {
		return {
		    regx: /(pause|pause video)/,
			run: function(i) {
                let videoUrl = $('.thing .expando-button.expanded').closest('*[data-url]').data('url');
                console.log(`video url ${videoUrl}`);
                // send it a few times
                function sendMsg(tm, counter) {
                    if (counter > 0) {
                        setTimeout(function () {
                            console.log("sending...");
                            chrome.runtime.sendMessage({pauseVideo: videoUrl}, function (response) {
                                console.log("orig sender received response " + response);
                                if (response) {
                                    console.log("RECEIVED response!");
                                } else {
                                    sendMsg(2000, counter - 1);
                                }
                            });
                        }, tm);
                    }
                }
                sendMsg(0, 5);
			},
		};
	})(),
	'PreviewPlay': (function() {
		return {
			ordinalMatch: ['play'],
			run: function(i) {
				// get the unique video url
				let videoUrl;
				$(thingAtIndex(i) + ' .expando-button.collapsed').click();
				videoUrl = $(thingAtIndex(i)).data('url');
				console.log(`video url ${videoUrl}`);

				// send it a few times
				function sendMsg(tm, counter) {
					if (counter > 0) {
                        setTimeout(function () {
                            console.log("sending...");
                            chrome.runtime.sendMessage({playVideo: videoUrl}, function (response) {
                            	console.log("orig sender received response " + response);
                                if (response) {
                                    console.log("RECEIVED response!");
                                } else {
                                    sendMsg(2000, counter - 1);
                                }
                            });
                        }, tm);
                    }
				}
				sendMsg(0, 5);
			},
		};
	})(),
    'PreviewResume': (function() {
    	// Works with any video that may have started, even with the mouse
        return {
            regx: /(resume)/,
            run: function(i) {
                let videoUrl = $('.thing .expando-button.expanded').closest('*[data-url]').data('url');
                console.log(`video url ${videoUrl}`);
                // send it a few times
                function sendMsg(tm, counter) {
                    if (counter > 0) {
                        setTimeout(function () {
                            console.log("sending...");
                            chrome.runtime.sendMessage({playVideo: videoUrl}, function (response) {
                                console.log("orig sender received response " + response);
                                if (response) {
                                    console.log("RECEIVED response!");
                                } else {
                                    sendMsg(2000, counter - 1);
                                }
                            });
                        }, tm);
                    }
                }
                sendMsg(0, 5);
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
		    regx: /(scroll down a little|scroll down little|scroll downwards a little|scroll downwards little)/,
			run: function() {
				$('html, body').animate({ scrollTop:  window.scrollY + SCROLL_DISTANCE/2 });
			},
		};
	})(),
	'ScrollDown': (function() {
		return {
		    regx: /(scroll down|scroll downwards)/,
			run: function() {
				$('html, body').animate({ scrollTop:  window.scrollY + SCROLL_DISTANCE });
			},
		};
	})(),
	'ScrollUpLittle': (function() {
		return {
			regx: /(scroll up a little|scroll up little|scroll upwards a little|scroll upwards little)/,
			run: function() {
				$('html, body').animate({ scrollTop:  window.scrollY - SCROLL_DISTANCE/2 });
			},
		};
	})(),
	'ScrollUp': (function() {
		return {
			regx: /(scroll up|scroll upwards)/,
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



function init(quiet) {
	$(document).ready(function() {
		if (on) {
			$('body').append($previewCommandBox);
			$('body').append($helpBox);

            $helpBox.find('.close-btn').click(function() {
                $helpBox.hide();
            });

			if (typeof quiet === 'undefined' || quiet === false) {
				showLabel("Ready", false, false);
			}
		}
	});
}


function destroy() {
	if (!on) {
		try {
			$previewCommandBox.remove();
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
	if (!$.contains(document.body, $previewCommandBox)) {
		$('body').append($previewCommandBox);
	}
	clearTimeout(lblTimeout);
	$previewCommandLbl.toggleClass('success', isSuccess);
	$previewCommandLbl.toggleClass('unsure', isUnsure);
	$previewCommandLbl.text(text);
	$previewCommandLbl.toggleClass('visible', true);
	lblTimeout = setTimeout(function() {
		$previewCommandLbl.toggleClass('visible', false);
	}, 2000);
}


// TODO: needs tests
chrome.runtime.onMessage.addListener(function(msg) {
	if (typeof msg.userInput !== 'undefined') {
		let text = msg.userInput.transcript;
		if (msg.userInput.isFinal) {
			if (msg.userInput.confidence > CONFIDENCE_THRESHOLD) {
				let [cmdName, matchOutput] = getCmdForUserInput(text);
				let niceOutput = null;
				console.log(`matchOutput: ${matchOutput}, cmdName: ${cmdName}`);
				if (cmdName) {
					let cmd = COMMANDS[cmdName];
					if (typeof cmd.nice !== 'undefined') {
						niceOutput = cmd.nice(matchOutput);
					}
					cmd.run(matchOutput);
				}
				return showLabel(niceOutput ? niceOutput : text, cmdName !== null, false);
			} else {
				alert('not confident');
				return showLabel(text, false, true);
			}
		}
		return showLabel(text, false, false);
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
