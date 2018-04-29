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
        'auntie': 'annotate',
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
        'on annotate': 'unannotate',
        'middletown': 'little down',
        'little rock': 'little up',
        'school little rock': 'scroll little up',
        'time of the page': 'top of the page',
        'backwards': 'back',
        'backward': 'back',
        'nextpage': 'next page',
        'next pay': 'next page',
        'next app': 'next tab',
        'next time': 'next tab',
        'previous app': 'previous tab',
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
        'clothes': 'close',
        'scrolltop': 'scroll top',
        'talk': 'top',
        'chop': 'top',
        'paws': 'pause',
    };

    static visibleOnPage = (docViewTop:number, docViewBottom:number,
            docViewLeft:number, docViewRight:number, $ele) => {
        let offset = $ele.offset();
        let eleTop = Math.floor(offset.top);
        let eleLeft = Math.floor(offset.left);
        let eleBottom = Math.floor(eleTop + $ele.height());

        // pay close attention, this isn't a typical symettric check (we check left bounds twice)
        return (eleTop + 5 <= docViewBottom && eleTop >= docViewTop && eleLeft >= docViewLeft && eleLeft - 5 < docViewRight);
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

    static annotate = false;
    static annotationsMap: { [name: string]: HTMLElement } = {};
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
                    column-gap: 1.5rem;
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

    static getAnnoCont = () => {
        let ua = PluginBase.util.getNoCollisionUniqueAttr();
        let id = `${ua}-anno-cont`;
        let cont = document.getElementById(id);
        if (!cont) {
            cont = document.createElement('div');
            cont.setAttribute(ua, '');
            cont.id = id;
            document.body.appendChild(cont);
        }
        return cont;
    }

    static SCROLL_DURATION = 400;

    static init() {
        // inject the CSS
        // WARNING: opacity changes stacking context!
        let STYLE = `
            .${PluginBase.util.getNoCollisionUniqueAttr()}-anno {
                border: 1px solid red;
                display: inline-block;
                background-color: yellow;
                font-weight: normal;
                color: #111;
                border-style: dotted;
                padding: 2px;
                border-radius: 6px;
                font-size: 0.7rem;
                font-weight: bold;
                position: absolute;
                box-shadow: #00000081 2px 2px 1px;
            }

            #${PluginBase.util.getNoCollisionUniqueAttr()}-anno-cont {
                pointer-events: none;
            }
        `;

        // async doesn't work here for some reason
        $(document).ready(() => {
            $(`<style type='text/css'>${STYLE}</style>`).appendTo("head");
            BrowserPlugin.getAnnoCont();

            BrowserPlugin.getOption('annotate').then(annotate => {
                if (annotate) {
                    BrowserPlugin.commands['Annotate'].runOnPage();
                }
            });
        });

        console.log('initialized browser');
    }

    static destroy() {
        BrowserPlugin.annotate = false;
        BrowserPlugin.setOption('annotate', false);
    }

    static commands = [{
        name: 'Annotate',
        description: 'Give elements on the page a special annotation so they can be easily referred to and "clicked" on with voice controls.',
        match: ['annotate', 'annotations on', 'turn on annotations'],
        runOnPage: async function() {
            // PERF:
            //   put coords of each annotated element in db -- that way we can quickly check if it's already been annotated (ordered set)
            // TODO:
            //  currently there's a selector that looks for classes with "button" -- mainly for reddit expando-button.
            //  but this causes a lot of overlapping. Perhaps we can look at the parents and see if they're clickable.
            let prevCount = null;
            let ua = PluginBase.util.getNoCollisionUniqueAttr();
            BrowserPlugin.setOption('annotate', true);
            BrowserPlugin.annotationsMap = {};
            BrowserPlugin.annotate = true;

            let annotationsTimer = () => {
                let startTime = performance.now();
                let $window = $(window);
                let windowTop = $window.scrollTop();
                let windowBottom = $window.height() + windowTop;
                let windowLeft = $window.scrollLeft();
                let windowRight = $window.width() + windowLeft;
                let count = 0;
                let removedCount = 0;
                let annoMapKeys = Object.keys(BrowserPlugin.annotationsMap);
                // remove invisible annotations and mark their names as available again
                annoMapKeys.forEach((anno) => {
                    let $ele = $(BrowserPlugin.annotationsMap[anno]);
                    if (!BrowserPlugin.visibleOnPage(windowTop, windowBottom, windowLeft, windowRight, $ele)
                            || $ele.css('visibility') === 'hidden') {
                        removedCount += 1;
                        // make the annotation name avail again
                        BrowserPlugin.availAnnotations.add(anno);
                        BrowserPlugin.annotated.delete(anno);
                        // remove the annotation
                        // don't use text/contains because that will capture partial matches eg: H3 -> H30
                        $(`#${ua}-anno-cont > div[anno="${anno}"]`).remove();
                        try {
                            delete BrowserPlugin.annotationsMap[anno];
                        } catch(e) {}
                    } 
                });

                // update positioning, in case element "moved" (like with youtube fixed sidebar)
                $(`#${ua}-anno-cont > div[anno]`).css({
                    left: function() {
                        let srcEle = BrowserPlugin.annotationsMap[this.getAttribute('anno')];
                        if (srcEle) {
                            let offset = $(srcEle).offset();
                            return `${Math.max(0, offset.left - 5)}px`;
                        }
                    },
                    top: function() {
                        let srcEle = BrowserPlugin.annotationsMap[this.getAttribute('anno')];
                        if (srcEle) {
                            let offset = $(srcEle).offset();
                            return `${Math.max(0, offset.top - 5)}px`;
                        }
                    },
                });

                let cont = BrowserPlugin.getAnnoCont();
                // create the master copy
                let masterAnno = document.createElement("div");
                masterAnno.className = `${ua}-anno`;

                let allAnnotated = Object.values(BrowserPlugin.annotationsMap);

                // .filter has better perf.
                $(`a,[role="button"],[role="option"],[role="combobox"],[role="option"]
                    ,[role="checkbox"],[role="link"],[role="menuitem"],[role="menuteitemcheckbox"]
                    ,[role="menuitemradio"],[role="radio"],[role="spinbutton"],[role="textbox"]
                    ,[role="switch"],button,input,*[class*=button]
                    `)
                    // this just means it takes up space in the dom
                    .filter(':visible')
                    .not('[aria-hidden="true"]')
                    .not('[aria-disabled="true"]')
                    .filter(function() {
                        let com = window.getComputedStyle(this);
                        // specifically for filtering out stuff from *[class*=button], make sure it's clickable
                        let nodeName = this.nodeName.toLowerCase();
                        if (com.visibility === 'hidden')
                            return false;
                        if (['button', 'input', 'a'].indexOf(nodeName) === -1)
                            return (com.cursor === 'pointer' || com.cursor === 'text');
                        return true;
                    })
                    .each((i, ele) => {
                        let $ele = $(ele);
                        if (BrowserPlugin.visibleOnPage(windowTop, windowBottom, windowLeft, windowRight, $ele)
                                && allAnnotated.indexOf(ele) === -1) {
                            count += 1;
                            let name = BrowserPlugin.popName();
                            let clone = <HTMLDivElement>masterAnno.cloneNode();
                            if (name) {
                                let offset = $ele.offset();
                                clone.textContent = name;
                                clone.style.top = `${Math.max(0, offset.top - 5)}px`;
                                clone.style.left = `${Math.max(0, offset.left - 5)}px`;
                                // clone.style.zIndex = `${2000000000 + i}`;
                                // get max z-index
                                let maxZIndex = 0;
                                $ele.parents().each((i, ele) => {
                                    let zIndex = parseInt($(ele).css('z-index'))
                                    if (!isNaN(zIndex))
                                        maxZIndex = Math.max(maxZIndex, zIndex);
                                });
                                clone.style.zIndex = maxZIndex === 0 ? 'auto' : `${maxZIndex}`;
                                clone.setAttribute('anno', name);
                                BrowserPlugin.annotationsMap[name] = ele;
                                cont.appendChild(clone);
                            }
                        }
                    }
                )
                if (prevCount != count) {
                    prevCount = count;
                    console.log(`Elapsed: ${performance.now() - startTime}. Removed ${removedCount}, annotated ${count} elements`);
                }
                if (BrowserPlugin.annotate) {
                    setTimeout(annotationsTimer, 100);
                } else {
                    // clear what we just made in case this came at a delay (race condition)
                    $(`div[id=${ua}-anno-cont`).empty();
                }
            };

            annotationsTimer();
        }
    },
    {
        name: 'Unannotate',
        description: 'Hide the annotations',
        match: ['unannotate', 'close annotations', 'hide annotations', 'annotations off', 'turn off annotations', 'annotate off', 'no annotations'],
        runOnPage: async function() {
            BrowserPlugin.annotate = false;
            $(`div[id=${PluginBase.util.getNoCollisionUniqueAttr()}-anno-cont`).empty();
            BrowserPlugin.setOption('annotate', false);
        }
    },
    {
        name: 'Click',
        description: 'Click an annotated element',
        match: {
            fn: (input) => {
                let noSpaces = input.replace(/\s*/g, '').toUpperCase();
                if (BrowserPlugin.annotated.has(noSpaces))
                    return [noSpaces];
            },
            description: 'Say what\'s annotated',
        },
        runOnPage: async (annotationName:string) => {
            // do we need to query parent? Because we're placing this inside the anchor
            let ele = BrowserPlugin.annotationsMap[annotationName]
            let clickTypes = ["button", "submit", "reset", "checkbox", "color", "file", "hidden", "image", "radio"];
            if ((ele.nodeName.toLowerCase() === "input" && clickTypes.indexOf((<HTMLInputElement>ele).type) === -1)
                || ele.nodeName.toLowerCase() === "textarea" || ele.isContentEditable) {
                // settimeout is a workaround for chrome
                setTimeout(() => {
                    window.focus();
                    ele.focus();
                }, 0);
            } else {
                // jquery $().click() does not work for some reason
                ele.click();
            }
        }
    },
    {
        name: 'Close Help',
        description: "Close the help box.",
        match: ["close help", "hide help", "help off"],
        runOnPage: async function () {
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
        runOnPage: async function () {
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
        runOnPage: async function () {
            document.webkitExitFullscreen();
        },
    }, {

        name: 'Go Back',
        description: "Equivalent of hitting the back button.",
        match: ["back", "go back"],
        runOnPage: async function () {
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
        runOnPage: async function () {
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
        runOnPage: async function (i) {
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
        runOnPage: async function () {
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
        runOnPage: async function (i) {
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
        runOnPage: async function () {
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
        runOnPage: async function () {
            $('html, body').animate({
                scrollTop: document.body.scrollHeight
            });
            return await PluginBase.util.sleep(BrowserPlugin.SCROLL_DURATION);
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
        match: ["little down", "little scroll down", "scroll little down"],
        runOnPage: async function () {
            $('html, body').animate({
                scrollTop: window.scrollY + PluginBase.util.getScrollDistance() / 2
            });
            return await PluginBase.util.sleep(BrowserPlugin.SCROLL_DURATION);
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
        runOnPage: async function () {
            $('html, body').animate({
                duration: BrowserPlugin.SCROLL_DURATION,
                scrollTop: window.scrollY + PluginBase.util.getScrollDistance()
            });
            return await PluginBase.util.sleep(BrowserPlugin.SCROLL_DURATION);
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
        runOnPage: async function () {
            $('html, body').animate({
                scrollTop: 0
            });
            return await PluginBase.util.sleep(BrowserPlugin.SCROLL_DURATION);
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
        match: ["little up", "little scroll up", "scroll little up"],
        runOnPage: async function () {
            $('html, body').animate({
                scrollTop: window.scrollY - PluginBase.util.getScrollDistance() / 2
            });
            return await PluginBase.util.sleep(BrowserPlugin.SCROLL_DURATION);
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
        runOnPage: async function () {
            $('html, body').animate({
                scrollTop: window.scrollY - PluginBase.util.getScrollDistance()
            });
            return await PluginBase.util.sleep(BrowserPlugin.SCROLL_DURATION);
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
        runOnPage: async function () {
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
        name: 'Next Page',
        match: ['next page', 'next'],
        delay: [0, 500],
        description: "Looks for a next button on the page and clicks it.",
        runOnPage: async () => {
            $('a:contains("next")')
                // @ts-ignore
                .filter((i, ele:HTMLAnchorElement) => {
                    let goodHref = true;
                    if (ele.href) {
                        // check length to ignore #
                        if (ele.href.length > 3 && ele.href.indexOf(document.location.origin) !== 0)  {
                            goodHref = false;
                        }
                    } 
                    "next page"
                    return goodHref && ele.innerText.length <= 11;
                })
                .get(0).click();
        }
    }, {
        name: 'Previous Page',
        match: ['previous page', 'previous'],
        delay: [0, 500],
        description: "Looks for a previous button on the page and clicks it.",
        runOnPage: async () => {
            $('a:contains("prev")')
                // @ts-ignore
                .filter((i, ele:HTMLAnchorElement) => {
                    let goodHref = true;
                    if (ele.href) {
                        // check length to ignore #
                        if (ele.href.length > 3 && ele.href.indexOf(document.location.origin) !== 0)  {
                            goodHref = false;
                        }
                    } 
                    return goodHref && ele.innerText.length < 10;
                })
                .get(0).click();
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
