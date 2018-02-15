declare var toggleFullScreen: (boolean) => void;
const customArgumentsToken = Symbol("__ES6-PROMISIFY--CUSTOM-ARGUMENTS__");
interface ILiveText {
    text: string,
    isSuccess: boolean,
}
interface IBackgroundParcel {
    cmdName: undefined | string,
    cmdPluginName: undefined | string,
    liveText: undefined | ILiveText,
    toggleActivated: undefined | boolean,
    cmdArgs: undefined | any[],
}
var activated = false;
const LABEL_FADE_TIME = 2000;
const SCROLL_DISTANCE = 550;
const SCROLL_TIME = 450;
var $previewCmdBox;
var $helpBox;
var lblTimeout;
var helpBoxOpen = false;
var commandsLoaded = false;
// used to determine which video to fullscreen
var $lastExpanded;
var commands = {};
let msgTracker = {};



async function getFrameHtml(id) {
    // return data, status
    return await $.get(chrome.extension.getURL(`views/${id}.html`));
}


function scrollToAnimated($ele) {
    $("html, body").animate({ scrollTop: $ele.offset().top }, SCROLL_TIME);
}


async function attachOverlay(id) {
    var $iframe = $(`<iframe class="nhm-iframe" id="nhm-${id}"></iframe>`);
    $iframe.appendTo(document.body).contents().find('body').append(await getFrameHtml(id));

    return $iframe;
}


// Only checks if the top of the element is in view
function isInView($ele) {
    var docViewTop = $(window).scrollTop();
    var docViewBottom = docViewTop + $(window).height();

    var elemTop = $ele.offset().top;

    return ((elemTop <= docViewBottom) && (elemTop >= docViewTop));
}



// return a promise that resolves with a response
function sendMsgToBeacon(msg) {
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
}


window.addEventListener('message', function(evt) {
    let msg = evt.data;
    let id = msg.id;
    if (msg.isTop) {
        msgTracker[id].cb(msg.data);
        delete msgTracker[id];
    }
}, false);


// send msg to beacon replacement
// returns an array of results where results are arrays of all the elements that match 
// in the same frame
function queryAllFrames(tagName, attrs) {
    return new Promise((resolve, reject) => {
        let msgName = 'get_send';
        let frames = $('iframe');
        let id = +new Date();
        msgTracker[id] = {
            cb: function(res) {
                resolve(res);
            }
        };
        // post to self
        window.postMessage({ id: id, name: msgName, data: { tagName, attrs } }, window.location.href);
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
}


// We generate a unique id for the message to prevent the issue of generic window onMessage
// handlers that relay duplicated messages.
// id            is the special unique element attribute id that gets assigned to all the
//               elements matched when queryAllFrames is used.
// selector      if null then id is used by default
// fnNames       an array or string of the function names to be called on the element
function postToAllFrames({id, selector, fnNames}) {
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
}


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
            $(`#siteTable>div.thing .expando-button`).click(function(e) {
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


// TODO: needs tests
chrome.runtime.onMessage.addListener(function(msg: IBackgroundParcel) {
    if (typeof msg.cmdName !== 'undefined') {
        commands[msg.cmdPluginName][msg.cmdName].apply(null, msg.cmdArgs);
    } else if (typeof msg.liveText !== 'undefined') {
        showLiveText(msg.liveText.text, msg.liveText.isSuccess);
    } else if (typeof msg.toggleActivated !== "undefined") {
        toggleActivated(msg.toggleActivated);
    }
});


document.addEventListener("webkitfullscreenchange", function(event) {
    // a user initiated non-voice full screen change -- take off our special fullscreen
    console.log(`rnh-cs removing fullscreen ${document.webkitIsFullScreen}`);
    toggleFullScreen(false);
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


function promisify<T>(original, withError: boolean = false): (...args) => Promise<T> {

    // Ensure the argument is a function
    if (typeof original !== "function") {
        throw new TypeError("Argument to promisify must be a function");
    }

    // If the user has asked us to decode argument names for them, honour that
    const argumentNames = original[customArgumentsToken];

    // If we can find no Promise implemention, then fail now.
    if (typeof Promise !== "function") {
        throw new Error("No Promise implementation found; do you need a polyfill?");
    }

    return function (...args) {
        return new Promise((resolve, reject) => {

            // Append the callback bound to the context
            args.push(function callback() {
                let values = [];
                for (var i = withError ? 1 : 0; i < arguments.length; i++) {
                    values.push(arguments[i]);
                }

                if (withError && arguments[0]) {
                    return reject(arguments[0]);
                }

                if (values.length === 1 || !argumentNames) {
                    return resolve(values[0]);
                }

                let o: T;
                values.forEach((value, index) => {
                    const name = argumentNames[index];
                    if (name) {
                        o[name] = value;
                    }
                });

                resolve(o);
            });

            // Call the function.
            original.call(this, ...args);
        });
    };
}

checkActivatedStatus();
console.log("rnh-cs loaded");