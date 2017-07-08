var on = false;
var currentActiveTabId;
var needsPermission = false;
var ON_ICON = "assets/icon-on-128.png";
var OFF_ICON = "assets/icon-off-128.png";


function init() {
	chrome.browserAction.setIcon({path: on ? ON_ICON : OFF_ICON });
}


chrome.browserAction.onClicked.addListener(function(tab) {
	on = !on;
	if (on) {
		Recognizer.start();
	} else {
		Recognizer.shutdown();
	}
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		chrome.browserAction.setIcon({path: on ? ON_ICON : OFF_ICON});
		chrome.tabs.sendMessage(tabs[0].id, {"toggleOn": on });
	});
});


chrome.tabs.onActivated.addListener(function(activeInfo) {
	if (typeof currentActiveTabId !== 'undefined') {
		chrome.tabs.sendMessage(currentActiveTabId, {"toggleActive": false });
	}
	chrome.tabs.sendMessage(activeInfo.tabId, {"toggleActive": true });
});


chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	if (request.playVideo || request.pauseVideo) {
        chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, request, function (response) {
                // not working (cannot get message in other content script
                sendResponse(response);
            });
        });
    }
});


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
				chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
					chrome.tabs.sendMessage(tabs[0].id, { 'userInput': {
						'isFinal': lastE.isFinal,
						'confidence': lastE[0].confidence,
						'transcript': lastE[0].transcript.trim().toLowerCase(),
					} });
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
                        alert("error " + event.error);
                    }
                }
			};

			recognition.onnomatch = function(event) {
				// showLabel("No match");
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


init();