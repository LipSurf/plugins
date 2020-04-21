/// <reference types="lipsurf-plugin-types"/>
declare const PluginBase: IPluginBase;

let autoscrollIntervalId: number;
const SCROLL_SPEED_FACTORS = [240, 120, 90, 60, 36, 24, 12, 6];
const SCROLL_DURATION = 400;
const AUTOSCROLL_OPT = 'autoscroll-index';
let scrollNodes: HTMLElement[] = [];
let scrollIndex: number = 0;

function stopAutoscroll(): void {
    window.clearInterval(autoscrollIntervalId);
    PluginBase.util.removeContext('Auto Scroll');
}

function setAutoscroll(indexDelta: number = 0) {
    let prevPos: number|undefined;
    const zoomFactor = window.outerWidth / window.document.documentElement.clientWidth;
    // need to add .1 (if it's less than a device pixel, no scrolling will happen)
    const scrollFactor = Math.round(1/zoomFactor * 10)/10 + 0.1;
    const savedScrollSpeed = PluginBase.getPluginOption('Scroll', AUTOSCROLL_OPT);
    let scrollSpeedIndex = (typeof savedScrollSpeed === 'number' ? savedScrollSpeed : 3) + indexDelta;

    if (scrollSpeedIndex >= SCROLL_SPEED_FACTORS.length) {
        scrollSpeedIndex = SCROLL_SPEED_FACTORS.length - 1;
    } else if (scrollSpeedIndex < 0) {
        scrollSpeedIndex = 0;
    }

    console.log('scroll speed', scrollSpeedIndex);
    // save it as a preference
    PluginBase.setPluginOption('Scroll', AUTOSCROLL_OPT, scrollSpeedIndex);

    window.clearInterval(autoscrollIntervalId);
    const scrollEl = getScrollEl();
    if (scrollEl) {
        autoscrollIntervalId = window.setInterval(() => {
            // @ts-ignore
            const scrollYPos = scrollEl.scrollY || scrollEl.scrollTop;
            scrollEl.scrollBy(0, scrollFactor);
            // if there was outside movement, or if we hit the bottom
            if (prevPos && (scrollYPos - prevPos <= 0 || scrollYPos - prevPos > scrollFactor * 1.5)) {
                console.log('stopping due to detected scroll activity');
                stopAutoscroll();
            }
            prevPos = scrollYPos;
        }, SCROLL_SPEED_FACTORS[scrollSpeedIndex]);
    }
}

// The following inspired by Surfingkeys
// https://github.com/brookhong/Surfingkeys

function hasScroll(el: HTMLElement, direction: 'y'|'x', barSize: number) {
    const offset = (direction === 'y') ? ['scrollTop', 'height'] : ['scrollLeft', 'width'];
    let scrollPos = el[offset[0]];

    if (scrollPos < barSize) {
        // set scroll offset to barSize, and verify if we can get scroll offset as barSize
        const originOffset = el[offset[0]];
        el[offset[0]] = el.getBoundingClientRect()[offset[1]];
        scrollPos = el[offset[0]];
        // if (scrollPos !== originOffset) {
        //     Mode.suppressNextScrollEvent();
        // }
        el[offset[0]] = originOffset;
    }
    return scrollPos >= barSize;
}

function scrollableMousedownHandler(e: MouseEvent) {
    const n = <HTMLElement>e.currentTarget!;
    const target = <HTMLElement>e.target;
    if (!n.contains(target)) return;
    let index = scrollNodes.lastIndexOf(target);
    if (index === -1) {
        for (var i = scrollNodes.length - 1; i >= 0; i--) {
            if (scrollNodes[i].contains(target)) {
                index = i;break;
            }
        }
        if (index === -1) console.warn('cannot find scrollable', e.target);
    }
    scrollIndex = index;
};

/**
 * Currently has a minimum threshold of 60 scrolling pixels
 */
function getScrollableEls(): HTMLElement[] {
    console.time('getScrollableEls');
    let nodes = listElements(document.body, NodeFilter.SHOW_ELEMENT, function(n) {
        // the offset height is how much is visible currently
        return (hasScroll(n, 'y', 16) && n.scrollHeight - n.offsetHeight > 60 ) || (hasScroll(n, 'x', 16) && n.scrollWidth - n.scrollWidth > 60);
    });
    nodes.sort(function(a, b) {
        if (b.contains(a)) return 1;
        else if (a.contains(b)) return -1;
        return b.scrollHeight * b.scrollWidth - a.scrollHeight * a.scrollWidth;
    });
    if (document.scrollingElement!.scrollHeight > window.innerHeight
        || document.scrollingElement!.scrollWidth > window.innerWidth) {
        nodes.unshift(<HTMLElement>document.scrollingElement);
    }
    nodes.forEach(function (n) {
        n.removeEventListener('mousedown', scrollableMousedownHandler);
        n.addEventListener('mousedown', scrollableMousedownHandler);
    });
    console.timeEnd('getScrollableEls');
    return nodes;
}

function listElements(root, whatToShow, filter): HTMLElement[] {
    const elms: HTMLElement[] = [];
    let currentNode: HTMLElement|null;
    const nodeIterator = document.createNodeIterator(
        root,
        whatToShow,
        null
    );

    while (currentNode = <HTMLElement>nodeIterator.nextNode()) {
        filter(currentNode) && elms.push(currentNode);

        if (currentNode.shadowRoot) {
            elms.push(...listElements(currentNode.shadowRoot, whatToShow, filter));
        }
    }

    return elms;
}

// END surfingkeys inspiration

function getScrollEl(): HTMLElement|Window|undefined {
    let el: HTMLElement|Window|undefined = window;
    const helpBox = document.getElementById(`${PluginBase.util.getNoCollisionUniqueAttr()}-helpBox`);

    if (helpBox && helpBox.scrollHeight > helpBox.clientHeight) {
        el = helpBox;
    } else if (document.location.host === 'docs.google.com') {
        el = document.querySelector<HTMLElement>('.kix-appview-editor')!;
    } else if (document.scrollingElement!.scrollHeight > window.innerHeight ||
        document.scrollingElement!.scrollWidth > window.innerWidth) {
        el = <HTMLElement>document.scrollingElement!;
    } else {
        // find it the hard way
        scrollNodes = getScrollableEls();
        el = scrollNodes[scrollIndex];
    }

    return el;
}

async function scrollAmount({top, left}: {top?: number, left?: number}, relative=true, el=getScrollEl()) {
    if (el) {
        const scrollObj = {
            top,
            left,
            behavior: 'smooth' as ScrollBehavior, 
        };
        if (relative) {
            el.scrollBy(scrollObj);
        } else {
            el.scrollTo(scrollObj);
        }
    }
    // used to not need this because the scroll change would be enough,
    // to cancel autoscrolling internally
    stopAutoscroll();
    return await PluginBase.util.sleep(SCROLL_DURATION);
}

// hd and hu are help down and help up respectively
type ScrollType = 'u'|'d'|'l'|'r'|'t'|'b'|'hd'|'hu';

async function scroll(direction: ScrollType, little: boolean = false) {
    // pdf needs keypresses
    const needsKeyPressEvents = /\.pdf$/.test(document.location.pathname);
    let factor: number;
    // the key to press if we must scroll using the keyboard
    let key: number;
    switch (direction) {
        case 'u':
        case 'hu':
            factor = -0.85;
            key = 38;
            break
        case 'd':
        case 'hd':
            factor = 0.85;
            key = 40;
            break
        case 'l':
            factor = -0.7;
            key = 37;
            break;
        case 'r':
            factor = 0.7;
            key = 39;
            break;
        case 't':
            factor = 0;
            key = 36;
            break;
        case 'b':
            factor = 10000;
            key = 35;
            break;
    }
    const littleFactor = little ? 0.5 : 1;
    if (direction === 'hd' || direction === 'hu') {
        const hud = PluginBase.util.getHUDEl()[0]; 
        const helpContents = hud.querySelector<HTMLDivElement>('#help .cmds')!;
        scrollAmount({top: helpContents.offsetHeight * factor! }, true, helpContents);
    } else if (needsKeyPressEvents) {
        let codes: number[];
        if (direction === 't' || direction === 'b') {
            codes = [key!];
        } else {
            codes = new Array(14 * littleFactor).fill(key!);
        }
        chrome.runtime.sendMessage({ type: 'pressKeys', payload: { codes, nonChar: true } });
    } else {
        let horizontal = direction === 'l' || direction === 'r';
        if (horizontal)
            scrollAmount({left: window.innerWidth * factor! * littleFactor});
        else {
            // special case for bottom
            const relative = direction !== 't';
            if (direction === 'b' && document.body.scrollHeight != 0) {
                // document.body.scrollHeight is too small on duckduckgo
                return scrollAmount({ top: document.documentElement.scrollHeight });
            }
            scrollAmount({top: window.innerHeight * factor! * littleFactor}, relative);
        }
    }
}

function queryScrollPos(querySelector?: string) {
    if (querySelector) {
        const scrollEl = document.querySelector(querySelector)!;
        return scrollEl.scrollTop;
    } else {
        return window.scrollY;
    }
}

async function testScroll(t: ExecutionContext<ICommandTestContext>, 
        say: (phrase?: string) => Promise<void>, 
        client: WebdriverIOAsync.BrowserObject,
        url: string, 
        querySelector?: string,
        test: {
            greater?: boolean,
            lessThan?: boolean,
            zero?: boolean,
        } = {greater: true},
        ) {
    await client.url(url);
    // in case there's a redirect or something
    t.is(await client.getUrl(), url);
    // scroll down first
    if (test.zero || test.lessThan)
        // compound test 
        await say('bottom');
    const scrollStart = await client.execute(queryScrollPos, querySelector);
    await say();
    const scrollEnd = await client.execute(queryScrollPos, querySelector);
    if (test.greater)
        t.true(scrollEnd > scrollStart, `scrollStart: ${scrollStart} scrollEnd: ${scrollEnd} for ${url}`);
    else if (test.lessThan)
        t.true(scrollEnd < scrollStart, `scrollStart: ${scrollStart} scrollEnd: ${scrollEnd} for ${url}`);
    else if (test.zero)
        t.is(scrollEnd, 0, `scrollStart: ${scrollStart} scrollEnd: ${scrollEnd} for ${url}`);
}

export default <IPluginBase & IPlugin> {...PluginBase, ...{
    niceName: 'Scroll',
    description: 'Commands for scrolling the page.',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" version="1" viewBox="0 0 128 128"><g class="iconic-move-sm iconic-container iconic-sm" transform="scale(8)">
        <path stroke="#000" stroke-width="2" stroke-linecap="square" d="M8 3v11" fill="none"></path>
        <path stroke="#000" stroke-width="2" stroke-linecap="square" d="M13 8h-10" fill="none"></path>
        <path d="M8 0l-3 3h6z"></path>
        <path d="M16 8l-3-3v6z"></path>
        <path d="M0 8l3 3v-6z"></path>
        <path d="M8 16l3-3h-6z"></path>
    </g></svg>`,
    version: '3.3.0',
    match: /.*/,
    authors: "Miko",
    homophones: {
        'autoscroll': 'auto scroll',
        'horoscrope': 'auto scroll',
        'app': 'up',
        'upwards': 'up',
        'upward': 'up',
        'dumb': 'down',
        'gout': 'down',
        'downwards': 'down',
        'town': 'down',
        'don': 'down',
        'downward': 'down',
        'boreham': 'bottom',
        'volume': 'bottom',
        'barton': 'bottom',
        'barn': 'bottom',
        'born': 'bottom',
        'littledown': 'little down',
        'put it down': 'little down',
        'will down': 'little down',
        'middletown': 'little down',
        'little rock': 'little up',
        'lidl up': 'little up',
        'school little rock': 'scroll little up',
        'time of the page': 'top of the page',
        'scrolltop': 'scroll top',
        'scrub top': 'scroll top',
        'talk': 'top',
        'chop': 'top',
        'school': 'scroll',
        'screw': 'scroll',
        'small': 'little',
        'flower': 'slower',
        'lower': 'slower',
        'pastor': 'faster',
        'master': 'faster',
        'auto spa': 'auto scroll',
        'scallop': 'scroll up',
        'school health': 'scroll help',
        'prohealth': 'scroll help',
    },
    contexts: {
        'Auto Scroll': {
            commands: [
                'Speed Up',
                'Slow Down',
                'Stop',
            ],
        },
    },

    destroy() {
        stopAutoscroll();
    },

    commands: [
        {
            name: 'Scroll Down',
            match: ["down", "scroll down", "d"],
            activeDocument: true,
            // A delay would be alleviate mismatches between "little down" but isn't worth the slowdown
            // delay: [300, 0],
            pageFn: () => {
                return scroll('d');
            },
            test: {
                'google': async (t, say, client) => {
                    // google search results (normal page)
                    await testScroll(
                        t, 
                        say,
                        client,
                        'https://www.google.com/search?q=lipsurf'
                        );
                },
                'gdocs': async (t, say, client) => {
                    await testScroll(
                        t,
                        say,
                        client,
                        'https://docs.google.com/document/d/1Tdfk2UvIXxwZOoluLh6o1kN1CrKHWbXcmUIsDKRHTEI/edit',
                        '.kix-appview-editor'
                        );
                },
                'gmail': async (t, say, client) => {
                    await testScroll(
                        t,
                        say,
                        client,
                        `${t.context.localPageDomain}/gmail-long-message.html`,
                        '#\\:3'
                        );
                },
                'whatsapp': async (t, say, client) => {
                    await testScroll(
                        t,
                        say,
                        client,
                        `${t.context.localPageDomain}/whatsapp.html`,
                        '._1_keJ'
                        );
                },
                'quip': async (t, say, client) => {
                    await testScroll(
                        t,
                        say,
                        client,
                        `${t.context.localPageDomain}/quip.html`,
                        '.parts-screen-body.scrollable'
                        );
                },
                'iframe': async (t, say, client) => {
                    const getScrollPos = () => {
                        return document.querySelector('iframe')!.contentDocument?.querySelector('._1_keJ')!.scrollTop;
                    };
                    await client.url(`${t.context.localPageDomain}/scroll-iframe.html`);
                    await (await client.$('iframe')).click();
                    const scrollStart = await client.execute(getScrollPos);
                    await say();
                    const scrollEnd = await client.execute(getScrollPos);
                    t.true(scrollEnd > scrollStart, `scrollStart: ${scrollStart} scrollEnd: ${scrollEnd}`);
                },
            }
        }, {
            name: 'Scroll Up',
            match: ["up", "scroll up"],
            activeDocument: true,
            pageFn: () => {
                return scroll('u');
            },
        }, {
            name: 'Auto Scroll',
            match: ["auto scroll", "automatic scroll"],
            description: 'Continuously scroll down the page slowly, at a reading pace.',
            activeDocument: true,
            pageFn: () => {
                PluginBase.util.addContext('Auto Scroll');
                setAutoscroll();
            }
        }, {
            name: 'Slow Down',
            match: ['slower', 'slow down'],
            description: 'Slow down the auto scroll',
            activeDocument: true,
            normal: false,
            pageFn: () => {
                setAutoscroll(-1);
            }
        }, {
            name: 'Speed Up',
            match: ['faster', 'speed up'],
            activeDocument: true,
            normal: false,
            description: 'Speed up the auto scroll',
            pageFn: () => {
                setAutoscroll(1);
            }
        }, {
            name: 'Stop',
            match: ['stop', 'pause'],
            activeDocument: true,
            normal: false,
            description: 'Stop the auto scrolling.',
            pageFn: () => {
                stopAutoscroll();
            }
        }, {
            name: 'Scroll Bottom',
            match: ["bottom", "bottom of page", "bottom of the page", "scroll bottom", "scroll to bottom", "scroll to the bottom of page", "scroll to the bottom of the page"],
            activeDocument: true,
            pageFn: () => {
                return scroll('b');
            },
            test: async function(t, say, client) {
                await testScroll(t, say, client, `http://motherfuckingwebsite.com/`);
            }
        }, {
            name: 'Scroll Top',
            match: ["top", "top of page", "top of the page", "scroll top", "scroll to top", "scroll to the top"],
            activeDocument: true,
            pageFn: () => {
                return scroll('t');
            },
            test: async function(t, say, client) {
                await testScroll(t, say, client, `http://motherfuckingwebsite.com/`, undefined, {zero: true});
            }
        }, {
            name: 'Scroll Help Down',
            match: "scroll help down",
            pageFn: () => scroll('hd', true),
        }, {
            name: 'Scroll Help Up',
            match: "scroll help up", 
            pageFn: () => scroll('hu', true),
        }, {
            name: 'Scroll Down a Little',
            match: ["little down", "little scroll down"],
            activeDocument: true,
            pageFn: () => {
                return scroll('d', true);
            },
        }, {
            name: 'Scroll Up a Little',
            match: ["little up", "little scroll up"],
            activeDocument: true,
            pageFn: () => {
                return scroll('u', true);
            },
        }, {
            name: 'Scroll Left',
            match: 'scroll left',
            activeDocument: true,
            pageFn: () => {
                return scroll('l');
            }
        }, {
            name: 'Scroll Right',
            match: 'scroll right',
            activeDocument: true,
            pageFn: () => {
                return scroll('r');
            }
        }
    ],
}};
