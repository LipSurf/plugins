var on = false;
const LABEL_FADE_TIME = 2000;
const SCROLL_DISTANCE = 550;
const SCROLL_TIME = 450;
var $previewCmdBox;
var $helpBox;
var lblTimeout;
var helpBoxOpen = false;
// used to determine which video to fullscreen
var $lastExpanded;
var commands = {};


function getFrameHtml(id) {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", chrome.extension.getURL(`views/${id}.html`), false);
    xmlhttp.send();

    return xmlhttp.responseText;
}


function scrollTo($ele) {
    $("html, body").animate({ scrollTop: $ele.offset().top }, SCROLL_TIME);
}


function attachOverlay(id) {
	var $iframe = $(`<iframe class="nhm-iframe" id="nhm-${id}"></iframe>`);
    $(document.body).append($iframe);
    $iframe[0].contentDocument.write(getFrameHtml(id));

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
        chrome.runtime.sendMessage({bubbleDown: msg}, function (response) {
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
			if (f_check && !f_check())	{
                return retrialAndError(f, f_check, delay, times - 1);
			} else if (!f_check) {
                return retrialAndError(f, f_check, delay, times - 1);
			}
		}, delay);
	}
}


function init(quiet=false) {
    retrialAndError(function() {
        $(document).ready(function () {
            if (on) {
                $previewCmdBox = attachOverlay('preview-cmd-box');
            }
            if (typeof quiet === 'undefined' || quiet === false) {
                showLiveText({text: "Ready"});
            }
            $(`#siteTable>div.thing .expando-button`).click(function(e) {
				$lastExpanded = $(e.currentTarget);
			});
        });
    }, function() {
    	if ($previewCmdBox) {
	    	return document.body.contains($previewCmdBox[0]);
	    }
	}, LABEL_FADE_TIME - 200, 5);

    retrialAndError(function() {
		$(document).ready(function() {
			if (on) {
			    console.log("opening");
                $helpBox = attachOverlay('help-box');
                helpBoxOpen = true;
            }
		});
	}, function() {
        return !helpBoxOpen || document.body.contains($helpBox[0]);
	}, 2000, 5);
}


function destroy() {
	if (!on) {
		try {
			$previewCmdBox.remove();
		} catch(e) {}
        try {
            $helpBox.remove();
        } catch(e) {}
	}
}


function showLiveText({text, isSuccess=false, isUnsure=false, hold=false, isError=false} = {}) {
	// our element might not get reattached or might get removed from
	//   * bf cache
	//   * dom body overwrites from js
	if (typeof $previewCmdBox === 'undefined' || !document.body.contains($previewCmdBox[0])) {
	    $previewCmdBox = attachOverlay('preview-cmd-box');
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
	} else if (typeof msg.toggleOn !== 'undefined') {
		on = msg.toggleOn;
		if (on) {
			init();
		} else {
			destroy();
		}
	} else if (typeof msg.toggleActive !== "undefined") {
		if (msg.toggleActive) {
			init(true);
		} else {
			destroy();
		}
	}
});


document.addEventListener("webkitfullscreenchange", function( event ) {
    // a user initiated non-voice full screen change -- take off our special fullscreen
    console.log(`rnh-cs removing fullscreen ${document.webkitIsFullScreen}`);
    toggleFullScreen(false);
});



