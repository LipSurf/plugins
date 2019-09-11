/*
 * LipSurf plugin for Reddit.com
 */
/// <reference types="lipsurf-plugin-types"/>
declare const PluginBase: IPluginBase;

const thingAttr = `${PluginBase.util.getNoCollisionUniqueAttr()}-thing`;
const COMMENTS_REGX = /reddit.com\/r\/[^\/]*\/comments\//;
function thingAtIndex(i: number) {
    return `#siteTable>div.thing[${thingAttr}="${i}"]`;
}

function clickIfExists(selector: string) {
    const el = document.querySelector<HTMLElement>(selector);
    if (el)
        el.click();
}

export default <IPluginBase & IPlugin> {...PluginBase, ...{
    niceName: 'Reddit',
    description: 'Commands for Reddit.com',
    version: '2.7.0',
    match: /^https?:\/\/.*\.reddit.com/,
    authors: "Miko",

    // runs when page loads
    init: async () => {
        if (/^https?:\/\/www.reddit/.test(document.location.href)) {
            document.location.href = document.location.href.replace(/^https?:\/\/.*\.reddit.com/,  'http://old.reddit.com');
        }
        await PluginBase.util.ready();
        let index = 0;
        for (let el of document.querySelectorAll<HTMLElement>('#siteTable>div.thing')) {
            index++;
            el.setAttribute(thingAttr, '' + index);
            const rank = <HTMLElement>el.querySelector('.rank');
            rank.setAttribute('style', `
                display: block !important;
                margin-right: 10px;
                opacity: 1 !important';
            `);
            rank.innerText = '' + index;
        }
    },

    // less common -> common
    homophones: {
        'navigate': 'go',
        'contract': 'collapse',
        'claps': 'collapse',
        'expense': 'expand',
        'explain': 'expand',
        'expanding': 'expand',
        'expand noun': 'expand 9',
        'it\'s been': 'expand',
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
        'advert': 'upvote',
    },

    commands: [
        {
            name: 'View Comments',
            description: "View the comments of a reddit post.",
            match: "comments #",
            pageFn: async (transcript: string, i: number) => {
                clickIfExists(thingAtIndex(i) + ' a.comments');
            },
        }, {
            name: 'Visit Post',
            description: "Equivalent of clicking a reddit post.",
            match: ['visit #', 'visit'],
            pageFn: async (transcript:string, i:number) => {
                // if we're on the post
                if (COMMENTS_REGX.test(window.location.href)) {
                    clickIfExists('#siteTable p.title a.title');
                } else {
                    clickIfExists(thingAtIndex(i) + ' a.title');
                }
            },
        },
        {
            name: 'Expand',
            description: "Expand a preview of a post, or a comment by it's position (rank).",
            match: ["expand #", "# expand", 'expand'], // in comments view
            pageFn: async (transcript: string, i: number) => {
                if (typeof i !== 'undefined') {
                    let el = <HTMLElement>document.querySelector(`${thingAtIndex(i)} .expando-button.collapsed`);
                    el.click();
                    PluginBase.util.scrollToAnimated(el, -25);
                } else {
                    // if expando-button is in frame expand that, otherwise expand first (furthest up) visible comment
                    const mainItem = document.querySelector<HTMLAnchorElement>(`#siteTable .thing .expando-button.collapsed`);
                    const commentItems = Array.from(document.querySelectorAll<HTMLElement>(`.commentarea > div > .thing.collapsed`));

                    if (mainItem && PluginBase.util.isInViewAndTakesSpace(mainItem)) {
                        mainItem.click();
                    } else {
                        for (let el of commentItems.reverse()) {
                            if (PluginBase.util.isInViewAndTakesSpace(el)) {
                                el.querySelector<HTMLAnchorElement>('.comment.collapsed a.expand')!.click();
                                return;
                            }
                        }
                    }
                }
            }
        },
        {
        name: "Collapse",
        description: "Collapse an expanded preview (or comment if viewing comments). Defaults to topmost in the view port.",
        match: ["collapse #", "close", "collapse"],
        pageFn: async (transcript:string, i:number) => {
            let index = (i === null || isNaN(Number(i))) ? null : Number(i);
            if (index !== null) {
                let el = <HTMLElement>document.querySelector(thingAtIndex(index) + ' .expando-button:not(.collapsed)');
                el.click();
            } else {
                // collapse first visible item (can be comment or post)
                for (let el of document.querySelectorAll<HTMLElement>(`#siteTable .thing .expando-button.expanded, .commentarea>div>div.thing:not(.collapsed)>div>p>a.expand`)) {
                    if (PluginBase.util.isInViewAndTakesSpace(el)) {
                        el.click();
                        break;
                    }
                }
            }
        },
        test: async function(context) {
            var tierTwoComment, commentUnderTest;
            await context.loadPage('https://old.reddit.com/r/IAmA/comments/z1c9z/i_am_barack_obama_president_of_the_united_states/');
            await context.driver.wait(context.until.elementIsVisible(context.driver.findElement(context.By.css('.commentarea'))), 1000);
            await context.driver.executeScript(`document.queryElement('.commentarea').scrollIntoView();`);
            // make sure it's expanded
            //<div class=" thing id-t1_c60o0iw noncollapsed   comment " id="thing_t1_c60o0iw" onclick="click_thing(this)" data-fullname="t1_c60o0iw" data-type="comment" data-subreddit="IAmA" data-subreddit-fullname="t5_2qzb6" data-author="Biinaryy" data-author-fullname="t2_76bmi"><p class="parent"><a name="c60o0iw"></a></p><div class="midcol unvoted"><div class="arrow up login-required archived access-required" data-event-action="upvote" role="button" aria-label="upvote" tabindex="0"></div><div class="arrow down login-required archived access-required" data-event-action="downvote" role="button" aria-label="downvote" tabindex="0"></div></div><div class="entry unvoted"><p class="tagline"><a href="javascript:void(0)" class="expand" onclick="return togglecomment(this)">[–]</a><a href="https://old.reddit.com/user/Biinaryy" class="author may-blank id-t2_76bmi">Bi

            commentUnderTest = (await context.driver.findElements(context.By.xpath("//div[contains(@class, 'noncollapsed')][contains(@class, 'comment')][@data-author='Biinaryy']")))[0];

            // make sure a child element is visible
            tierTwoComment = (await context.driver.findElements(context.By.xpath("//p[contains(text(), 'HE KNOWS')]")))[0];
            context.assert.true((await tierTwoComment.isDisplayed()));
            await context.say();
            // check that the child comment is no longer visible
            await context.driver.wait(async () => {
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
                    return [match[1].replace(/\s/g, "")];
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
        minConfidence: 0.5,
        pageFn: async () => {
            document.location.href = "https://old.reddit.com";
        },
    }, {
        name: 'Clear Vote',
        description: "Unsets the last vote so it's neither up or down.",
        match: ["clear vote #", "reset vote #", "clear vote", "reset vote"],
        pageFn: async (transcript: string, i: number) => {
            let index = (i === null || isNaN(Number(i))) ? 1 : Number(i);
            clickIfExists(`${thingAtIndex(index)} .arrow.downmod,${thingAtIndex(index)} .arrow.upmod`);
        },
    }, {
        name: 'Downvote',
        match: ["downvote #", "downvote"],
        description: "Downvote the current post or a post # (doesn't work for comments yet)",
        pageFn: async (transcript: string, i: number) => {
            let index = (i === null || isNaN(Number(i))) ? 1 : Number(i);
            clickIfExists(`${thingAtIndex(index)} .arrow.down:not(.downmod)`);
        },
    }, {
        name: 'Upvote',
        match: ["upvote #", "upvote"],
        description: "Upvote the current post or a post # (doesn't work for comments yet)",
        pageFn: async (transcript:string, i:number) => {
            let index = (i === null || isNaN(Number(i))) ? 1 : Number(i);
            clickIfExists(`${thingAtIndex(index)} .arrow.up:not(.upmod)`);
        },
    }, {
        name: 'Expand All Comments',
        description: "Expands all the comments.",
        match: ["expand all", "expand all comments"],
        pageFn: async () => {
            for (let el of document.querySelectorAll<HTMLElement>('.thing.comment.collapsed a.expand')) {
                el.click();
            }
        },
        test: async function(context) {
            // Only checks to see that more than 5 comments are collapsed.
            let previousCollapsed;
            await context.loadPage('https://old.reddit.com/r/OldSchoolCool/comments/2uak5a/arnold_schwarzenegger_flexing_for_two_old_ladies/co6nw85/');
            // first let's make sure there's some collapsed items
            context.driver.wait(context.until.elementIsVisible(context.driver.findElement(context.By.css('.thing.comment.collapsed'))), 2000);

            previousCollapsed = (await context.driver.findElements(context.By.css('.thing.comment.collapsed'))).length;
            await context.say();

            // no collapsed comments remain
            await context.driver.wait(async () => {
                // test that at least 5 comments have been expanded
                return (await context.driver.findElements(context.By.css('.thing.comment.collapsed'))).length < previousCollapsed - 5;
            }, 1000);
        }
    }],
}};
