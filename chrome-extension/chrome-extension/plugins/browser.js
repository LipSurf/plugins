// ==UserVoiceScript==
// less common -> common
var homophones = {
    'closeout': 'close help',
    'close up': 'close help',
    'close tap': 'close tab',
    'app': 'up',
    'downwards': 'down',
    'downward': 'down',
    'middletown': 'little down',
    'backwards': 'back',
    'backward': 'back',
    'ford': 'forward',
    'forwards': 'forward',
    'upwards': 'up',
    'upward': 'up',
    'newtown': 'new tab',
    'utah': 'new tab',
    'school': 'scroll',
    'screw': 'scroll',
    'small': 'little',
    'time': 'next',
	'clothes': 'close',
};

var commands = [
	{
		name: 'Close Help',
		description: "Close the help box.",
		match: "close help",
	    runOnPage: function() {
	    	helpBoxOpen = false;
	        $helpBox.hide();
	    }
	},
	{
		name: 'Open Help',
		description: "Open the help box.",
		match: ["help", "open help", "help open", "commands"],
	    runOnPage: function() {
	        if (!$.contains(document.body, $helpBox)) {
	            $helpBox = attachOverlay('help-box');
	        }
	        helpBoxOpen = true;
	        $helpBox.show();
	    }
	},
	{
		name: 'Go Back',
		description: "Equivalent of hitting the back button.",
		match: ["back", "go back"],
		runOnPage: function() {
			window.history.back();
		}
	},
	{
		name: 'Go Forward',
		description: "Equivalent of hitting the forward button.",
		match: ["forward", "go forward"],
		runOnPage: function() {
			window.history.forward();
		}
	},
	{
		name: 'Refresh',
		description: "Refresh the page.",
		match: "refresh",
		runOnPage: function() {
			location.reload();
		}
	},
	{
		name: 'Scroll Bottom',
		match: ["bottom", "bottom of page", "bottom of the page", "scroll bottom", "scroll to bottom", "scroll to the bottom of page", "scroll to the bottom of the page"],
		runOnPage: function() {
			$('html, body').animate({ scrollTop:  document.body.scrollHeight });
		},
	},
	{
		name: 'Scroll Down a Little',
		match: ["little down", "little scroll down", "scroll little down", "down little"],
		runOnPage: function() {
			$('html, body').animate({ scrollTop:  window.scrollY + SCROLL_DISTANCE/2 });
		},
	},
	{
		name: 'Scroll Down',
		match: ["down", "scroll down"],
		// We introduce a delay to distinguish between "down" "down a little" and "downvote"
		delay: [300, 0],
		runOnPage: function() {
			$('html, body').animate({ scrollTop:  window.scrollY + SCROLL_DISTANCE });
		},
	},
	{
		name: 'Scroll Top',
		match: ["top", "top of page", "scrolltop", "top of the page", "scroll top", "scroll to top", "scroll to the top of page", "scroll to the top of the page"],
		runOnPage: function() {
			$('html, body').animate({ scrollTop:  0 });
		},
	},
	{
		name: 'Scroll Up a Little',
		match: ["little up", "little scroll up", "scroll little up", "up little"],
		runOnPage: function() {
			$('html, body').animate({ scrollTop:  window.scrollY - SCROLL_DISTANCE/2 });
		},
	},
	{
		name: 'Scroll Up',
		match: ["up", "scroll up"],
		delay: [300, 0],
		runOnPage: function() {
			$('html, body').animate({ scrollTop:  window.scrollY - SCROLL_DISTANCE });
		},
	},
	{
		name: 'Stop',
		description: "Equivalent of hitting the \"stop\" button to stop page navigation.",
		match: "stop",
		runOnPage: function() {
			window.stop();
		}
	},
	{
		name: 'Close Tab',
		match: "close tab",
		run: () => {
			// window.close cannot close windows that weren't opened via js
			Util.queryActiveTab(function(tab) {
				chrome.tabs.remove(tab.id);
			});
		},
		test: async function() {
		    var beforeLen;
		    await this.driver.executeScript('window.open("https://www.google.com");');
		    await this.driver.wait(() => {
			return this.driver.getTitle().then(function(title) {
			    return ~title.indexOf('Google');
			});
		    }, 1500);
		    beforeLen = (await this.driver.getAllWindowHandles()).length;
		    await this.say();
		    // if the timeout is elapsed, then the tab wasn't closed
		    await this.driver.wait(() => {
			return this.driver.getAllWindowHandles().then(function(handles) {
			    return handles.length === beforeLen - 1;
			});
		    }, 1000);
		}
	},
	{
		name: 'Next Tab',
		match: ["next tab"],
		run: () => {
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
	},
	{
		name: 'New Tab',
		match: ["new tab", "open tab"],
		run: () => {
		    // open in google because default start page does not allow CS
		    chrome.tabs.create({active: true, url: 'https://www.google.com'});
		},
		test: async function() {
		    var beforeLen = (await this.driver.getAllWindowHandles()).length;
		    await this.say();
		    var afterLen = (await this.driver.getAllWindowHandles()).length;
		    await this.timeout(400);
		    this.assert.equal(afterLen, beforeLen + 1);
		},
	},
	{
		name: 'Previous Tab',
		match: "previous tab",
		run: () => {
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
	},
	{
		name: 'Select Tab',
		description: "Select a tab by it's position.",
		match: ['tab #'],
		run: () => {
			chrome.tabs.query({index: i - 1, currentWindow: true}, function(tabs) {
				chrome.tabs.update(tabs[0].id, {active: true});
			});
		}
	},
];

module.exports = {
	name: 'Browser',
	description: 'Controls browser-level actions like creating new tabs, page navigation (back, forward, scroll down), showing help etc.',
	version: '1.0.0',
	matches: /.*/,
	commands: commands,
	homophones: homophones,
};
