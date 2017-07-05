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
	"XX": 20
};
const NUMBERS_TO_DIGITS = {
	"one": 1,
	"two": 2,
	"three": 3,
	"four": 4,
	"five": 5,
	"six": 6,
	"seven": 7,
	"eight": 8,
	"nine": 9,
	"ten": 10,
	"eleven": 11,
	"twelve": 12,
	"thirteen": 13,
	"fourteen": 14,
	"fifteen": 15,
	"sixteen": 16,
	"seventeen": 17,
	"eighteen": 18,
	"nineteen": 19,
	"twenty": 20
};


// prefix or suffix match
function ordinalMatch(input, keywords) {
	for (let i = 0; i < keywords.length; i++) {
		let keyword = keywords[i];
		let startI = input.indexOf(keyword);
		if (~startI) {
			let ordinal = input.replace(keyword, "").trim();
			console.log(`ordinal ${ordinal} keyword: ${keyword}`);
			try {
				return ORDINALS_TO_DIGITS[ordinal];
			} catch(e) { console.error(e); }
		}
	}
}


var COMMANDS = {
	'Reddit': (function() {
		return {
			regx: /(home|reddit|reddit.com|read it)/,
			run: function() {
				document.location.href = "https://www.reddit.com";
			},
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
				opened = $('#siteTable>div.thing:eq(' + (i - 1) + ') .expando-button').click();
			}
		};
	})(),
	'ClosePreview': (function() {
		return {
			ordinalMatch: ["close", "close preview", "shrink", "clothes"],
			run: function(i) {
				try {
					// close
					opened.click();
				} catch (e) {}
				opened = $('#siteTable>div.thing:eq(' + (i - 1) + ') .expando-button.expanded').click();
			}
		};
	})(),
	'PlayPreview': (function() {
		return {
			ordinalMatch: ['play'],
			run: function(i) {
				let iframe1 = $('div.thing:eq(' + (i - 1) + ') .expando iframe')[0];
				console.log(iframe1.contentWindow);
				let iframe2 = $('iframe', iframe1.contentWindow);
				console.log(iframe2.contentWindow);
				$('div.thing:eq(' + (i - 1) + ') button.ytp-large-play-button')[0].click();
			},
		};
	})(),
	'Pause': (function() {
		return {
			ordinalMatch: ['play'],
			run: function(i) {
				$('div.thing:eq(' + (i - 1) + ') button.ytp-large-play-button')[0].click();
			},
		};
	})(),
	'VisitPost': (function() {
		return {
			ordinalMatch: ['click'],
			run: function(i) {
				$('div.thing:eq(' + (i - 1) + ') a.title')[0].click();
			},
		};
	})(),
	'ViewComments': (function() {
		return {
			ordinalMatch: ["comments", "view comments", "commons", "comets"],
			run: function(i) {
				$('div.thing:eq(' + (i - 1) + ') a.comments')[0].click();
			},
		};
	})(),
	'ScrollBottom': (function() {
		return {
		    regx: /(bottom|bottom of page|bottom of the page|scroll bottom|scroll to bottom|scroll to the bottom of page|scroll to the bottom of the page)/,
			run: function() {
				console.log("SCROLL BOTTOM");
				$('html, body').animate({ scrollTop:  document.body.scrollHeight }, 'slow');
			},
		};
	})(),
	'ScrollTop': (function() {
		return {
		    regx: /(top|top of page|top of the page|scroll top|scroll to top|scroll to the top of page|scroll to the top of the page)/,
			run: function() {
				$('html, body').animate({ scrollTop:  0 }, 'slow');
			},
		};
	})(),
	'ScrollDownLittle': (function() {
		return {
		    regx: /(scroll down a little|scroll down little|scroll downwards a little|scroll downwards little)/,
			run: function() {
				$('html, body').animate({ scrollTop:  window.scrollY + SCROLL_DISTANCE/2 }, 'slow');
			},
		};
	})(),
	'ScrollDown': (function() {
		return {
		    regx: /(scroll down|scroll downwards)/,
			run: function() {
				$('html, body').animate({ scrollTop:  window.scrollY + SCROLL_DISTANCE }, 'slow');
			},
		};
	})(),
	'ScrollUpLittle': (function() {
		return {
			regx: /(scroll up a little|scroll up little|scroll upwards a little|scroll upwards little)/,
			run: function() {
				$('html, body').animate({ scrollTop:  window.scrollY + SCROLL_DISTANCE/2 }, 'slow');
			},
		};
	})(),
	'ScrollUp': (function() {
		return {
			regx: /(scroll up|scroll upwards)/,
			run: function() {
				$('html, body').animate({ scrollTop:  window.scrollY - SCROLL_DISTANCE }, 'slow');
			},
		};
	})(),
	'NavigateToSubreddit': (function() {
		var REGX = new RegExp('^(?:go to |show )?(?:are|our|r) (.*)', 'i');
		return {
			matches: function(input) {
				let match = input.match(REGX, input);
				if (match) {
					console.log(match);
					return match[1];
				}
			},
			run: function(subreddit_name) {
				window.location.href = "https://www.reddit.com/r/" + subreddit_name.replace(" ", "");
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
}


function tryCmd(input) {
	let [cmdName, matchOutput] = getCmdForUserInput(input);
	console.log(`matchOutput: ${matchOutput}, cmdName: ${cmdName}`);
	if (cmdName) {
		recognizeSuccess();
		COMMANDS[cmdName].run(matchOutput);
	}
}


function getCmdForUserInput(input) {
	for (let cmdName in COMMANDS) {
		let curCmd = COMMANDS[cmdName];
		let out;
		if (typeof curCmd.regx != 'undefined') {
			out = input.match(curCmd.regx);
		} else if (typeof curCmd.ordinalMatch != 'undefined') {
			out = ordinalMatch(input, curCmd.ordinalMatch);
		} else {
			out = curCmd.matches(input);
		}
		if (out) {
			return [cmdName, out];
		}
	}
}
