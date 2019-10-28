/// <reference types="lipsurf-plugin-types"/>
declare const PluginBase: IPluginBase;

let autoscrollIntervalId: number;
const SCROLL_SPEED_FACTORS = [200, 100, 75, 50, 30, 20, 10, 5];
const SCROLL_DURATION = 400;
const AUTOSCROLL_OPT = 'autoscroll-index';

function stopAutoscroll(): void {
    window.clearInterval(autoscrollIntervalId);
    PluginBase.util.enterContext('default');
}

function setAutoscroll(indexDelta: number = 0) {
    let prevPos: number|undefined;
    const scrollFactor = 1;
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

function getScrollEl(): HTMLElement|Window {
    let el: HTMLElement|Window = window;

    if (document.location.origin === 'https://mail.google.com' || document.location.origin === 'https://inbox.google.com') {
        el = document.getElementById(':3') || el;
    } else if (document.location.host === 'docs.google.com') {
        el = document.querySelector<HTMLElement>('.kix-appview-editor')!;
    }

    let helpBox = document.getElementById(`${PluginBase.util.getNoCollisionUniqueAttr()}-helpBox`);

    if (helpBox && helpBox.scrollHeight > helpBox.clientHeight)
        el = helpBox;
    return el;
}

async function scrollAmount({top, left}: {top?: number, left?: number}, relative=true) {
    let el = getScrollEl();
    let scrollObj = {
        top,
        left,
        behavior: 'smooth' as ScrollBehavior, 
    };
    if (relative) {
        el.scrollBy(scrollObj);
    } else {
        el.scrollTo(scrollObj);
    }
    // used to not need this because the scroll change would be enough,
    // to cancel autoscrolling internally
    stopAutoscroll();
    return await PluginBase.util.sleep(SCROLL_DURATION);
}

type ScrollType = 'u'|'d'|'l'|'r'|'t'|'b';

async function scroll(direction: ScrollType, little: boolean = false) {
    // pdf needs keypresses
    const needsKeyPressEvents = /\.pdf$/.test(document.location.pathname);
    let factor: number;
    // the key to press if we must scroll using the keyboard
    let key: number;
    switch (direction) {
        case 'u':
            factor = -0.85;
            key = 38;
            break
        case 'd':
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
    if (needsKeyPressEvents) {
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
    version: '2.9.0',
    match: /.*/,
    authors: "Miko",
    homophones: {
        'autoscroll': 'auto scroll',
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
    },
    contexts: {
        'Auto Scroll': {
            extends: 'default',
        }
    },

    destroy() {
        stopAutoscroll();
    },

    commands: [
        {
            name: 'Scroll Down',
            match: ["down", "scroll down", "d"],
            // A delay would be alleviate mismatches between "little down" but isn't worth the slowdown
            // delay: [300, 0],
            pageFn: async () => {
                return scroll('d');
            },
        }, {
            name: 'Scroll Up',
            match: ["up", "scroll up"],
            pageFn: async () => {
                return scroll('u');
            },
        }, {
            name: 'Auto Scroll',
            match: ["auto scroll", "automatic scroll"],
            description: 'Continuously scroll down the page slowly, at a reading pace.',
            enterContext: 'Auto Scroll',
            pageFn: async () => {
                setAutoscroll();
            }
        }, {
            name: 'Slow Down',
            match: ['slower', 'slow down'],
            context: 'Auto Scroll',
            description: 'Slow down the auto scroll',
            pageFn: async () => {
                setAutoscroll(-1);
            }
        }, {
            name: 'Speed Up',
            match: ['faster', 'speed up'],
            context: 'Auto Scroll',
            description: 'Speed up the auto scroll',
            pageFn: async () => {
                setAutoscroll(1);
            }
        }, {
            name: 'Stop',
            match: ['stop', 'pause'],
            context: 'Auto Scroll',
            description: 'Stop the auto scrolling.',
            pageFn: async () => {
                stopAutoscroll();
            }
        }, {
            name: 'Scroll Bottom',
            match: ["bottom", "bottom of page", "bottom of the page", "scroll bottom", "scroll to bottom", "scroll to the bottom of page", "scroll to the bottom of the page"],
            pageFn: async () => {
                return scroll('b');
            },
        }, {
            name: 'Scroll Top',
            match: ["top", "top of page", "top of the page", "scroll top", "scroll to top", "scroll to the top"],
            pageFn: async () => {
                return scroll('t');
            },
        }, {
            name: 'Scroll Down a Little',
            match: ["little down", "little scroll down"],
            pageFn: async () => {
                return scroll('d', true);
            },
        }, {
            name: 'Scroll Up a Little',
            match: ["little up", "little scroll up"],
            pageFn: async () => {
                return scroll('u', true);
            },
        }, {
            name: 'Scroll Left',
            match: 'scroll left',
            pageFn: async () => {
                return scroll('l');
            }
        }, {
            name: 'Scroll Right',
            match: 'scroll right',
            pageFn: async () => {
                return scroll('r');
            }
        }
    ],
}};
