/// <reference path="../@types/cs-interface.d.ts"/>
declare let INCLUDE_SPEECH_TEST_HARNESS: boolean;
import { promisify } from "../common/util";
import { attachOverlay, retrialAndError, PluginBase } from "../common/plugin-lib";

var activated = false;
const LABEL_FADE_TIME = 2000;
var $previewCmdBox;
var lblTimeout;
var commandsLoaded = false;
// used to determine which video to fullscreen
var $lastExpanded;
var commands = {};


// f is what needs to be done -- can be function or promise
// f_check checks whether it was done (optional if the check can't be done in f)
// delay is the gap between tries

// Needs to be safe to call multipe times
function toggleActivated(_activated = true, quiet = false) {
    if (!_activated && activated) {
        activated = false;
        // remove all overlays
        try {
            $previewCmdBox.remove();
        } catch (e) {}
    } else if (_activated && !activated) {
        activated = true;
        if (!commandsLoaded) {
            chrome.runtime.sendMessage('loadPlugins');
            commandsLoaded = true;
        }
        retrialAndError(async function() {
            await promisify($(document).ready)();
            if (activated) {
                $previewCmdBox = await attachOverlay('preview-cmd-box');
            }
            if (!quiet) {
                showLiveText("Ready");
            }
        }, function() {
            if ($previewCmdBox) {
                return document.body.contains($previewCmdBox[0]);
            }
        }, LABEL_FADE_TIME / 5, 5);

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


async function showLiveText(text: string, isSuccess: boolean = false, isUnsure: boolean = false, hold: boolean = false, isError: boolean = false) {
    // our element might not get reattached or might get removed from
    //   * bf cache
    //   * dom body overwrites from js
    if (typeof $previewCmdBox === 'undefined' || !document.body.contains($previewCmdBox[0])) {
        $previewCmdBox = await attachOverlay('preview-cmd-box');
    }
    console.log(`showLiveText ${text} ${isSuccess} ${isUnsure}`);
    let $previewCmdLbl = $previewCmdBox.contents().find('.preview-cmd');
    clearTimeout(lblTimeout);
    $previewCmdLbl.toggleClass('success', isSuccess);
    $previewCmdLbl.toggleClass('unsure', isUnsure);
    $previewCmdLbl.toggleClass('error', isError);
    $previewCmdLbl.text(text);
    $previewCmdLbl.toggleClass('visible', true);
    lblTimeout = setTimeout(function() {
        $('iframe.nhm-iframe#nhm-preview-cmd-box').contents().find('.preview-cmd').toggleClass('visible', false)
    }, hold ? LABEL_FADE_TIME * 3 : LABEL_FADE_TIME);
}

function instanceOfCmd(object: any): object is ICmdParcel {
    return 'cmdName' in object;
}

function instanceOfText(object: any): object is ILiveTextParcel {
    return !('cmdName' in object) && !('toggleActivated' in object);
}

function instanceOfToggle(object: any): object is IToggleParcel {
    return 'toggleActivated' in object;
}

// TODO: needs tests
chrome.runtime.onMessage.addListener(function(msg: IBackgroundParcel) {
    if (instanceOfCmd(msg)) {
        window[`${msg.cmdPluginId}Plugin`].commands[msg.cmdName].apply(null, msg.cmdArgs);
    } else if (instanceOfText(msg)) {
        showLiveText(msg.liveText.text, msg.liveText.isSuccess);
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

window['PluginBase'] = PluginBase;


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
