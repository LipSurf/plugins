/// <reference path="../@types/cs-interface.d.ts"/>
/// <reference path="../@types/plugin-interface.d.ts"/>
declare let INCLUDE_SPEECH_TEST_HARNESS: boolean;
import { promisify } from "../common/util";
import { retrialAndError, PluginBase } from "../common/plugin-lib";
import { instanceOfCmdLiveTextParcel, instanceOfText, instanceOfToggle, instanceOfTranscript } from "../common/util";

declare global {
    interface Window { 
        commands: any; 
        PluginBase: typeof PluginBase;
        allPlugins: (typeof PluginBase)[]
    }
}

const LIVE_TEXT_HOLD_TIME = 2000;// * 4000;
let activated = false;
let $liveTextOverlay: HTMLIFrameElement;
let lblTimeout;
let commandsLoaded = false;
let ua = PluginBase.util.getNoCollisionUniqueAttr();
// used to determine which video to fullscreen
window.commands = {};
window.PluginBase = PluginBase;
window.allPlugins = [];

// f is what needs to be done -- can be function or promise
// f_check checks whether it was done (optional if the check can't be done in f)
// delay is the gap between tries

// Needs to be safe to call multipe times
function toggleActivated(_activated = true, quiet = false) {
    if (!_activated && activated) {
        activated = false;

        window.allPlugins.forEach(plugin => plugin.destroy ? plugin.destroy() : null);
        
        // remove all overlays
        let $eles = $(`*[${ua}]`);
        $eles.each((i, ele) => {
            try {
                ele.remove();
            } catch (e) {}
        });
    } else if (_activated && !activated) {
        activated = true;
        if (!commandsLoaded) {
            chrome.runtime.sendMessage('loadPlugins');
            commandsLoaded = true;
        }
        retrialAndError(async function() {
            await promisify($(document).ready)();
            if (activated) {
                await attachLiveTextOverlay();
            }
            if (!quiet) {
                // showLiveText("Ready");
            }
        }, function() {
            if ($liveTextOverlay) {
                return document.body.contains($liveTextOverlay[0]);
            }
        }, LIVE_TEXT_HOLD_TIME / 5, 5);

        // open help box
        // retrialAndError(async function() {
        //     await promisify($(document).ready)();
        //     if (activated) {
        //         console.log("opening help box");
        //         $helpBox = await attachOverlay('help-box');
        //         helpBoxOpen = true;
        //     }
        // }, function() {
        //     return !helpBoxOpen || document.body.contains($helpBox[0]);
        // }, 500, 25);
    }
}


async function getFrameHtml(id) {
    // return data, status
    return await $.get(chrome.extension.getURL(`views/${id}.html`));
}

let prevQ:Promise<any>;

// queue async functions to happen synchronously.
// Used to free up handlers to handle other things first
async function queueUp(fn: () => Promise<any>) {
    if (prevQ) {
        prevQ.then(() => {
            prevQ = fn();
        })
    } else {
        prevQ = fn();
    }
}

async function attachLiveTextOverlay() {
    let id = `${PluginBase.util.getNoCollisionUniqueAttr()}-live-text-overlay`;
    // retries used by callers
    try {
        $liveTextOverlay = PluginBase.util.addOverlay(await getFrameHtml('live-text-overlay'), null, id, document.body, true);
    } catch(e) {}
}

async function showLiveText(parcel: ILiveTextParcel) {
    // our element might not get reattached or might get removed from
    //   * bf cache
    //   * dom body overwrites from js
    if (typeof $liveTextOverlay === 'undefined' || !document.body.contains($liveTextOverlay)) {
        await attachLiveTextOverlay();
        console.log(`Reattaching live text overlay`);
    }

    let $liveText = $liveTextOverlay.contentDocument.getElementById('live-text');
    clearTimeout(lblTimeout);
    // remove the old
    $liveText.classList.remove('enter');
    while ($liveText.lastChild) {
        $liveText.removeChild($liveText.lastChild);
    }
    parcel.liveText.map(liveText => {
        // split by word so spans are evenly spaced and can be animated in nicely
        liveText.text.split(' ').map(word => {
            let block = document.createElement('span');
            if (liveText.isFinal)
                block.classList.add('final') 
            if (liveText.isSuccess)
                block.classList.add('success') 
            block.textContent = word.trim();
            $liveText.appendChild(block);
        })
    });
    setTimeout(() => { $liveText.classList.add('enter'); }, 0);
    lblTimeout = setTimeout(() => {
        $liveText.classList.remove('enter');
        $liveText.classList.add('leave');
        setTimeout(() => {
            while ($liveText.lastChild) {
                $liveText.removeChild($liveText.lastChild);
            }
            $liveText.classList.remove('leave');
        }, 1000);
    }, parcel.hold ? LIVE_TEXT_HOLD_TIME * 3 : LIVE_TEXT_HOLD_TIME);
}

// TODO: needs tests
chrome.runtime.onMessage.addListener(function(msg: IBackgroundParcel, sender, sendResponse: (data: any[]) => void) {
    if (instanceOfTranscript(msg)) {
        sendResponse(window[`${msg.cmdPluginId}Plugin`].commands[msg.cmdName].match(msg.processedInput));
    } else if (instanceOfCmdLiveTextParcel(msg)) {
        window[`${msg.cmdPluginId}Plugin`].commands[msg.cmdName].runOnPage.apply(null, msg.cmdArgs);
    } else if (instanceOfText(msg)) {
        queueUp(() => showLiveText(msg));
    } else if (instanceOfToggle(msg)) {
        toggleActivated(msg.toggleActivated);
    }
});

// page was switched back to, it was open before the extension
// was activated -- now it's visible again
document.addEventListener("webkitvisibilitychange", function(event) {
	console.log(`hidden: ${document.hidden}`);
	if (!document.hidden) {
		checkActivatedStatus();
	}
});


function checkActivatedStatus() {
    chrome.storage.local.get('activated', function(activatedObj) {
        if (typeof(activatedObj) == 'object' && activatedObj.activated) {
            toggleActivated(true, true);
        }
    });
}

checkActivatedStatus();


if (INCLUDE_SPEECH_TEST_HARNESS) {
    let port = chrome.runtime.connect({name: "test-probe"});

    window.addEventListener("message", function (evt) {
        let { data, source, origin } = evt;
        let msg = data;
        if (msg.test_probe) {
            port.postMessage({cmd: msg.cmd});
        }
    });
}
