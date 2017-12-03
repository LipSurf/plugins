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


async function getFrameHtml(id) {
    // return data, status
    return await $.get(chrome.extension.getURL(`views/${id}.html`));
}


function scrollTo($ele) {
    $("html, body").animate({ scrollTop: $ele.offset().top }, SCROLL_TIME);
}


async function attachOverlay(id) {
    var $iframe = $(`<iframe class="nhm-iframe" id="nhm-${id}"></iframe>`);
    $(document.body).append($iframe);
    $iframe[0].contentDocument.write(await getFrameHtml(id));

    return $iframe;
}


// Only checks if the top of the element is in view
function isInView($ele) {
    var docViewTop = $(window).scrollTop();
    var docViewBottom = docViewTop + $(window).height();

    var elemTop = $ele.offset().top;

    return ((elemTop <= docViewBottom) && (elemTop >= docViewTop));
}



function sendMsgToBeacon(msg) {
    retrialAndError(() => {
        console.log(`send msg to beacon msg: ${JSON.stringify(msg)}`);
        chrome.runtime.sendMessage({ bubbleDown: msg }, function(response) {
            console.log("orig sender received response " + response);
            if (response) {
                console.log("RECEIVED response!");
            }
        });
    }, null, 2000, 2);
}


// f is what needs to be done
// f_check checks whether it was done
// delay is the gap between tries
function retrialAndError(f, f_check, delay, times) {
    if (times > 0) {
        console.log("calling");
        f();
        setTimeout(function() {
            if (f_check && !f_check()) {
                return retrialAndError(f, f_check, delay, times - 1);
            } else if (!f_check) {
                return retrialAndError(f, f_check, delay, times - 1);
            }
        }, delay);
    }
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
            await $(document).ready();
            if (activated) {
                $previewCmdBox = await attachOverlay('preview-cmd-box');
            }
            if (!quiet) {
                showLiveText({ text: "Ready" });
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
            await $(document).ready();
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


async function showLiveText({ text, isSuccess = false, isUnsure = false, hold = false, isError = false } = {}) {
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
        $previewCmdLbl.toggleClass('visible', false);
    }, hold ? LABEL_FADE_TIME * 3 : LABEL_FADE_TIME);
}


// TODO: needs tests
chrome.runtime.onMessage.addListener(function(msg) {
    if (typeof msg.cmdName !== 'undefined') {
        commands[msg.cmdPluginName][msg.cmdName](msg.cmdArgs);
    } else if (typeof msg.liveText !== 'undefined') {
        showLiveText(msg.liveText);
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

checkActivatedStatus();
console.log("rnh-cs loaded");
