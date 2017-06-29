var on = false;

chrome.browserAction.onClicked.addListener(function(tab) {
	on = !on;
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		chrome.browserAction.setIcon({path: on ? "icon-on-128.png" : "icon-off-128.png", tabId:tabs[0].id});
		chrome.tabs.sendMessage(tabs[0].id, {"toggleOn": on });
	});
});
