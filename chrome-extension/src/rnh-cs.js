var on = false;
const LABEL_FADE_TIME = 2000;
const SCROLL_DISTANCE = 550;
const SCROLL_TIME = 450;
var $previewCmdBox;
var $helpBox;
var lblTimeout;
var COMMENTS_REGX = /reddit.com\/r\/[^\/]*\/comments\//;
var helpBoxOpen = false;
// used to determine which video to fullscreen
var $lastExpanded;


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


function toggleFullScreen(on) {
    // let $ele = $lastExpanded.closest('*[data-url]');
    // let $iframe = $ele.find('iframe');
    // $iframe.toggleClass('nhm-full-screen', false);
	if (on) {
        $('#header').hide();
        $('.side').hide();
        $(document.body).css('overflow', 'hidden');
	} else {
        $('#header').show();
        $('.side').show();
        $(document.body).css('overflow', 'visible');
        $('iframe.nhm-full-screen').toggleClass('nhm-full-screen', false);
	}
}

function thingAtIndex(i) {
	return `#siteTable>div.thing:not(.promoted):not(.linkflair-modpost):not(.stickied):eq(${i - 1})`;
}


function sendMsgToBeacon(msg) {
    retrialAndError(() => {
    	console.log(`send msg to beacon msg: ${JSON.stringify(msg)}`)
        chrome.runtime.sendMessage({bubbleDown: msg}, function (response) {
            console.log("orig sender received response " + response);
            if (response) {
                console.log("RECEIVED response!");
            }
        });
	}, null, 2000, 2);
}


var COMMANDS = {
	'ClosePreview': (function() {
		return {
			run: function(i) {
			}
		};
	})(),
	'Collapse': (function() {
		return {
			run: function(i) {
			    if (COMMENTS_REGX.test(window.location.href)) {
			    	let index = typeof i !== 'undefined' ? i + 1 : 1;
                    $(`.thing.comment:not(.collapsed):not(.child div):first a.expand:eq(${index - 1})`)[0].click();
                } else {
			    	if (i) {
                        // assume we're in posts
                        try {
                            // close
                            opened.click();
                        } catch (e) {
                        }
                        opened = $(thingAtIndex(i) + ' .expando-button.expanded').click();
                    }
				}
			}
		};
	})(),
    'CommentsExpand': (function() {
        return {
            run: function() {
            	let $ele = $('.thing.comment.collapsed:not(.child div):last a.expand:first')[0];
                $ele.click();
                // scrollTo($ele);
            }
        };
    })(),
    'CommentsExpandAll': (function() {
        return {
            run: function() {
                for (let $ele of $('.thing.comment.collapsed:not(.child div) a.expand')) {
                    $ele.click();
                }
            }
        };
    })(),
	'ExpandPreview': (function() {
		var opened;
		return {
			run: function(i) {
				let $ele = $(thingAtIndex(i) + ' .expando-button');
				try {
					// close
					opened.click();
				} catch (e) {}
				opened = $ele;
				$ele.click();
				scrollTo($ele);
			}
		};
	})(),
    'HelpOpen': (function() {
        return {
            run: function() {
                if (!$.contains(document.body, $helpBox)) {
                    $helpBox = attachOverlay('help-box');
                }
                helpBoxOpen = true;
                $helpBox.show();
            }
        };
    })(),
    'HelpClose': (function() {
        return {
			nice: 'close help',
            run: function() {
            	helpBoxOpen = false;
                $helpBox.hide();
            }
        };
    })(),
	'NavigateBackward': (function() {
		return {
			run: function() {
				window.history.back();
			}
		};
	})(),
	'NavigateForward': (function() {
		return {
			run: function() {
				window.history.forward();
			}
		};
	})(),
	'NavigateToSubreddit': (function() {
		return {
			run: function(subreddit_name) {
				window.location.href = `https://www.reddit.com/r/${subreddit_name}`;
			}
		};
	})(),
    'VideoFullScreen': (function() {
    	// if the user exits the full screen manually, we need to handle
        // cleanup here
        return {
            run: function() {
                let $ele = $lastExpanded.closest('*[data-url]');
                let videoUrl = $ele.data('url');
                let redditId = $ele.data('fullname').split('_')[1];
                let $iframe = $ele.find('iframe');
                $iframe.toggleClass('nhm-full-screen', true);
                toggleFullScreen(true);
                console.log(`video url ${videoUrl}. Reddit id ${redditId}`);
                sendMsgToBeacon({fullScreen: {redditId: redditId, videoUrl: videoUrl }});
            },
        };
    })(),
    'VideoUnFullScreen': (function() {
        return {
            run: function() {
                toggleFullScreen(false);
                sendMsgToBeacon({unFullScreen: null});
            },
        };
    })(),
	'VideoPause': (function() {
		return {
			nice: 'pause',
			run: function(i) {
			    // TODO: find the one that's playing
                let videoUrl = $('.thing .expando-button.expanded').closest('*[data-url]').data('url');
                console.log(`video url ${videoUrl}`);

                sendMsgToBeacon({pauseVideo: videoUrl});
			},
		};
	})(),
	'VideoPlay': (function() {
		return {
			run: function(i) {
				// get the unique video url
				let videoUrl;
				let $ele = $(thingAtIndex(i) + ' .expando-button.collapsed');
				$ele.click();
				videoUrl = $(thingAtIndex(i)).data('url');
				console.log(`video url ${videoUrl}`);

                sendMsgToBeacon({playVideo: videoUrl});
                scrollTo($ele);
			},
		};
	})(),
    'VideoResume': (function() {
    	// Works with any video that may have started, even with the mouse
        return {
            run: function(i) {
                let videoUrl = $('.thing .expando-button.expanded').closest('*[data-url]').data('url');
                console.log(`video url ${videoUrl}`);
                // send it a few times
                sendMsgToBeacon({playVideo: videoUrl});
            },
        };
    })(),
	'Reddit': (function() {
		return {
			run: function() {
				document.location.href = "https://www.reddit.com";
			},
		};
	})(),
	'Refresh': (function() {
		return {
			run: function() {
				location.reload();
			}
		};
	})(),
	'ScrollBottom': (function() {
		return {
			run: function() {
				console.log("SCROLL BOTTOM");
				$('html, body').animate({ scrollTop:  document.body.scrollHeight });
			},
		};
	})(),
	'ScrollTop': (function() {
		return {
			run: function() {
				$('html, body').animate({ scrollTop:  0 });
			},
		};
	})(),
	'ScrollDownLittle': (function() {
		return {
			run: function() {
				$('html, body').animate({ scrollTop:  window.scrollY + SCROLL_DISTANCE/2 });
			},
		};
	})(),
	'ScrollDown': (function() {
		return {
			run: function() {
				$('html, body').animate({ scrollTop:  window.scrollY + SCROLL_DISTANCE });
			},
		};
	})(),
	'ScrollUpLittle': (function() {
		return {
			run: function() {
				$('html, body').animate({ scrollTop:  window.scrollY - SCROLL_DISTANCE/2 });
			},
		};
	})(),
	'ScrollUp': (function() {
		return {
			regx: /^(up|scroll up)$/,
			run: function() {
				$('html, body').animate({ scrollTop:  window.scrollY - SCROLL_DISTANCE });
			},
		};
	})(),
	'Stop': (function() {
		return {
			run: function() {
				window.stop();
			}
		};
	})(),
	'VoteDown': (function() {
		return {
			run: function(i) {
			    let index = typeof i !== 'undefined' ? Number(i) : 1;
			    index = isNaN(index) ? 1 : index;
                $(thingAtIndex(index) + ' .arrow.down:not(.downmod)')[0].click();
			},
		}
	})(),
	'VoteUp': (function() {
		return {
			run: function(i) {
                let index = typeof i !== 'undefined' ? Number(i) : 1;
                index = isNaN(index) ? 1 : index;
                $(thingAtIndex(i) + ' .arrow.up:not(.upmod)')[0].click();
			},
		}
	})(),
    'VoteClear': (function() {
    	return {
    		run: function(i) {

			},
		}
	})(),
	'VisitPost': (function() {
		return {
			run: function(i) {
				$(thingAtIndex(i) + ' a.title')[0].click();
			},
		};
	})(),
	'ViewComments': (function() {
		return {
			run: function(i) {
				$(thingAtIndex(i) + ' a.comments')[0].click();
			},
		};
	})(),
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
    	return document.body.contains($previewCmdBox[0]);
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


function showLiveText({text, isSuccess=false, isUnsure=false, hold=false} = {}) {
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
	$previewCmdLbl.text(text);
	$previewCmdLbl.toggleClass('visible', true);
	lblTimeout = setTimeout(function() {
		$previewCmdLbl.toggleClass('visible', false);
	}, hold ? LABEL_FADE_TIME * 3 : LABEL_FADE_TIME);
}


// TODO: needs tests
chrome.runtime.onMessage.addListener(function(msg) {
	if (typeof msg.cmd !== 'undefined') {
	    if (typeof COMMANDS[msg.cmd.name] !== 'undefined') {
            return COMMANDS[msg.cmd.name].run(msg.cmd.match);
        }
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


