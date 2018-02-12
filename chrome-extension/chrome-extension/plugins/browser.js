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
    'little rock': 'little up',
    'school little rock': 'scroll little up',
    'time of the page': 'top of the page',
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
    'scrolltop': 'scroll top',
};

var commands = [{
    name: 'Close Help',
    description: "Close the help box.",
    match: "close help",
    runOnPage: function() {
        helpBoxOpen = false;
        $helpBox.hide();
    }
}, {
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
}, {
    name: 'Go Back',
    description: "Equivalent of hitting the back button.",
    match: ["back", "go back"],
    runOnPage: function() {
        window.history.back();
    },
    test: async function() {
        var secondPageUrl;
        var initialPageUrl = await this.driver.getCurrentUrl();
        await this.loadPage('https://www.duckduckgo.com');
        secondPageUrl = await this.driver.getCurrentUrl();
        this.assert(secondPageUrl !== initialPageUrl);
        await this.say();
        await this.driver.wait(async () => {
            return (await this.driver.getCurrentUrl()) === initialPageUrl;
        }, 1000);
    }
}, {
    name: 'Go Forward',
    description: "Equivalent of hitting the forward button.",
    match: ["forward", "go forward"],
    runOnPage: function() {
        window.history.forward();
    },
    test: async function() {
        var secondPageUrl;
        var initialPageUrl = await this.driver.getCurrentUrl();
        await this.loadPage('https://www.duckduckgo.com');
        secondPageUrl = await this.driver.getCurrentUrl();
        this.assert(secondPageUrl !== initialPageUrl);
        await this.driver.navigate().back();
        await this.say();
        await this.driver.wait(async () => {
            return (await this.driver.getCurrentUrl()) === secondPageUrl;
        }, 1000);
    }
}, {
    name: 'Play Video',
    match: ['play #', 'play'],
    runOnPage: function(i) {
        // tested for youtube, twitch, streamable
        // vimeo -- needs a click to work -- because autoplay is off?

        // query all videos that are visible and in frame
        // ask all iframes for their videos
        queryAllFrames('video', ['src', 'style.width', 'style.height', 'duration'])
            .then((res) => {
                // filter out undefined and null
                let filtered = res.filter((x) => x && x.length > 0);

                // rank by the most reasonable choice to play
                // criteria: video size
                // in the future let user disambiguate
                filtered.sort((e) => {
                    return e[0];
                });

                postToAllFrames({id: filtered[0][0], fnNames: ['click']});

                //if it's still not playing after a click
                //setTimeout(function() {
                    //postToAllFrames({selector: 'video', fnNames: ['play']});
                    ////postToAllFrames(flattened[0][0], ['click']);
                //}, 10000);
            });


        // TODO: make this a setting
        //scrollTo($ele);
    },
    test: async function() {
        await this.loadPage('https://www.reddit.com/r/videos/comments/7iv0n6/mike_tyson_hitting_a_heavy_bag_is_terrifying/');
        await this.say();
        this.assert(false);
    }
}, {
    name: 'Refresh',
    description: "Refresh the page.",
    match: "refresh",
    runOnPage: function() {
        location.reload();
    },
    test: async function() {
        var initialPageLoadedTime = await this.driver.executeScript('return performance.timing.navigationStart');
        this.say()
        await this.driver.wait(async () => {
            return (await this.driver.executeScript('return performance.timing.navigationStart')) !== initialPageLoadedTime;
        }, 1000);
    }
}, {
    name: 'Scroll Bottom',
    match: ["bottom", "bottom of page", "bottom of the page", "scroll bottom", "scroll to bottom", "scroll to the bottom of page", "scroll to the bottom of the page"],
    runOnPage: function() {
        $('html, body').animate({
            scrollTop: document.body.scrollHeight
        });
    },
    test: async function() {
        await this.loadPage('http://motherfuckingwebsite.com/');
        this.assert(await this.driver.executeScript('return (window.innerHeight + window.scrollY) >= document.body.scrollHeight') === false);
        await this.say();
        await this.driver.wait(async () => {
            return await this.driver.executeScript('return (window.innerHeight + window.scrollY) >= document.body.scrollHeight');
        }, 1000);
    }
}, {
    name: 'Scroll Down a Little',
    match: ["little down", "little scroll down", "scroll little down", "down little"],
    runOnPage: function() {
        $('html, body').animate({
            scrollTop: window.scrollY + SCROLL_DISTANCE / 2
        });
    },
    test: async function() {
        // does not test specifically for "little" down -- just check if scrolled down
        // at all
        var oldYPos;
        await this.loadPage('http://motherfuckingwebsite.com/');
        oldYPos = await this.driver.executeScript('return window.pageYOffset');
        await this.say();
        await this.driver.wait(async () => {
            return (await this.driver.executeScript('return window.pageYOffset')) > oldYPos;
        }, 1000);
    }
}, {
    name: 'Scroll Down',
    match: ["down", "scroll down"],
    // We introduce a delay to distinguish between "down" "down a little" and "downvote"
    delay: [300, 0],
    runOnPage: function() {
        $('html, body').animate({
            scrollTop: window.scrollY + SCROLL_DISTANCE
        });
    },
    test: async function() {
        var oldYPos;
        await this.loadPage('http://motherfuckingwebsite.com/');
        oldYPos = await this.driver.executeScript('return window.pageYOffset');
        await this.say();
        await this.driver.wait(async () => {
            return (await this.driver.executeScript('return window.pageYOffset')) > oldYPos;
        }, 1000);
    }
}, {
    name: 'Scroll Top',
    match: ["top", "top of page", "top of the page", "scroll top", "scroll to top", "scroll to the top of page", "scroll to the top of the page"],
    runOnPage: function() {
        $('html, body').animate({
            scrollTop: 0
        });
    },
    test: async function() {
        await this.loadPage('http://motherfuckingwebsite.com/');
        await this.driver.executeScript('window.scrollTo(0,1000)');
        this.assert((await this.driver.executeScript('return window.pageYOffset !== 0')));
        await this.say();
        await this.driver.wait(async () => {
            return await this.driver.executeScript('return window.pageYOffset === 0');
        }, 1000);
    }
}, {
    name: 'Scroll Up a Little',
    match: ["little up", "little scroll up", "scroll little up", "up little"],
    runOnPage: function() {
        $('html, body').animate({
            scrollTop: window.scrollY - SCROLL_DISTANCE / 2
        });
    },
    test: async function() {
        // does not test specifically for "little" up -- just check if scrolled down
        // at all
        var oldYPos;
        await this.loadPage('http://motherfuckingwebsite.com/');
        await this.driver.executeScript('window.scrollTo(0,1000)')
        oldYPos = await this.driver.executeScript('return window.pageYOffset');
        await this.say();
        await this.timeout(1500);
        await this.driver.wait(async () => {
            return (await this.driver.executeScript('return window.pageYOffset')) < oldYPos;
        }, 1000);
    }
}, {
    name: 'Scroll Up',
    match: ["up", "scroll up"],
    delay: [300, 0],
    runOnPage: function() {
        $('html, body').animate({
            scrollTop: window.scrollY - SCROLL_DISTANCE
        });
    },
    test: async function() {
        var oldYPos;
        await this.loadPage('http://motherfuckingwebsite.com/');
        await this.driver.executeScript('window.scrollTo(0,1000)')
        oldYPos = await this.driver.executeScript('return window.pageYOffset');
        await this.say();
        await this.driver.wait(async () => {
            return (await this.driver.executeScript('return window.pageYOffset')) < oldYPos;
        }, 1000);
    }
}, {
    name: 'Stop',
    description: "Equivalent of hitting the \"stop\" button to stop page navigation.",
    match: "stop",
    runOnPage: function() {
        window.stop();
    },
    test: async function() {
        // Hard to test -- skip for now

        //var titleBefore = await this.driver.getTitle();
        //this.driver.get('http://youtube.com');
        //await this.timeout(100);
        //this.say()
        //await this.timeout(1000);
        //// make sure it's still on google
        //this.assert((await this.driver.getTitle()) === titleBefore);
    }
}, {
    name: 'Close Tab',
    match: "close tab",
    run: () => {
        // window.close cannot close windows that weren't opened via js
        Util.queryActiveTab(function(tab) {
            chrome.tabs.remove(tab.id);
        });
    },
    test: async function() {
        var beforeLen, anchors;
        await this.driver.get('http://motherfuckingwebsite.com');
        await this.driver.wait(async () => {
            anchors = await this.driver.findElements(this.By.tagName('a'));
            return (anchors && anchors.length > 0) ? true : false;
        }, 1000);
        anchors[0].sendKeys(this.Key.CONTROL + this.Key.RETURN);
        beforeLen = (await this.driver.getAllWindowHandles()).length;
        await this.say();
        // if the timeout is elapsed, then the tab wasn't closed
        await this.driver.wait(() => {
            return this.driver.getAllWindowHandles().then(function(handles) {
                return handles.length === beforeLen - 1;
            });
        }, 1000);
    }
}, {
    name: 'Next Tab',
    match: ["next tab"],
    run: () => {
        chrome.tabs.query({
            currentWindow: true
        }, function(tabs) {
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
                    chrome.tabs.update(tab.id, {
                        active: true
                    });
                    console.log(`found next index! ${tab.index}`);
                    break;
                }
            }
        });
    },
    test: async function() {
        // hard to test as there seems to be no way to check which tab is active with selenium?

        ////First open a new tab
        //var beforeLen, anchors;
        //await this.driver.get('http://motherfuckingwebsite.com');
        //await this.driver.wait(async () => {
            //anchors = await this.driver.findElements(this.By.tagName('a'));
            //return (anchors && anchors.length > 0) ? true : false;
        //}, 1000);
        //anchors[0].sendKeys(this.Key.CONTROL + this.Key.RETURN);
        //console.dir((await this.driver.getCurrentUrl()))
        //// next let's verify we're on the original tab
        //await this.say();
        //await this.timeout(2000);
        //console.log("b");
        //console.dir((await this.driver.getCurrentUrl()))
        //// now let's see if the original tab is selected
        //await this.driver.wait(() => {
            //return this.driver.getAllWindowHandles().then(function(handles) {
                //return handles.length === beforeLen - 1;
            //});
        //}, 1000);
    },
}, {
    name: 'New Tab',
    match: ["new tab", "open tab"],
    run: () => {
        // open in google because default start page does not allow CS
        chrome.tabs.create({
            active: true,
            url: 'https://www.google.com'
        });
    },
    test: async function() {
        var beforeLen = (await this.driver.getAllWindowHandles()).length;
        await this.say();
        var afterLen = (await this.driver.getAllWindowHandles()).length;
        await this.timeout(400);
        this.assert.equal(afterLen, beforeLen + 1);
    },
}, {
    name: 'Previous Tab',
    match: "previous tab",
    run: () => {
        chrome.tabs.query({
            currentWindow: true
        }, function(tabs) {
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
                    chrome.tabs.update(tab.id, {
                        active: true
                    });
                    console.log(`found prev index! ${tab.index}`);
                    break;
                }
            }
        });
    }
}, {
    name: 'Select Tab',
    description: "Select a tab by it's position.",
    match: ['tab #'],
    run: () => {
        chrome.tabs.query({
            index: i - 1,
            currentWindow: true
        }, function(tabs) {
            chrome.tabs.update(tabs[0].id, {
                active: true
            });
        });
    }
}, ];

module.exports = {
    name: 'Browser',
    description: 'Controls browser-level actions like creating new tabs, page navigation (back, forward, scroll down), showing help etc.',
    version: '1.0.0',
    match: /.*/,
    commands: commands,
    homophones: homophones,
};
