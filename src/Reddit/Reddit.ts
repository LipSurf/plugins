/*
 * LipSurf plugin for Reddit.com
 */
/// <reference path="../@types/plugin-interface.d.ts"/>
import { PluginBase } from '../PluginBase';

export module RedditPlugin {
    interface IRedditPlugin extends IPlugin {
        getThingAttr: () => string;
        getCommentsRegX: () => RegExp;
        thingAtIndex: (number) => string;
    }

    export let Plugin: IRedditPlugin = Object.assign({}, PluginBase, {
        niceName: 'Reddit',
        description: 'Commands for Reddit.com',
        version: '1.0.0',
        apiVersion: '1',
        match: /^https?:\/\/.*\.reddit.com/,
        authors: "Miko",

        // "private"
        // TODO: (low priority) how can we make the fact that these need to be functions better
        getThingAttr: () => `${PluginBase.util.getNoCollisionUniqueAttr()}-thing`,
        getCommentsRegX: () => /reddit.com\/r\/[^\/]*\/comments\//,
        thingAtIndex: (i:number) => {
            return `#siteTable>div.thing[${Plugin.getThingAttr()}="${i}"]`;
        },

        // runs when page loads
        init: () => {
            if (/^https?:\/\/www.reddit/.test(document.location.href)) {
                document.location.href = document.location.href.replace(/^https?:\/\/.*\.reddit.com/,  'http://old.reddit.com');
            }
            $(document).ready(() => {
                $('#siteTable>div.thing').each((i, ele) => {
                    let index = i + 1;
                    $(ele).attr(Plugin.getThingAttr(), index);
                    // can't use .style because jquery doesn't understand !important
                    $(ele).find('.rank').attr('style', `
                        display: block !important;
                        margin-right: 10px;
                        opacity: 1 !important';
                    `).text('' + index);
                });
            });
        },

        // less common -> common
        homophones: {
            'navigate': 'go',
            'contract': 'collapse',
            'claps': 'collapse',
            'expense': 'expand',
            'expanse': 'expand',
            'expanded': 'expand',
            'stand': 'expand',
            'xpand': 'expand',
            'xmen': 'expand',
            'spend': 'expand',
            'span': 'expand',
            'spell': 'expand',
            'spent': 'expand',
            'reddit dot com': 'reddit',
            'read it': 'reddit',
            'shrink': 'collapse',
        },

        commands: [
            {
                name: 'View Comments',
                description: "View the comments of a reddit post.",
                match: ["comments #", "view comments #"],
                pageFn: async (transcript:string, i:number) => {
                    $(Plugin.thingAtIndex(i) + ' a.comments')[0].click();
                },
            }, {
                name: 'Visit Post',
                description: "Equivalent of clicking a reddit post.",
                match: ['click #', 'click', 'visit #', 'visit'],
                pageFn: async (transcript:string, i:number) => {
                    // if we're on the post
                    if (Plugin.getCommentsRegX().test(window.location.href)) {
                        $('#siteTable p.title a.title:first')[0].click();
                    } else {
                        $(Plugin.thingAtIndex(i) + ' a.title')[0].click();
                    }
                },
            },
            {
                name: 'Expand',
                description: "Expand a preview of a post, or a comment by it's position (rank).",
                match: ["expand #", "# expand", 'expand'], // in comments view
                pageFn: async (transcript:string, i:number) => {
                    if (typeof i !== 'undefined') {
                        let $ele = $(Plugin.thingAtIndex(i) + ' .expando-button.collapsed');
                        $ele.click();
                        PluginBase.util.scrollToAnimated($ele);
                    } else {
                        // if expando-button is in frame expand that, otherwise expand first (furthest up) visible comment
                        let mainItem = $(`#siteTable .thing .expando-button.collapsed:first`);
                        let commentItems = $(`.commentarea .thing.collapsed:not(.child div)`).get();

                        if (mainItem.length > 0 && PluginBase.util.isInView(mainItem)) {
                            mainItem[0].click();
                        } else {
                            for (let ele of commentItems.reverse()) {
                                let $ele = $(ele);
                                if (PluginBase.util.isInView($ele)) {
                                    $ele.find('a.expand:contains([+]):first')[0].click();
                                    return;
                                }
                            }
                        }
                    }
                }
            },
            {
            name: "Collapse",
            description: "Collapse an expanded preview (or comment if viewing comments). Defaults to top-most in the view port.",
            match: ["collapse #", "close", "collapse"],
            pageFn: async (transcript:string, i:number) => {
                let index = (i === null || isNaN(Number(i))) ? null : Number(i);
                if (index !== null) {
                    let $ele = $(Plugin.thingAtIndex(index) + ' .expando-button:not(.collapsed)');
                    $ele.click();
                } else {
                    // collapse first visible item (can be comment or post)
                    $(`#siteTable>.thing .expando-button:not(.collapsed), .commentarea>div>div.thing:not(.collapsed)>div>p>a.expand`).each(function(i) {
                        var $ele = $(this);
                        if (PluginBase.util.isInView($ele)) {
                            $ele[0].click();
                            return false;
                        }
                    });
                }
            },
            test: async function() {
                var tierTwoComment, commentUnderTest;
                await this.loadPage('https://old.reddit.com/r/IAmA/comments/z1c9z/i_am_barack_obama_president_of_the_united_states/');
                await this.driver.wait(this.until.elementIsVisible(this.driver.findElement(this.By.css('.commentarea'))), 1000);
                await this.driver.executeScript(`$('.commentarea')[0].scrollIntoView();`);
                // make sure it's expanded
                //<div class=" thing id-t1_c60o0iw noncollapsed   comment " id="thing_t1_c60o0iw" onclick="click_thing(this)" data-fullname="t1_c60o0iw" data-type="comment" data-subreddit="IAmA" data-subreddit-fullname="t5_2qzb6" data-author="Biinaryy" data-author-fullname="t2_76bmi"><p class="parent"><a name="c60o0iw"></a></p><div class="midcol unvoted"><div class="arrow up login-required archived access-required" data-event-action="upvote" role="button" aria-label="upvote" tabindex="0"></div><div class="arrow down login-required archived access-required" data-event-action="downvote" role="button" aria-label="downvote" tabindex="0"></div></div><div class="entry unvoted"><p class="tagline"><a href="javascript:void(0)" class="expand" onclick="return togglecomment(this)">[–]</a><a href="https://old.reddit.com/user/Biinaryy" class="author may-blank id-t2_76bmi">Bi

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
            name: 'Go to Subreddit',
            match: {
                fn: (input: string) => {
                    const SUBREDDIT_REGX = /^(?:go to |show )?(?:are|our|r) (.*)/;
                    let match = input.match(SUBREDDIT_REGX);
                    // console.log(`navigate subreddit input: ${input} match: ${match}`);
                    if (match) {
                        return match[1].replace(/\s/g, "");
                    }
                },
                description: 'go to/show r [subreddit name] (do not say slash)',
            },
            delay: 1200,
            nice: (transcript: string, matchOutput: string) => {
                return `go to r/${matchOutput}`;
            },
            pageFn: async (transcript:string, subredditName:string) => {
                window.location.href = `https://old.reddit.com/r/${subredditName}`;
            }
        }, {
            name: 'Go to Reddit',
            global: true,
            match: ["reddit", "go to reddit"],
            pageFn: async () => {
                document.location.href = "https://old.reddit.com";
            },
        }, {
            name: 'Clear Vote',
            description: "Unsets the last vote so it's neither up or down.",
            match: ["clear vote #", "reset vote #", "clear vote", "reset vote"],
            pageFn: async (transcript:string, i:number) => {
                let index = (i === null || isNaN(Number(i))) ? 1 : Number(i);
                $(`${Plugin.thingAtIndex(index)} .arrow.downmod,${Plugin.thingAtIndex(index)} .arrow.upmod`)[0].click();
            },
        }, {
            name: 'Downvote',
            match: ["downvote #", "downvote"],
            description: "Downvote the current post or a post # (doesn't work for comments yet)",
            pageFn: async (transcript:string, i:number) => {
                let index = (i === null || isNaN(Number(i))) ? 1 : Number(i);
                $(`${Plugin.thingAtIndex(index)} .arrow.down:not(.downmod)`)[0].click();
            },
        }, {
            name: 'Upvote',
            match: ["upvote #", "upvote"],
            description: "Upvote the current post or a post # (doesn't work for comments yet)",
            pageFn: async (transcript:string, i:number) => {
                let index = (i === null || isNaN(Number(i))) ? 1 : Number(i);
                $(`${Plugin.thingAtIndex(index)} .arrow.up:not(.upmod)`)[0].click();
            },
        }, {
            name: 'Expand All Comments',
            description: "Expands all the comments.",
            match: ["expand all", "expand all comments"],
            pageFn: async () => {
                $('.thing.comment.collapsed a.expand').each(function() {
                    this.click();
                });
            },
            test: async function() {
                // Only checks to see that more than 5 comments are collapsed.
                let previousCollapsed;
                await this.loadPage('https://old.reddit.com/r/OldSchoolCool/comments/2uak5a/arnold_schwarzenegger_flexing_for_two_old_ladies/co6nw85/');
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
        }],
    });
}
