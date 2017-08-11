// ==UserVoiceScript==
// @name
// @description
// @version
// ==/UserVoiceScript==
var commands = {
	'Collapse': (function() {
		return {
			regx: /^(?:collapse)$/,
			ordinalMatch: ["close", "close preview", "collapse"],
			runOnPage: function(i) {
                let index = typeof i !== 'undefined' ? Number(i) : 1;
                if (!isNaN(index)) {
                    $(`.thing.comment:not(.collapsed):not(.child div):first a.expand:eq(${index - 1})`)[0].click();
                } else {
                    // collapse first visible item (can be comment or post)
                    let $items = $(`#siteTable>.thing .expando-button:not(.collapsed), .commentarea .thing:not(.collapsed):not(.child div) a.expand:first`).each(function(i) {
                        var $ele = $(this);
                        if (isInView($ele)) {
                            $ele[0].click();
                            return;
                        }
					});
				}
			}
		};
	})(),
	'CommentsExpandAll': (function() {
		return {
			regx: /^(?:expand all)$/,
            runOnPage: function() {
                for (let $ele of $('.thing.comment.collapsed:not(.child div) a.expand')) {
                    $ele.click();
                }
            }
		};
	})(),
	'Expand': (function() {
		// expand previews or comments
		var opened;
		return {
			regx: /^(?:preview|expand)$/,  // in comments view
			ordinalMatch: ["preview", "expand"],   // in subreddit view
            runOnPage: function(i) {
                let index = typeof i !== 'undefined' ? Number(i) : 1;
            	if (!isNaN(index)) {
                    let $ele = $(thingAtIndex(index) + ' .expando-button');
                    try {
                        // close
                        opened.click();
                    } catch (e) {}
                    opened = $ele;
                    $ele.click();
                    scrollTo($ele);
				} else {
            	    // if expando-button is in frame expand that, otherwise expand last (furthest down) visible comment
					let mainItem = $(`#siteTable>.thing .expando-button.collapsed:first`);
				    let commentItems = $(`.commentarea .thing.collapsed:not(.child div)`).get();

				    if (mainItem.length > 0 && isInView(mainItem)) {
				    	mainItem[0].click();
					} else {
                        for (let ele of commentItems.reverse()) {
                            let $ele = $(ele);
                            if (isInView($ele)) {
                                scrollTo($ele);
                                $ele.find('a.expand:first')[0].click();
                                return;
                            }
                        }
                    }
				}
            }
		};
	})(),
	'HelpClose': (function() {
		return {
			regx: /^(close help|help close|closeout|close up)$/,
			nice: 'close help',
            runOnPage: function() {
            	helpBoxOpen = false;
                $helpBox.hide();
            }
		};
	})(),
	'HelpOpen': (function() {
		return {
			regx: /^(help|open help|help open|commands)$/,
            runOnPage: function() {
                if (!$.contains(document.body, $helpBox)) {
                    $helpBox = attachOverlay('help-box');
                }
                helpBoxOpen = true;
                $helpBox.show();
            }
		};
	})(),
	'NavigateBackward': (function() {
		return {
			regx: /^(?:back|go back)$/,
			runOnPage: function() {
				window.history.back();
			}
		};
	})(),
	'NavigateForward': (function() {
		return {
			regx: /^(?:forward|ford|go forward)$/,
			runOnPage: function() {
				window.history.forward();
			}
		};
	})(),
	'NavigateToSubreddit': (function() {
		var REGX = /^(?:go to |show )?(?:are|our|r) (.*)/;
		console.log("BUILDING");
		return {
			matches: function(input) {
				let match = input.match(REGX);
				console.log(`navigate subreddit input: ${input} match: ${match}`);
				if (match) {
					return match[1].replace(/\s/g, "");
				}
			},
			delay: 1200,
			nice: function(match) {
				return `go to r/${match}`;
			},
			runOnPage: function(subreddit_name) {
				window.location.href = `https://www.reddit.com/r/${subreddit_name}`;
			}
		};
	})(),
	'Reddit': (function() {
		return {
			regx: /^(home|reddit|reddit.com|read it)$/,
			runOnPage: function() {
				document.location.href = "https://www.reddit.com";
			},
		};
	})(),
	'Refresh': (function() {
		return {
			regx: /^refresh$/,
			runOnPage: function() {
				location.reload();
			}
		};
	})(),
	'ScrollBottom': (function() {
		return {
			regx: /^(bottom|bottom of page|bottom of the page|scroll bottom|scroll to bottom|scroll to the bottom of page|scroll to the bottom of the page)$/,
			runOnPage: function() {
				console.log("SCROLL BOTTOM");
				$('html, body').animate({ scrollTop:  document.body.scrollHeight });
			},
		};
	})(),
	'ScrollDownLittle': (function() {
		return {
			regx: /^(little down|little scroll down|scroll little down|down little)$/,
			runOnPage: function() {
				$('html, body').animate({ scrollTop:  window.scrollY + SCROLL_DISTANCE/2 });
			},
		};
	})(),
	'ScrollDown': (function() {
		return {
			regx: [/^down$/, /^scroll down$/],
			delay: [300, 0],
			runOnPage: function() {
				$('html, body').animate({ scrollTop:  window.scrollY + SCROLL_DISTANCE });
			},
		};
	})(),
	'ScrollTop': (function() {
		return {
			regx: /^(top|top of page|scrolltop|top of the page|scroll top|scroll to top|scroll to the top of page|scroll to the top of the page)$/,
			runOnPage: function() {
				$('html, body').animate({ scrollTop:  0 });
			},
		};
	})(),
	'ScrollUpLittle': (function() {
		return {
			regx: /^(little up|little scroll up|scroll little up|up little)$/,
			runOnPage: function() {
				$('html, body').animate({ scrollTop:  window.scrollY - SCROLL_DISTANCE/2 });
			},
		};
	})(),
	'ScrollUp': (function() {
		return {
			regx: [/^up$/, /^scroll up$/],
			delay: [300, 0],
			runOnPage: function() {
				$('html, body').animate({ scrollTop:  window.scrollY - SCROLL_DISTANCE });
			},
		};
	})(),
	'Stop': (function() {
		return {
			regx: /^stop$/,
			runOnPage: function() {
				window.stop();
			}
		};
	})(),
	'TabClose': (function() {
		return {
			regx: /^close tab$/,
			run: function() {
				queryActiveTab(function(tab) {
					chrome.tabs.remove(tab.id);
				});
			}
		};
	})(),
	'TabNext': (function() {
		return {
			regx: /^(?:next tab|next time)$/,
			run: function() {
				chrome.tabs.query({currentWindow: true}, function(tabs) {
					let curIndex;
					let maxIndex = tabs.length - 1;
					for (let tab of tabs) {
						if (tab.active) {
							curIndex = tab.index;
							break;
						}
					}
					console.log(`maxIndex: ${maxIndex} curIndex: ${curIndex}`);
					for (let tab of tabs) {
						if (tab.index === (curIndex >= maxIndex ? 0 : curIndex + 1)) {
							chrome.tabs.update(tab.id, {active: true});
							console.log(`found next index! ${tab.index}`);
							break;
						}
					}
				});
			}
		};
	})(),
	'TabNew': (function() {
		return {
			regx: /^(?:new tab|open tab|newtown)$/,
			run: function() {
				chrome.tabs.create({active: true});
			}
		};
	})(),
	'TabPrevious': (function() {
		return {
			regx: /^(?:previous tab)$/,
			run: function() {
				chrome.tabs.query({currentWindow: true}, function(tabs) {
					let curIndex;
					let maxIndex = tabs.length - 1;
					for (let tab of tabs) {
						if (tab.active) {
							curIndex = tab.index;
							break;
						}
					}
					console.log(`maxIndex: ${maxIndex} curIndex: ${curIndex}`);
					for (let tab of tabs) {
						if (tab.index === (curIndex <= 0 ? maxIndex : curIndex - 1)) {
							chrome.tabs.update(tab.id, {active: true});
							console.log(`found prev index! ${tab.index}`);
							break;
						}
					}
				});
			}
		};
	})(),
	'TabSelect': (function() {
		return {
			ordinalMatch: ['tab', 'time'],
			run: function(i) {
				chrome.tabs.query({index: i - 1, currentWindow: true}, function(tabs) {
					chrome.tabs.update(tabs[0].id, {active: true});
				});
			}
		}
	})(),
	'VoteClear': (function() {
		return {
			ordinalMatch: ['clear vote',],
			regx: /^(?:clear vote)$/,
    		runOnPage: function(i) {

			},
		};
	})(),
	'VoteDown': (function() {
		return {
			ordinalMatch: ['downvote', 'download'],
			regx: /^(?:downvote|download)$/,
			nice: function(i) {
				return `downvote ${i}`;
			},
			runOnPage: function(i) {
			    let index = typeof i !== 'undefined' ? Number(i) : 1;
			    index = isNaN(index) ? 1 : index;
                $(thingAtIndex(index) + ' .arrow.down:not(.downmod)')[0].click();
			},
		};
	})(),
	'VoteUp': (function() {
		return {
			ordinalMatch: ['upvote', 'upload', 'about', 'i thought'],
			regx: /^(?:upvote|upload|about|i thought|a phone)$/,
			nice: function(i) {
				return `upvote ${i}`;
			},
			runOnPage: function(i) {
                let index = typeof i !== 'undefined' ? Number(i) : 1;
                index = isNaN(index) ? 1 : index;
                $(thingAtIndex(i) + ' .arrow.up:not(.upmod)')[0].click();
			},
		};
	})(),
	'VideoFullScreen': (function() {
		return {
			regx: /^(?:fullscreen|full screen)$/,
            runOnPage: function() {
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
			regx: /^(?:unfullscreen|unfull screen|on fullscreen|on full screen|unfor screen|unfold screen|no full screen)$/,
            runOnPage: function() {
                toggleFullScreen(false);
                sendMsgToBeacon({unFullScreen: null});
            },
		};
	})(),
	'VideoPause': (function() {
		return {
			regx: /^(pause|pause video)$/,
            runOnPage: function() {
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
	'VideoPlay': (function() {
		return {
			ordinalMatch: ['play'],
			runOnPage: function(i) {
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
			regx: /^(resume)$/,
            runOnPage: function(i) {
                let videoUrl = $('.thing .expando-button.expanded').closest('*[data-url]').data('url');
                console.log(`video url ${videoUrl}`);
                // send it a few times
                sendMsgToBeacon({playVideo: videoUrl});
            },
		};
	})(),
	'ViewComments': (function() {
		return {
			ordinalMatch: ["comments", "view comments", "commons", "comets"],
			runOnPage: function(i) {
				$(thingAtIndex(i) + ' a.comments')[0].click();
			},
		};
	})(),
	'VisitPost': (function() {
		return {
			ordinalMatch: ['click', 'quick'],
			nice: 'click',
			runOnPage: function(i) {
			    // if we're on the post
				if (COMMENTS_REGX.test(window.location.href)) {
                    $('#siteTable p.title a.title:first')[0].click();
				} else {
                    $(thingAtIndex(i) + ' a.title')[0].click();
				}
			},
		};
	})(),
};

return {
	commands: commands
};
