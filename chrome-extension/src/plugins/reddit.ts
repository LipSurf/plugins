// ==UserVoiceScript==
declare var PluginUtil: IPluginUtil;

var common = function() {
    return {
        $lastExpanded: null,
        COMMENTS_REGX: /reddit.com\/r\/[^\/]*\/comments\//,
        opened: null,
        thingAtIndex: function(i) {
            return `#siteTable>div.thing:not(.promoted):not(.linkflair-modpost):not(.stickied):eq(${i - 1})`;
        },
        toggleFullScreen: function(on) {
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
    };
};

var RedditPluginCommon = common();

var plugin = {
    name: 'Reddit',
    description: 'Commands for Reddit.com',
    version: '1.0.0',
    match: /https?:\/\/www.reddit.com\/.*/,

    // less common -> common
    homophones: {
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
        'navigate': 'go',
        'pretty': 'preview',
        'contract': 'collapse',
        'expanse': 'expand',
        'xpand': 'expand',
        'spend': 'expand',
        'read it': 'reddit',
        'shrink': 'collapse',
        'on fullscreen': 'unfull screen',
        'on full screen': 'unfull screen',
        'unfor screen': 'unfull screen',
        'unfold screen': 'unfull screen',
    },

    commands: [{
        name: "Collapse",
        description: "Collapse an expanded preview (or comment if viewing comments). Defaults to top-most in the view port.",
        match: ["collapse #", "close", "close preview", "collapse"],
        runOnPage: function(index) {
            if (index) {
                $(`.thing.comment:not(.collapsed):not(.child div):first a.expand:eq(${index - 1})`)[0].click();
            } else {
                // collapse first visible item (can be comment or post)
                $(`#siteTable>.thing .expando-button:not(.collapsed), .commentarea .thing:not(.collapsed):not(.child div) a.expand:first`).each(function(i) {
                    var $ele = $(this);
                    if (PluginUtil.isInView($ele)) {
                        $ele[0].click();
                        return;
                    }
                });
            }
        },
        test: async function() {
            var tierTwoComment, commentUnderTest;
            await this.loadPage('https://www.reddit.com/r/IAmA/comments/z1c9z/i_am_barack_obama_president_of_the_united_states/');
            await this.driver.wait(this.until.elementIsVisible(this.driver.findElement(this.By.css('.commentarea'))), 1000);
            await this.driver.executeScript(`$('.commentarea')[0].scrollIntoView();`);
            // make sure it's expanded
            //<div class=" thing id-t1_c60o0iw noncollapsed   comment " id="thing_t1_c60o0iw" onclick="click_thing(this)" data-fullname="t1_c60o0iw" data-type="comment" data-subreddit="IAmA" data-subreddit-fullname="t5_2qzb6" data-author="Biinaryy" data-author-fullname="t2_76bmi"><p class="parent"><a name="c60o0iw"></a></p><div class="midcol unvoted"><div class="arrow up login-required archived access-required" data-event-action="upvote" role="button" aria-label="upvote" tabindex="0"></div><div class="arrow down login-required archived access-required" data-event-action="downvote" role="button" aria-label="downvote" tabindex="0"></div></div><div class="entry unvoted"><p class="tagline"><a href="javascript:void(0)" class="expand" onclick="return togglecomment(this)">[–]</a><a href="https://www.reddit.com/user/Biinaryy" class="author may-blank id-t2_76bmi">Bi

            commentUnderTest = (await this.driver.findElements(this.By.xpath("//div[contains(@class, 'noncollapsed')][contains(@class, 'comment')][@data-author='Biinaryy']")))[0];

            // make sure a child element is visible
            tierTwoComment = (await this.driver.findElements(this.By.xpath("//p[contains(text(), 'HE KNOWS')]")))[0];
            this.assert.true((await tierTwoComment.isDisplayed()));
            await this.say();
            // check that the child comment is no longer visible
            await this.driver.wait(async () => {
                return ~((await commentUnderTest.getAttribute('class')).indexOf(' collapsed')) && !(await tierTwoComment.isDisplayed());
            }, 1000);
        }
    }, {
        name: 'Expand All Comments',
        description: "Expands all the comments.",
        match: "expand all",
        runOnPage: function() {
            $('.thing.comment.collapsed a.expand').each(function() {
                this.click();
            });
        },
        test: async function() {
            // Only checks to see that more than 5 comments are collapsed.
            let previousCollapsed;
            await this.loadPage('https://www.reddit.com/r/OldSchoolCool/comments/2uak5a/arnold_schwarzenegger_flexing_for_two_old_ladies/co6nw85/');
            // first let's make sure there's some collapsed items
            this.driver.wait(this.until.elementIsVisible(this.driver.findElement(this.By.css('.thing.comment.collapsed'))), 2000);

            previousCollapsed = (await this.driver.findElements(this.By.css('.thing.comment.collapsed'))).length;
            await this.say();

            // no collapsed comments remain
            await this.driver.wait(async () => {
                // test that at least 5 comments have been expanded
                return (await this.driver.findElements(this.By.css('.thing.comment.collapsed'))).length < previousCollapsed - 5;
            }, 1000);
        }
    }, {
        name: 'Expand',
        description: "Expand a preview of a post, or a comment.",
        match: ["preview #", "expand #", "preview", "expand"], // in comments view
        delay: 600,
        runOnPage: function(i) {
            let index = typeof i !== 'undefined' ? Number(i) : 1;
            if (!isNaN(index)) {
                let $ele = $(RedditPluginCommon.thingAtIndex(index) + ' .expando-button');
                try {
                    // close previously open ones
                    RedditPluginCommon.opened.click();
                } catch (e) {}
                RedditPluginCommon.opened = $ele;
                $ele.click();
                PluginUtil.scrollToAnimated($ele);
            } else {
                // if expando-button is in frame expand that, otherwise expand last (furthest down) visible comment
                let mainItem = $(`#siteTable>.thing .expando-button.collapsed:first`);
                let commentItems = $(`.commentarea .thing.collapsed:not(.child div)`).get();

                if (mainItem.length > 0 && PluginUtil.isInView(mainItem)) {
                    mainItem[0].click();
                } else {
                    for (let ele of commentItems.reverse()) {
                        let $ele = $(ele);
                        if (PluginUtil.isInView($ele)) {
                            PluginUtil.scrollToAnimated($ele);
                            $ele.find('a.expand:first')[0].click();
                            return;
                        }
                    }
                }
            }
        }
    }, {
        name: 'Go to Subreddit',
        match: function(input) {
            const SUBREDDIT_REGX = /^(?:go to |show )?(?:are|our|r) (.*)/;
            let match = input.match(SUBREDDIT_REGX);
            // console.log(`navigate subreddit input: ${input} match: ${match}`);
            if (match) {
                return [match[1].replace(/\s/g, "")];
            }
        },
        delay: 1200,
        nice: function(match) {
            return `go to r/${match}`;
        },
        runOnPage: function(subredditName) {
            window.location.href = `https://www.reddit.com/r/${subredditName}`;
        }
    }, {
        name: 'Go to Reddit',
        match: ["home", "reddit", "reddit.com"],
        runOnPage: function() {
            document.location.href = "https://www.reddit.com";
        },
    }, {
        name: 'Clear Vote',
        description: "Unsets the last vote so it's neither up or down.",
        match: ["clear vote #", "clear vote"],
        runOnPage: function(i) {

        },
    }, {
        name: 'Downvote',
        match: ["downvote #", "downvote"],
        runOnPage: function(i) {
            let index = typeof i !== 'undefined' ? Number(i) : 1;
            index = isNaN(index) ? 1 : index;
            $(RedditPluginCommon.thingAtIndex(index) + ' .arrow.down:not(.downmod)')[0].click();
        },
    }, {
        name: 'Upvote',
        match: ["upvote #", "upvote"],
        runOnPage: function(i) {
            let index = typeof i !== 'undefined' ? Number(i) : 1;
            index = isNaN(index) ? 1 : index;
            $(RedditPluginCommon.thingAtIndex(i) + ' .arrow.up:not(.upmod)')[0].click();
        },
    }, {
        name: 'Fullscreen Video',
        match: ["fullscreen", "full screen"],
        runOnPage: function() {
            let $ele = RedditPluginCommon.$lastExpanded.closest('*[data-url]');
            let videoUrl = $ele.data('url');
            let redditId = $ele.data('fullname').split('_')[1];
            let $iframe = $ele.find('iframe');
            $iframe.toggleClass('nhm-full-screen', true);
            RedditPluginCommon.toggleFullScreen(true);
            console.log(`video url ${videoUrl}. Reddit id ${redditId}`);
            PluginUtil.sendMsgToBeacon({
                fullScreen: {
                    redditId: redditId,
                    videoUrl: videoUrl
                }
            });
        },
    }, {
        name: 'Unfullscreen Video',
        match: ["unfullscreen", "unfull screen", "no full screen"],
        runOnPage: function() {
            RedditPluginCommon.toggleFullScreen(false);
            PluginUtil.sendMsgToBeacon({
                unFullScreen: null
            });
        },
    },  {
        name: 'View Comments',
        description: "View the comments of a reddit post.",
        match: ["comments #", "view comments #"],
        runOnPage: function(i) {
            $(RedditPluginCommon.thingAtIndex(i) + ' a.comments')[0].click();
        },
    }, {
        name: 'Visit Post',
        description: "Equivalent of clicking a reddit post.",
        match: ['click #', 'click', 'visit'],
        runOnPage: function(i) {
            // if we're on the post
            if (RedditPluginCommon.COMMENTS_REGX.test(window.location.href)) {
                $('#siteTable p.title a.title:first')[0].click();
            } else {
                $(RedditPluginCommon.thingAtIndex(i) + ' a.title')[0].click();
            }
        },
    }],
};

export var Plugin: IPlugin = { common, plugin };
