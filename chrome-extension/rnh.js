var $previewCommandBox = $('<div class="cont"><div class="preview-command">Hi</div></div>');
var $previewCommandLbl = $previewCommandBox.find('.preview-command');
var ORDINALS_TO_DIGITS = {
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
};
var recognition;

$(document).ready(function() {

	function init() {
		$('body').append($previewCommandBox);
		showLabel("Ready");
		recognition = new webkitSpeechRecognition();
		recognition.continuous = true;
		recognition.interimResults = true;
		recognition.lang = 'en-US';
		recognition.maxAlternatives = 1;
		recognition.start();

		recognition.onresult = function(event) {
			var lastI = event.results.length - 1;
			var text = event.results[lastI][0].transcript;
			console.log(event);
			showLabel(text);
			// tryCommand(text);
		};

		recognition.onerror = function(event) {
			console.error("Speech recognition error: " + event.error);
		};

		recognition.onnomatch = function(event) {
			showLabel("No match");
		};

		recognition.onend = function() {
			console.log("ended. Restarting: ");
			recognition.start();
		};

		// recognition.onspee
	}

	function stop() {
		recognition.stop();
	}

	function showLabel(text) {
		$previewCommandLbl.text(text);
	}

	var ExpandCommand = (function() {
		var opened;
		return {
			matches: function(input) {
				let prefixMatch = "preview "
				let prevI = input.indexOf(prefixMatch);
				if (~prevI) {
					let ordinal = input.substring(prefixMatch.length, input.length).trim();
					console.log("ordinal: " + ordinal);
					try {
						return ORDINALS_TO_DIGITS[ordinal];
					} catch(e) { console.error(e); }

				}
			},
			run: function(i) {
				try {
					// close
					opened.click();
				} catch (e) {}
				opened = $('#siteTable>div.thing:eq(' + (i) + ') .expando-button').click();
			}
		}
	})();

	var NavigateToSubreddit = (function() {
		var REGX = /(?:go to |show )?(?:are|our|r) (.*)/;
		return {
			matches: function(input) {
				let match = REGX.exec(input);
				if (match) {
					console.log(match);
					return match[1];
				}
			},
			run: function(subreddit_name) {
				window.location.href = "https://www.reddit.com/r/" + subreddit_name.replace(" ", "");
			}
		};
	})();

	var NavigateBackward = (function() {
		return {
			matches: function(input) {
				return ~$.inArray(input, ['back', 'go back', 'navigate back']);
			},
			run: function() {
				window.history.back();
			}
		};
	})();

	var NavigateForward = (function() {
		return {
			matches: function(input) {
				return $.inArray(input, ['forward', 'go forward', 'navigate forward']);
			},
			run: function() {
				window.history.back();
			}
		};
	})();

	function tryCommand(input) {
		for (let i = 0; i < COMMANDS.length; i++) {
			let cmd = COMMANDS[i];
			let match = cmd.matches(input);
			if (match) {
				console.log("match: " + match);
				cmd.run(match);
				break;
			}
		};
	}

	var COMMANDS = [
		ExpandCommand,
		NavigateToSubreddit,
		NavigateForward,
		NavigateBackward,
	];

	init();
});
