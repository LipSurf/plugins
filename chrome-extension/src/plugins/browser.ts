/*
 * primary LipSurf plugin for browser functionality
 */
/// <reference path="../@types/plugin-interface.d.ts"/>
/// <reference path="../@types/store.d.ts"/>
// TODO: would be better without the store.d.ts reference?

type HelpPerPlugin = { name: string, commands: {global?: boolean, name: string, match: string[], description: string }[]};

export class BrowserPlugin extends PluginBase {
    static friendlyName = 'Browser';
    static description = 'Controls browser-level actions like creating new tabs, page navigation (back, forward, scroll down), showing help etc.';
    static version = '1.0.0';
    static apiVersion = '1';
    static match = /.*/;
    static homophones = {
        'closeout': 'close help',
        'close up': 'close help',
        'close tap': 'close tab',
        'app': 'up',
        'downwards': 'down',
        'town': 'down',
        'downward': 'down',
        'full-screen': 'fullscreen',
        'full screen': 'fullscreen',
        'on fullscreen': 'un-fullscreen',
        'on full screen': 'un-fullscreen',
        'unfor screen': 'un-fullscreen',
        'unfold screen': 'un-fullscreen',
        'unfull screen': 'un-fullscreen',
        'unfullscreen': 'un-fullscreen',
        'un fullscreen': 'un-fullscreen',
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
        'you': 'u',
        'newtown': 'new tab',
        'utah': 'new tab',
        'school': 'scroll',
        'screw': 'scroll',
        'small': 'little',
        'time': 'next',
        'clothes': 'close',
        'scrolltop': 'scroll top',
        'talk': 'top',
        'paws': 'pause',
    };

    static visibleOnPage = (docViewTop:number, docViewBottom:number, $ele) => {
        let eleTop = $ele.offset().top;
        let eleBottom = eleTop + $ele.height();

        return ((eleBottom <= docViewBottom) && (eleTop >= docViewTop));
    }

    // Annotations
    static LETTERS = 'ACFGHIJKLOQRSTVXYZ'.split('');
    static NUMBERS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 20, 30, 40, 50, 60, 70, 80, 90];
    static popName = () => {
        let name;
        for (let key of BrowserPlugin.availAnnotations) {
            if (BrowserPlugin.availAnnotations.has(key)) {
                name = key;
                break;
            }
        }
        // more performant than delete?
        BrowserPlugin.availAnnotations.delete(name);
        BrowserPlugin.annotated.add(name);
        return name;
    };

    static annotated = new Set();

    static availAnnotations = (function() {
        let ret = new Set();
        for (let i = 0; i < BrowserPlugin.LETTERS.length * BrowserPlugin.NUMBERS.length; i++) {
            ret.add(BrowserPlugin.LETTERS[Math.floor(i/BrowserPlugin.NUMBERS.length)] + BrowserPlugin.NUMBERS[i % BrowserPlugin.NUMBERS.length]);
        }
        return ret;
    })();

    static annotationsTimer = null;
    // End annotations

    static templateCache = {};
    static parseTemplate:(string, object) => string = function(str, data) {
        // Inspired by:
        // Simple JavaScript Templating
        // John Resig - http://ejohn.org/ - MIT Licensed

        // Figure out if we're getting a template, or if we need to
        // load the template - and be sure to cache the result.
        let func = BrowserPlugin.templateCache[str];
        if (!func) {
            // Generate a reusable function that will serve as a template
            // generator (and which will be cached).
          let strFunc = "var p=[],print=function(){p.push.apply(p,arguments);};" +
            "with(obj){p.push('" +
            str.replace(/[\r\t\n]/g, " ")
               .replace(/'(?=[^%]*%>)/g, "\t")
               .split("'").join("\\'")
               .split("\t").join("'")
               .replace(/<%=(.+?)%>/g, "',$1,'")
               .split("<%").join("');")
               .split("%>").join("p.push('")
               + "');}return p.join('');";

            func = new Function("obj", strFunc);
            BrowserPlugin.templateCache[str] = func;
        }
        return func(data);
    };

    // local('Barlow Regular'), local('Barlow-Regular'),
    // Help box
    static helpBoxTmpl = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <style>
            /* latin-ext */
            @font-face {
              font-family: 'Barlow';
              font-style: normal;
              font-weight: 400;
              src: url(chrome-extension://mgdafgphegpnakgebnmgfdfnfnnigjoc/assets/barlow-latin-ex.woff2) format('woff2');
              unicode-range: U+0100-024F, U+0259, U+1E00-1EFF, U+2020, U+20A0-20AB, U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF;
            }
            /* latin */
            @font-face {
              font-family: 'Barlow';
              font-style: normal;
              font-weight: 400;
              src: url(chrome-extension://mgdafgphegpnakgebnmgfdfnfnnigjoc/assets/barlow-latin.woff2) format('woff2');
              unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
            }

                body {
                    font-family: "Barlow";
                    background-color: rgba(30, 30, 30, 0.8);
                    color: white;
                    padding: 10px;
                    column-count: 3;
                }

                section {
                }

                section h4 {
                    padding: 5px 0;
                    margin: 0;
                    border-bottom: 1px #aaa solid;
                    color: orange;
                }

                .cmd-line {
                    margin: 5px;
                    display: flex;
                    justify-content: space-between;
                    white-space: nowrap;
                }

                .cmd-name {

                }

                .cmd-matches {
                    white-space: nowrap;
                    text-overflow: ellipsis;
                    overflow: hidden;
                    margin: 0 0 0 1.6rem;
                    display: inline;
                    list-style: none;
                    padding: 0px;
                }

                .cmd-matches li {
                    display: inline;
                }

                .cmd-matches li::after {
                    content: "| ";
                }

                .cmd-matches li:last-child::after {
                    content: "";
                }

                .light {
                    text-decoration: none;
                    color: #ccc;
                }

                .match-link {
                    text-decoration: underline;
                    color: #927164;
                }

                .cmd-match {
                    color: #ccc;
                    background-color: #555;
                }

                .tag {
                    background-color: #777;
                    border-radius: 3px;
                    display: inline-block;
                    margin: 0 8px;
                    padding: 2px 5px;
                    color: #cccccc;
                }

                .top-bar {
                    text-align: right;
                }

                .close-btn {
                    font-size: 2em;
                    cursor: pointer;
                }
            </style>
            <script>
                // TODO: Close button
        //        parent.closeIFrame();
            </script>
        </head>
        <body>
            <!--<div class="top-bar">-->
                <!--<span class="close-btn">×</span>-->
            <!--</div>-->
            <% for (let plugin of plugins) { %>
            <section>
                <h4><%= plugin.name %></h4>
                <% for (let cmd of plugin.commands) { %>
                <div class="cmd-line"><span><span class="cmd-name"><%= cmd.name %></span>
                    <% if (cmd.global) { %>
                    <span class="tag">global</span>
                    <% } %>
                    </span>
                    <ul class="cmd-matches" title="<%= cmd.match.join(',') %>">
                    <% for (let match of cmd.match) { %>
                <li class="cmd-match"><a class="match-link"><span class="light"><%= match %></span></a></span>
                    <% } %>
                    </div>
                </div>
                <% } %>
            </section>
            <% } %>
        </div>
        </body>
        </html>
    `;

    static init() {
        // inject the CSS
        let STYLE = `
            .${PluginBase.util.getNoCollisionUniqueAttr()}-anno {
                border: 1px solid red;
                display: inline-block;
                background-color: yellow;
                font-weight: normal;
                color: #222;
                border-style: dotted;
                opacity: 0.7;
                padding: 2px;
                font-size: 0.9rem;
                margin: 0px 0px 0 5px;
                box-shadow: #000000a1 2px 2px 1px;
            }
        `;
        $(`<style type='text/css'>${STYLE}</style>`).appendTo("head");
    }

    static commands = [{
        name: 'Annotate',
        description: 'Give elements on the page a special annotation so they can be easily referred to and "clicked" on with voice controls.',
        match: ['annotate', 'annotations on', 'turn on annotations'],
        runOnPage: function() {
            let prevCount = null;
            let noCollisionAttr = PluginBase.util.getNoCollisionUniqueAttr();

            BrowserPlugin.annotationsTimer = setInterval(() => {
                let windowTop = $(window).scrollTop();
                let windowBottom = $(window).height() + windowTop;
                let count = 0;
                let removedCount = 0;
                // remove invisible annotations and mark their names as available again
                $(`div[${noCollisionAttr}-anno]`).each((i, ele) => {
                    let $ele = $(ele);
                    let name = ele.getAttribute(`${noCollisionAttr}-anno`);
                    if (!BrowserPlugin.visibleOnPage(windowTop, windowBottom, $ele)) {
                        removedCount += 1;
                        // make the annotation name avail again
                        BrowserPlugin.availAnnotations.add(name);
                        BrowserPlugin.annotated.delete(name);
                        $ele.remove();
                    }
                });
                // .filter has better perf.
                $('a')
                    .filter(':visible')
                    .filter(`:not(:has(div[${noCollisionAttr}-anno]))`)
                    .each((i, ele) => {
                        let $ele = $(ele);
                        if (BrowserPlugin.visibleOnPage(windowTop, windowBottom, $ele)) {
                            count += 1;
                            let label = document.createElement("div");
                            let name = BrowserPlugin.popName();
                            if (name) {
                                label.className = `${noCollisionAttr}-anno`;
                                label.setAttribute(`${noCollisionAttr}-anno`, name);
                                let labelContent = document.createTextNode(name);
                                label.appendChild(labelContent);
                                ele.appendChild(label);
                            }
                        }
                    }
                )
                if (prevCount != count) {
                    prevCount = count;
                    console.log(`Removed ${removedCount}, annotated ${count} elements`);
                }
            }, 800);
        }
    },
    {
        name: 'Unannotate',
        description: 'Hide the annotations',
        match: ['unannotate', 'close annotations', 'hide annotations', 'annotations off', 'turn off annotations', 'annotate off'],
        runOnPage: function() {
            clearInterval(BrowserPlugin.annotationsTimer);
            $(`div[${PluginBase.util.getNoCollisionUniqueAttr()}-anno]`).remove();
        }
    },
    {
        name: 'Click',
        description: 'Click an annotated element',
        match: {
            fn: (input) => {
                let noSpaces = input.replace(/\s*/, '').toUpperCase();
                if (BrowserPlugin.annotated.has(noSpaces))
                    return [noSpaces];
            },
            description: 'Say what\'s annotated',
        },
        runOnPage: (annotationName:string) => {
            // do we need to query parent? Because we're placing this inside the anchor
            $(`div[${PluginBase.util.getNoCollisionUniqueAttr()}-anno=${annotationName.toUpperCase()}]`).click();
        }
    },
    {
        name: 'Close Help',
        description: "Close the help box.",
        match: ["close help", "hide help", "help off"],
        runOnPage: function () {
            let id = `${PluginBase.util.getNoCollisionUniqueAttr()}-browser-helpbox`;
            let $ele = $(`#${id}`);

            if ($ele) {
                $ele.css('opacity', 0);
                setTimeout(() => $ele.remove(), 600);
            }
        }
    }, {
        name: 'Open Help',
        description: "Open the help box.",
        match: ["help", "open help", "help open", "commands", "help on", "i am confused"],
        runOnPage: async function () {
            let id = `${PluginBase.util.getNoCollisionUniqueAttr()}-browser-helpbox`;
            if ($(`#${id}`).length === 0) {
                let options = await PluginBase.util.getOptions();
                let enabledPlugins = options.plugins.filter(plugin => plugin.enabled);
                let url = window.location.href;
                let score = {
                    Reddit: 0,
                    Google: 1,
                    Browser: 2
                };
                let helpPerPlugin:any = enabledPlugins
                    .map(plugin => ({
                        name: plugin.friendlyName,
                        commands: plugin.commands
                            .filter(cmd => cmd.enabled && (cmd.global || plugin.match.reduce((acc, matchPattern) => acc || matchPattern.test(url), false)))
                            .map(cmd => ({...cmd, match: typeof cmd.match === 'object' && 'description' in cmd.match ? [cmd.match.description] : cmd.match}))
                            .map(cmd => PluginBase.util.pick(cmd, 'name', 'global', 'description', 'match'))
                        }
                    ))
                // hard-coded sorting for now
                // TODO: sort by relevance to the current url
                    .sort((a, b) => score[a.name] - score[b.name]);
                console.log(`help per plugin ${JSON.stringify(helpPerPlugin)}`);
                let renderedHelp:string = BrowserPlugin.parseTemplate(BrowserPlugin.helpBoxTmpl, {plugins: helpPerPlugin});
                let overlay = PluginBase.util.addOverlay(renderedHelp, {
                    top: '10%',
                    left: '10%',
                    right: '10%',
                    bottom: '10%',
                    width: '80%',
                    height: '430px',
                    opacity: '0',
                    transition: 'opacity 0.3s ease-in',
                }, id);
                setTimeout(() => $(overlay).css('opacity', '1'), 0);
            }
        }
    }, {
        name: 'Fullscreen Video',
        match: "fullscreen",
        runOnPage: function () {
            PluginBase.util.queryAllFrames('video', ['src', 'style.width', 'style.height', 'duration'])
                .then((res) => {
                    // filter out undefined, null
                    let filtered = res.filter((x) => x && x.length > 0);
                    filtered.sort((e) => {
                        return e[0];
                    });

                    PluginBase.util.postToAllFrames(filtered[0][0], ['webkitRequestFullscreen']);
                });
        },
    }, {
        name: 'Unfullscreen Video',
        match: ["un-fullscreen", "no full screen"],
        runOnPage: function () {
            document.webkitExitFullscreen();
        },
    }, {

        name: 'Go Back',
        description: "Equivalent of hitting the back button.",
        match: ["back", "go back"],
        runOnPage: function () {
            window.history.back();
        },
        test: async function () {
            var secondPageUrl;
            var initialPageUrl = await this.driver.getCurrentUrl();
            await this.loadPage('https://www.duckduckgo.com');
            secondPageUrl = await this.driver.getCurrentUrl();
            this.assert.notEqual(secondPageUrl, initialPageUrl);
            await this.say();
            await this.driver.wait(async () => {
                return (await this.driver.getCurrentUrl()) === initialPageUrl;
            }, 2000);
        }
    }, {
        name: 'Go Forward',
        description: "Equivalent of hitting the forward button.",
        match: ["forward", "go forward"],
        runOnPage: function () {
            window.history.forward();
        },
        test: async function () {
            var secondPageUrl;
            var initialPageUrl = await this.driver.getCurrentUrl();
            await this.loadPage('https://www.duckduckgo.com');
            secondPageUrl = await this.driver.getCurrentUrl();
            this.assert.notEqual(secondPageUrl, initialPageUrl);
            await this.driver.navigate().back();
            await this.say();
            await this.driver.wait(async () => {
                return (await this.driver.getCurrentUrl()) === secondPageUrl;
            }, 1000);
        }
    }, {
        name: 'Play Video',
        match: ['play #', 'play'],
        runOnPage: function (i) {
            // tested for youtube, twitch, streamable
            // vimeo -- needs a click to work -- because autoplay is off?

            // query all videos that are visible and in frame
            // ask all iframes for their videos
            PluginBase.util.queryAllFrames('video', ['paused', 'src', 'offset().top', 'offset().left', 'style.width', 'style.height', 'duration'])
                .then((res) => {
                    // filter out undefined and null
                    let filtered = res.filter((x) => x && x.length > 0);

                    // rank by the most reasonable choice to play
                    // criteria: paused
                    // in the future let user disambiguate
                    filtered.sort((e) => {
                        return e[0];
                    });

                    PluginBase.util.postToAllFrames(filtered[0][0], ['click']);

                    //if it's still not playing after a click
                    setTimeout(function () {
                        PluginBase.util.postToAllFrames(filtered[0][0], ['play']);
                    }, 3000);
                });


            // TODO: make this a setting
            //scrollTo($ele);
        },
        test: async function () {
            let frame;
            await this.loadPage('https://www.reddit.com/r/videos/comments/7iv0n6/mike_tyson_hitting_a_heavy_bag_is_terrifying/');
            await this.say();
            await this.driver.wait(async () => {
                frame = await this.driver.findElement(this.By.xpath('//iframe[@class="media-embed"]'));
                return frame;
            }, 3000);
            console.log(`frame 1 ${await frame.getAttribute('src')}`);
            await this.driver.switchTo().frame(frame);
            await this.driver.wait(async () => {
                frame = await this.driver.findElement(this.By.xpath('//iframe[@class="embedly-embed"]'));
                return frame;
            }, 1000);
            console.log(`frame 2 ${await frame.getAttribute('src')}`);
            await this.driver.switchTo().frame(frame);
            await this.driver.wait(async () => {
                frame = await this.driver.findElement(this.By.xpath('//iframe[contains(@src, "youtube")]'));
                return frame;
            }, 1000);
            console.log(`frame 3 ${await frame.getAttribute('src')}`);
            await this.driver.switchTo().frame(frame);
            await this.driver.wait(async () => {
                return (await this.driver.executeScript("try { return document.querySelector('video').currentTime } catch (e) {}")) > 0;
            }, 10000);
        }
    },
    {
        name: 'Pause Video',
        match: ["pause", "pause video"],
        runOnPage: function () {
            PluginBase.util.queryAllFrames('video', ['paused', 'src', 'style.width', 'style.height', 'duration'])
                .then((res) => {
                    // filter out undefined, null and already paused videos
                    let filtered = res.filter((x) => x && x.length > 0 && !x[1]);
                    filtered.sort((e) => {
                        return e[0];
                    });

                    PluginBase.util.postToAllFrames(filtered[0][0], ['pause']);
                });
        },
    }, {
        name: 'Resume Video',
        description: "Continue playing a video that has already started.",
        // Works with any video that may have started, even with the mouse
        match: "resume",
        runOnPage: function (i) {
            PluginBase.util.queryAllFrames('video', ['paused', 'currentTime', 'duration'])
                .then((res) => {
                    // filter out undefined, null, and not paused
                    let filtered = res.filter((x) => x && x.length > 0 && x[1]);
                    filtered.sort((e) => {
                        return e[0];
                    });

                    PluginBase.util.postToAllFrames(filtered[0][0], ['click']);

                    //if it's still not playing after a click
                    setTimeout(function () {
                        PluginBase.util.postToAllFrames(filtered[0][0], ['play']);
                    }, 3000);
                });
        },
    },
    {
        name: 'Refresh',
        description: "Refresh the page.",
        match: "refresh",
        runOnPage: function () {
            location.reload();
        },
        test: async function () {
            var initialPageLoadedTime = await this.driver.executeScript('return performance.timing.navigationStart');
            this.say()
            await this.driver.wait(async () => {
                return (await this.driver.executeScript('return performance.timing.navigationStart')) !== initialPageLoadedTime;
            }, 1000);
        }
    }, {
        name: 'Scroll Bottom',
        match: ["bottom", "bottom of page", "bottom of the page", "scroll bottom", "scroll to bottom", "scroll to the bottom of page", "scroll to the bottom of the page"],
        runOnPage: function () {
            $('html, body').animate({
                scrollTop: document.body.scrollHeight
            });
        },
        test: async function () {
            await this.loadPage('http://motherfuckingwebsite.com/');
            this.assert.true(await this.driver.executeScript('return (window.innerHeight + window.scrollY) >= document.body.scrollHeight') === false);
            await this.say();
            await this.driver.wait(async () => {
                return await this.driver.executeScript('return (window.innerHeight + window.scrollY) >= document.body.scrollHeight');
            }, 1000);
        }
    }, {
        name: 'Scroll Down a Little',
        match: ["little down", "little scroll down", "scroll little down", "down little"],
        runOnPage: function () {
            $('html, body').animate({
                scrollTop: window.scrollY + PluginBase.util.getScrollDistance() / 2
            });
        },
        test: async function () {
            // does not test specifically for "little" down -- just check if scrolled down
            // at all
            var oldYPos;
            await this.loadPage('http://motherfuckingwebsite.com/');
            oldYPos = await this.driver.executeScript('return window.pageYOffset');
            await this.say();
            await this.driver.wait(async () => {
                return (await this.driver.executeScript('return window.pageYOffset')) > oldYPos;
            }, 3000);
        }
    }, {
        name: 'Scroll Down',
        match: ["down", "scroll down", "d"],
        // A delay would be alleviate mismatches between "little down" but isn't worth the slowdown
        // delay: [300, 0],
        runOnPage: function () {
            $('html, body').animate({
                scrollTop: window.scrollY + PluginBase.util.getScrollDistance()
            });
        },
        test: async function () {
            var oldYPos;
            await this.loadPage('http://motherfuckingwebsite.com/');
            oldYPos = await this.driver.executeScript('return window.pageYOffset');
            await this.say();
            await this.driver.wait(async () => {
                return (await this.driver.executeScript('return window.pageYOffset')) > oldYPos;
            }, 3000);
        }
    }, {
        name: 'Scroll Top',
        match: ["top", "top of page", "top of the page", "scroll top", "scroll to top", "scroll to the top of page", "scroll to the top of the page"],
        runOnPage: function () {
            $('html, body').animate({
                scrollTop: 0
            });
        },
        test: async function () {
            await this.loadPage('http://motherfuckingwebsite.com/');
            await this.driver.executeScript('window.scrollTo(0,1000)');
            this.assert.true((await this.driver.executeScript('return window.pageYOffset !== 0')));
            await this.say();
            await this.driver.wait(async () => {
                return await this.driver.executeScript('return window.pageYOffset === 0');
            }, 2000);
        }
    }, {
        name: 'Scroll Up a Little',
        match: ["little up", "little scroll up", "scroll little up", "up little"],
        runOnPage: function () {
            $('html, body').animate({
                scrollTop: window.scrollY - PluginBase.util.getScrollDistance() / 2
            });
        },
        test: async function () {
            // does not test specifically for "little" up -- just check if scrolled down
            // at all
            var oldYPos;
            await this.loadPage('http://motherfuckingwebsite.com/');
            await this.driver.executeScript('window.scrollTo(0,1000)')
            oldYPos = await this.driver.executeScript('return window.pageYOffset');
            await this.say();
            await this.driver.wait(async () => {
                return (await this.driver.executeScript('return window.pageYOffset')) < oldYPos;
            }, 3000);
        }
    }, {
        name: 'Scroll Up',
        match: ["up", "scroll up", "u"],
        delay: [300, 0],
        runOnPage: function () {
            $('html, body').animate({
                scrollTop: window.scrollY - PluginBase.util.getScrollDistance()
            });
        },
        test: async function () {
            var oldYPos;
            await this.loadPage('http://motherfuckingwebsite.com/');
            await this.driver.executeScript('window.scrollTo(0,1000)')
            oldYPos = await this.driver.executeScript('return window.pageYOffset');
            await this.say();
            await this.driver.wait(async () => {
                return (await this.driver.executeScript('return window.pageYOffset')) < oldYPos;
            }, 3000);
        }
    }, {
        name: 'Stop',
        description: "Equivalent of hitting the \"stop\" button to stop page navigation.",
        match: "stop",
        runOnPage: function () {
            window.stop();
        },
        test: async function () {
            // Hard to test -- skip for now

            //var titleBefore = await this.driver.getTitle();
            //this.driver.get('http://youtube.com');
            //await this.timeout(100);
            //this.say()
            //await this.timeout(1000);
            //// make sure it's still on google
            //this.assert.equal((await this.driver.getTitle()), titleBefore);
        }
    }, {
        name: 'Close Tab',
        match: "close tab",
        run: async function() {
            // window.close cannot close windows that weren't opened via js
            let tab = await ExtensionUtil.queryActiveTab();
            chrome.tabs.remove(tab.id);
        },
        test: async function () {
            var beforeLen, anchors;
            await this.driver.get('http://motherfuckingwebsite.com');
            await this.driver.wait(async () => {
                anchors = await this.driver.findElements(this.By.tagName('a'));
                return (anchors && anchors.length > 0) ? true : false;
            }, 2000);
            anchors[0].sendKeys(this.Key.CONTROL + this.Key.RETURN);
            beforeLen = (await this.driver.getAllWindowHandles()).length;
            await this.say();
            // if the timeout is elapsed, then the tab wasn't closed
            await this.driver.wait(() => {
                return this.driver.getAllWindowHandles().then(function (handles) {
                    return handles.length === beforeLen - 1;
                });
            }, 3000);
        }
    }, {
        name: 'Next Tab',
        match: ["next tab"],
        run: () => {
            chrome.tabs.query({
                currentWindow: true
            }, function (tabs) {
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
        test: async function () {
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
        test: async function () {
            let beforeLen: number = (await this.driver.getAllWindowHandles()).length;
            await this.say();
            let afterLen: number;
            await this.driver.wait(async () => {
                afterLen = (await this.driver.getAllWindowHandles()).length;
                return afterLen !== beforeLen;
            }, 3000);
        },
    }, {
        name: 'Previous Tab',
        match: "previous tab",
        run: () => {
            chrome.tabs.query({
                currentWindow: true
            }, function (tabs) {
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
        run: (tabIndex) => {
            chrome.tabs.query({
                index: tabIndex - 1,
                currentWindow: true
            }, function (tabs) {
                chrome.tabs.update(tabs[0].id, {
                    active: true
                });
            });
        }
    }, {
        name: 'Mute',
        description: 'Mute volume on current tab',
        match: 'mute',
        run: async (tabIndex) => {
            let tab = await ExtensionUtil.queryActiveTab();
            chrome.tabs.update(tab.id, {muted: true});
        }
    }, {
        name: 'Mute all',
        description: 'Mute volume on all tabs',
        match: 'mute all',
        run: async (tabIndex) => {
            chrome.tabs.query({
                muted: false
            }, function(tabs) {
                for (let tab of tabs) {
                    chrome.tabs.update(tab.id, {muted: true});
                }
            });
        }
    }, {
        name: 'Unmute',
        description: 'Unmute volume on current tab',
        match: 'unmute',
        run: async (tabIndex) => {
            let tab = await ExtensionUtil.queryActiveTab();
            chrome.tabs.update(tab.id, {muted: false});
        }
    }, {
        name: 'Unmute all',
        description: 'Unmute volume on all tabs',
        match: 'unmute all',
        run: async (tabIndex) => {
            chrome.tabs.query({
                muted: true
            }, function(tabs) {
                for (let tab of tabs) {
                    chrome.tabs.update(tab.id, {muted: false});
                }
            });
        }
    }, {
        name: 'Settings',
        description: "Open the settings page for LipSurf",
        match: ['settings', 'options'],
        run: () => {
            chrome.runtime.openOptionsPage();
        }
    }
    ];
}
