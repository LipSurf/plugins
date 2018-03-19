/// <reference path="../@types/cs-interface.d.ts"/>

declare let rnh_common_constants:any;
import { promisify } from "../common/util";

var activated = false;
const LABEL_FADE_TIME = 2000;
const SCROLL_DISTANCE = 550;
const SCROLL_TIME = 450;
var $previewCmdBox;
var lblTimeout;
var commandsLoaded = false;
// used to determine which video to fullscreen
var $lastExpanded;
var commands = {};
let msgTracker = {};

var $helpBox;
var helpBoxOpen = false;

// @ts-ignore: PluginUtil used by eval'd commands
var PluginUtil: IPluginUtil = {

    toggleHelpBox: async (open) => {
        helpBoxOpen = open;
        if (open) {
            if (!$.contains(document.body, $helpBox)) {
                $helpBox = await attachOverlay('help-box');
            }
            helpBoxOpen = true;
            $helpBox.show();
        } else {
            $helpBox.hide();
        }
    },

    scrollToAnimated: ($ele) => {
        $("html, body").animate({ scrollTop: $ele.offset().top }, SCROLL_TIME);
    },

    // send msg to beacon replacement
    // returns an array of results where results are arrays of all the elements that match
    // in the same frame
    queryAllFrames: function(tagName, attrs): Promise<any[]> {
        return new Promise((resolve, reject) => {
            let msgName = 'get_send';
            let id = +new Date();
            msgTracker[id] = {
                cb: function(res) {
                    resolve(res);
                }
            };
            // post to self
            window.postMessage({ id: id, name: msgName, data: { tagName, attrs } }, window.location.href);
            //let frames = $('iframe');
            //for (let i = 0; i < frames.length; i++) {
                //// filter out `about:...`
                //try {
                    //if (frames[i].src.startsWith('http://') || frames[i].src.startsWith('https://')) {
                        //counts[id].pending += 1;
                        //frames[i].contentWindow.postMessage({ id: id, name: msgName, data: { tagName, attrs } }, frames[i].src);
                    //}
                //} catch (e) { }
            //}
        });
    },

    // We generate a unique id for the message to prevent the issue of generic window onMessage
    // handlers that relay duplicated messages.
    // id            is the special unique element attribute id that gets assigned to all the
    //               elements matched when queryAllFrames is used.
    // fnNames       an array or string of the function names to be called on the element
    // selector      if null then id is used by default
    postToAllFrames: function(id, fnNames, selector=null) {
        let msgName = 'post_send';
        let frames = $('iframe');
        fnNames = typeof fnNames === "object" ? fnNames: [fnNames];
        let msg = { id: +new Date(), name: msgName, data: { id, selector, fnNames  }};
        // also do the main frame
        window.postMessage(msg, window.location.href);
        frames.each((i, frame: any) => {
            try {
                if (!frame.src.startsWith('http://') && !frame.src.startsWith('https://')) {
                    return;
                }
            } catch (e) {}
            frame.contentWindow.postMessage(msg, frame.src);
        })
    },

    // Only checks if the top of the element is in view
    isInView: function($ele) {
        var docViewTop = $(window).scrollTop();
        var docViewBottom = docViewTop + $(window).height();

        var elemTop = $ele.offset().top;

        return ((elemTop <= docViewBottom) && (elemTop >= docViewTop));
    },


    // return a promise that resolves with a response
    sendMsgToBeacon: function(msg) {
        return retrialAndError(new Promise((resolve, reject) => {
            console.log(`send msg to beacon msg: ${JSON.stringify(msg)}`);
            chrome.runtime.sendMessage({ bubbleDown: msg }, function(resp) {
                if (resp) {
                    return resolve(resp);
                } else {
                    return reject();
                }
            });
        }), null, 2000, 2);
    },

    // TODO: make scroll distance a configurable property
    getScrollDistance: () => {
        return SCROLL_DISTANCE;
    },

    getNoCollisionUniqueAttr: () => {
        return rnh_common_constants.NO_COLLISION_UNIQUE_ATTR;
    }
}

class PluginBase {
    static util = PluginUtil;
}

async function getFrameHtml(id) {
    // return data, status
    return await $.get(chrome.extension.getURL(`views/${id}.html`));
}


async function attachOverlay(id) {
    var $iframe = $(`<iframe class="nhm-iframe" id="nhm-${id}"></iframe>`);
    $iframe.appendTo(document.body).contents().find('body').append(await getFrameHtml(id));

    return $iframe;
}


window.addEventListener('message', function(evt) {
    let msg = evt.data;
    let id = msg.id;
    if (msg.isTop) {
        msgTracker[id].cb(msg.data);
        delete msgTracker[id];
    }
}, false);


// f is what needs to be done -- can be function or promise
// f_check checks whether it was done (optional if the check can't be done in f)
// delay is the gap between tries
function retrialAndError(f, f_check, delay, times) {
    return new Promise((resolve, reject) => {
        if (times > 0) {
            let res = Promise.resolve(f);
            res.then((res0) => {
                if (!f_check && res0) {
                    resolve();
                } else {
                    setTimeout(function() {
                        if (f_check) {
                            let res = f_check();
                            if (!res) {
                                return retrialAndError(f, f_check, delay, times - 1);
                            } else {
                                return resolve(res);
                            }
                        } else  {
                            return retrialAndError(f, f_check, delay, times - 1);
                        }
                    }, delay);
                }
            });
        } else {
            return resolve();
        }
    });
}

// Needs to be safe to call multipe times
function toggleActivated(_activated = true, quiet = false) {
    if (!_activated && activated) {
        activated = false;
        try {
            $previewCmdBox.remove();
        } catch (e) {}
        try {
            $helpBox.remove();
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
            $(`#siteTable>div.thing .expando-button`).click((e) => {
                $lastExpanded = $(e.currentTarget);
            });
        }, function() {
            if ($previewCmdBox) {
                return document.body.contains($previewCmdBox[0]);
            }
        }, LABEL_FADE_TIME / 5, 5);

        retrialAndError(async function() {
            await promisify($(document).ready)();
            if (activated) {
                console.log("opening");
                $helpBox = await attachOverlay('help-box');
                helpBoxOpen = true;
            }
        }, function() {
            return !helpBoxOpen || document.body.contains($helpBox[0]);
        }, 500, 25);
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
console.log("rnh-cs loaded");
