// ==UserVoiceScript==
// less common -> common
const HOMOPHONES = {
    'download': 'downvote',
    'down vote': 'downvote',
    'up vote': 'upvote',
    'upload': 'upvote',
    'about': 'upvote',
    'i thought': 'upvote',
    'a phone': 'upvote',
    'comet': 'comments',
    'comets': 'comments',
    'comment': 'comments',
    ',': 'comments',
    'common': 'comments',
    'commons': 'comments',
    'quick': 'click',
    'full-screen': 'fullscreen',
    'paws': 'pause',
    'navigate': 'go',
    'contract': 'collapse',
    'shrink': 'collapse',
	'on fullscreen': 'unfull screen',
	'on full screen': 'unfull screen',
	'unfor screen': 'unfull screen',
	'unfold screen': 'unfull screen',
};
const COMMENTS_REGX = /reddit.com\/r\/[^\/]*\/comments\//;
const SUBREDDIT_REGX = /^(?:go to |show )?(?:are|our|r) (.*)/;


function thingAtIndex(i) {
	return `#siteTable>div.thing:not(.promoted):not(.linkflair-modpost):not(.stickied):eq(${i - 1})`;
}
// do we need this
var opened;


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

var commands = [
	{
		name: "Collapse",
		description: "Collapse an expanded preview (or comment if viewing comments). Defaults to top-most in the view port.",
		match: ["close", "close preview", "collapse #", "collapse"],
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
	},
	{
		name: 'Expand All Comments',
		description: "Expands all the comments.",
		match: "expand all",
        runOnPage: function() {
            for (let $ele of $('.thing.comment.collapsed:not(.child div) a.expand')) {
                $ele.click();
            }
        }
	},
	{
		name: 'Expand',
		description: "Expand a preview of a post, or a comment.",
		match: ["preview #", "expand #", "preview", "expand"],  // in comments view
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
	},
	{
		name: 'Go to Subreddit',
		match: function(input) {
			let match = input.match(SUBREDDIT_REGX);
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
	},
	{
		name: 'Go to Reddit',
		match: ["home", "reddit", "reddit.com", "read it"],
		runOnPage: function() {
			document.location.href = "https://www.reddit.com";
		},
	},
	{
		name: 'Clear Vote',
		description: "Unsets the last vote so it's neither up or down.",
		match: ["clear vote #", "clear vote"],
		runOnPage: function(i) {

		},
	},
	{
		name: 'Downvote',
		match: ["downvote #", "downvote"],
		runOnPage: function(i) {
		    let index = typeof i !== 'undefined' ? Number(i) : 1;
		    index = isNaN(index) ? 1 : index;
            $(thingAtIndex(index) + ' .arrow.down:not(.downmod)')[0].click();
		},
	},
	{
		name: 'Upvote',
		match: ["upvote #", "upvote"],
		runOnPage: function(i) {
            let index = typeof i !== 'undefined' ? Number(i) : 1;
            index = isNaN(index) ? 1 : index;
            $(thingAtIndex(i) + ' .arrow.up:not(.upmod)')[0].click();
		},
	},
	{
		name: 'Fullscreen Video',
		match: ["fullscreen", "full screen"],
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
	},
	{
		name: 'Unfullscreen Video',
		match: ["unfullscreen", "unfull screen", "no full screen"],
        runOnPage: function() {
            toggleFullScreen(false);
            sendMsgToBeacon({unFullScreen: null});
        },
	},
	{
		name: 'Pause Video',
		match: ["pause", "pause video"],
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
	},
	{
		name: 'Play Video',
		match: ['play #', 'play'],
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
	},
	{
		name: 'Resume Video',
		description: "Continue playing a video that has already started.",
		// Works with any video that may have started, even with the mouse
		match: "resume",
        runOnPage: function(i) {
            let videoUrl = $('.thing .expando-button.expanded').closest('*[data-url]').data('url');
            console.log(`video url ${videoUrl}`);
            // send it a few times
            sendMsgToBeacon({playVideo: videoUrl});
        },
	},
	{
		name: 'View Comments',
		description: "View the comments of a reddit post.",
		match: ["comments #", "view comments #"],
		runOnPage: function(i) {
			$(thingAtIndex(i) + ' a.comments')[0].click();
		},
	},
	{
		name: 'Visit Post',
		description: "Equivalent of clicking a reddit post.",
		match: ['click #', 'click', 'visit'],
		runOnPage: function(i) {
		    // if we're on the post
			if (COMMENTS_REGX.test(window.location.href)) {
	            $('#siteTable p.title a.title:first')[0].click();
			} else {
	            $(thingAtIndex(i) + ' a.title')[0].click();
			}
		},
	}
];

return {
	name: 'Reddit',
	description: 'Commands for Reddit.com',
	version: '1.0.0',
	commands: commands,
	homophones: HOMOPHONES,
};