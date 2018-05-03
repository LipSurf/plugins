/// <reference path="../@types/cs-interface.d.ts"/>
/// <reference path="../@types/plugin-interface.d.ts"/>
declare let INCLUDE_SPEECH_TEST_HARNESS: boolean;
import { retrialAndError, PluginBase } from "../common/plugin-lib";
import { promisify, instanceOfCmdLiveTextParcel, instanceOfText, instanceOfTranscript, instanceOfCode } from "../common/util";
import { storage } from "../common/browser-interface";

declare global {
    interface Window {
        commands: any;
        PluginBase: typeof PluginBase;
        allPlugins: (typeof PluginBase)[]
    }
}

const LIVE_TEXT_HOLD_TIME = 2000;// * 4000;
let activated = false;
let ua = PluginBase.util.getNoCollisionUniqueAttr();
let liveTextShadowRootId = `${ua}-live-text-overlay`;
let liveTextEle: HTMLDivElement;
let lblTimeout: number;
let commandsLoaded = false;
let commandsLoading = false;
let cmdsQ: Promise<any>;
let liveTextQ: Promise<any>;

// used to determine which video to fullscreen
window.commands = {};
window.PluginBase = PluginBase;
window.allPlugins = [];

// f is what needs to be done -- can be function or promise
// f_check checks whether it was done (optional if the check can't be done in f)
// delay is the gap between tries

// Needs to be safe to call multipe times
function toggleActivated(_activated = true, quiet = false) {
    if (_activated) {
        activated = true;
        if (!commandsLoaded && !commandsLoading) {
            commandsLoading = true;
            window.allPlugins = [];
            chrome.runtime.sendMessage('loadPlugins', () => {
                console.log(`main.ts received loadPage ${window.allPlugins}`);
                window.allPlugins.forEach(plugin => plugin.init ? plugin.init() : null);
                commandsLoaded = true;
            });
        } else {
            window.allPlugins.forEach(plugin => {
                if (plugin.init) {
                    try {
                        plugin.init();
                    } catch(e) {
                        console.error(`could not initialize plugin ${plugin} ${e}`);
                    }
                }
            });
        }
        retrialAndError(async function () {
            await promisify($(document).ready)();
            if (activated) {
                await attachLiveTextOverlay();
            }
            if (!quiet) {
                // showLiveText("Ready");
            }
        }, function () {
            return document.getElementById(liveTextShadowRootId);
        }, LIVE_TEXT_HOLD_TIME / 5, 5);
    } else {
        activated = false;

        window.allPlugins.forEach(plugin => {
            if (plugin.destroy) {
                try {
                    plugin.destroy();
                } catch(e) {
                    console.error(`error destroying plugin ${plugin} ${e}`);
                }
            }
        });

        // remove all overlays
        $(`*[${ua}]`).each((i, ele) => {
            try {
                ele.remove();
            } catch (e) { }
        });
    }
}


async function getFrameHtml(id) {
    // return data, status
    return await $.get(chrome.extension.getURL(`views/${id}.html`));
}

// queue async functions to happen synchronously.
// Used to free up handlers to handle other things first
async function queueUp(fn: () => Promise<any>, prevQ: Promise<any>) {
    if (prevQ) {
        try {
            await prevQ;
        } catch (e) {
            console.error(`Could not await previous in Q ${e}`);
        }
    }
    return await fn();
}

async function attachLiveTextOverlay() {
    let shadowCont = document.createElement('div');
    shadowCont.id = liveTextShadowRootId;
    let shadow = shadowCont.attachShadow({ mode: 'open' });
    shadow.innerHTML = await getFrameHtml('live-text-overlay');
    liveTextEle = shadow.querySelector('#live-text');
    // retries used by callers
    try {
        document.body.appendChild(shadowCont);
    } catch (e) { }
}

async function showLiveText(parcel: ILiveTextParcel) {
    // our element might not get reattached or might get removed from
    //   * bf cache
    //   * dom body overwrites from js
    if (!document.getElementById(liveTextShadowRootId)) {
        await attachLiveTextOverlay();
        console.log(`Reattaching live text overlay`);
    }
    liveTextEle.classList.remove('leave');

    // clear it out
    while (liveTextEle.firstChild) {
        liveTextEle.removeChild(liveTextEle.firstChild);
    }
    let spanned = document.createElement('span');
    if (parcel.isFinal) 
        spanned.classList.add('final');
    if (parcel.isSuccess)  
        spanned.classList.add('success');
    spanned.innerText = parcel.text;
    liveTextEle.appendChild(spanned);

    if (lblTimeout) {
        clearTimeout(lblTimeout);
    } 
    lblTimeout = window.setTimeout(() => {
        liveTextEle.classList.add('leave');
    }, parcel.hold ? LIVE_TEXT_HOLD_TIME * 3 : LIVE_TEXT_HOLD_TIME);
}

// TODO: needs tests
chrome.runtime.onMessage.addListener(function (msg: IBackgroundParcel, sender, sendResponse: (data: any[]) => void) {
    if (instanceOfCmdLiveTextParcel(msg)) {
        cmdsQ = queueUp(() => window[`${msg.cmdPluginId}Plugin`].commands[msg.cmdName].runOnPage.apply(null, msg.cmdArgs), cmdsQ);
    } else if (instanceOfTranscript(msg)) {
        sendResponse(window[`${msg.cmdPluginId}Plugin`].commands[msg.cmdName].match(msg.text));
    } else if (instanceOfText(msg)) {
        liveTextQ = queueUp(() => showLiveText(msg), liveTextQ);
    } else if (instanceOfCode(msg)) {
        eval(msg.code);
        sendResponse(null);
        return true;
    }
});

// page could have been switched back to, it was open before the extension
// was activated -- now it's active again.
storage.local.registerOnChangeCb((changes) => {
    if (changes && changes.activated) {
        toggleActivated(changes.activated.newValue, true);
    }
});


// might need to rerun init for plugins (for example for annotate)
document.addEventListener("webkitvisibilitychange", function (event) {
    console.log(`hidden: ${document.hidden}`);
    if (!document.hidden) {
        checkActivatedStatus();
    }
});


function checkActivatedStatus() {
    chrome.storage.local.get('activated', function (activatedObj) {
        if (typeof (activatedObj) == 'object' && activatedObj.activated) {
            toggleActivated(true, true);
        }
    });
}

checkActivatedStatus();


if (INCLUDE_SPEECH_TEST_HARNESS) {
    let port = chrome.runtime.connect({ name: "test-probe" });

    window.addEventListener("message", function (evt) {
        let { data, source, origin } = evt;
        let msg = data;
        if (msg.test_probe) {
            port.postMessage({ cmd: msg.cmd });
        }
    });
}
