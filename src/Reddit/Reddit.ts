import { ExecutionContext } from "ava";
import { setStyles, selectAll, select } from "./util";

/*
 * LipSurf plugin for Reddit.com
 */
/// <reference types="@lipsurf/types/extension"/>
declare const PluginBase: IPluginBase;

type Maybe<T> = T | null;

const thingAttr = `${PluginBase.util.getNoCollisionUniqueAttr()}-thing`;
const COMMENTS_REGX = /reddit.com\/r\/[^\/]*\/comments\//;

let isOldReddit = false;
let scrollContainer: Maybe<ParentNode> = null;
let observer: Maybe<MutationObserver> = null;
let posts: Maybe<NodeListOf<HTMLElement>> = null;
let index = 0;
let isDOMLoaded = false;
let isHomeBtnClicked = false;
let currentRoute;

/**
 * On new reddit we sometimes get an overlay when clicking the comments of a post,
 * this ensures that we give priority to the selector on the overlayed post.
 */
function prioritizeCurPost(u: string): string[] {
  return ["[data-test-id='post-content'] ", ""].map((s) => `${s}${u}`);
}

const reddit = {
  old: {
    post: {
      thing: ".thing",
      title: "a.title",
      expandBtn: ".expando-button",
      commentarea: ".commentarea",
    },
    comments: {
      select: "a.comments",
      expandBtn: ".expando-button",
      comment: {
        select: ".comment",
        expandBtn: "a.expand",
      },
    },
    special: {
      collapsed: ".collapsed",
      expanded: ".expanded",
      notCollapsed: ":not(.collapsed)",
    },
    vote: {
      up: ".arrow.up:not(.upmod)",
      down: ".arrow.down:not(.downmod)",
      upmod: ".arrow.upmod",
      downmod: ".arrow.downmod",
    },
  },
  latest: {
    home: "a[aria-label='Home']",
    post: {
      thing: ".Post",
    },
    comments: {
      select: "a[data-click-id='comments']",
      threadline: ".threadline",
      comment: {
        select: ".Comment",
        expandBtn: ".icon-expand",
      },
    },
    vote: {
      up: prioritizeCurPost(`.voteButton[aria-label='upvote']`),
      down: prioritizeCurPost(`.voteButton[aria-label='downvote']`),
      pressed: prioritizeCurPost(`.voteButton[aria-pressed='true']`),
      unpressed: prioritizeCurPost(`.voteButton[aria-pressed='false']`),
    },
  },
};

function thingAtIndex(i: number): string {
  if (isOldReddit) {
    return `${reddit.old.post.thing}[${thingAttr}="${i}"]`;
  } else {
    return `${reddit.latest.post.thing}[${thingAttr}="${i}"]`;
  }
}

function waitPosts(fn, timeout) {
  let timer: Maybe<ReturnType<typeof setTimeout>> = null;

  setTimeout(() => {
    posts = selectAll(reddit.latest.post.thing);

    if (posts && posts.length) {
      clearTimeout(timer!);
      setTimeout(fn);
    } else {
      timer = setTimeout(() => {
        waitPosts(fn, timeout);
      }, timeout);
    }
  });
}

function clickIfExists(...selectors: string[]) {
  for (const sel of selectors) {
    const el = select<HTMLElement>(sel);
    if (el) {
      el.click();
      break;
    }
  }
}

function clickIfDisplayed(el: HTMLElement) {
  if (parseFloat(getComputedStyle(el).width)) {
    el.click();
  }
}

function genPostNumberElement(n: number): HTMLElement {
  const span = document.createElement("span");
  span.textContent = "" + n;
  span.className = "post-number";

  return span;
}

function addRedditAPostsAttributes(
  posts: NodeListOf<HTMLElement>,
  isOld: boolean
) {
  if (isOld) {
    return posts.forEach((post) => {
      index += 1;
      post.setAttribute(thingAttr, `${index}`);
      const oldRank = select<HTMLElement>(".rank", post)!;
      const newRank = genPostNumberElement(index);

      setStyles({ position: "relative" }, post);
      setStyles({ visibility: "hidden" }, oldRank);
      setStyles(
        {
          position: "absolute",
          top: "20px",
          left: "10px",
          fontWeight: 700,
          fontSize: "1rem",
          color: "#999999",
          transform: "translateY(-50%)",
        },
        newRank
      );

      post.appendChild(newRank);
    });
  } else {
    posts.forEach(setAttributes);
  }
}

function setAttributes(post: HTMLElement) {
  if (!post) return;
  const postNum = select(".post-number", post)?.textContent;

  if (postNum) index = +postNum;

  if (post && getComputedStyle(post).display !== "none" && !postNum) {
    index += 1;

    post.setAttribute(thingAttr, `${index}`);

    setStyles(
      {
        position: "relative",
        overflow: "visible",
      },
      post
    );

    if (!COMMENTS_REGX.test(window.location.href)) {
      const el = genPostNumberElement(index);

      setStyles(
        {
          position: "absolute",
          top: "0",
          right: "102%",
          fontWeight: 700,
          opacity: 0.8,
        },
        el
      );

      post.appendChild(el);
    }
  }
}

function observerCallback(mutationList) {
  const { old, latest } = reddit;
  const postSelector = isOldReddit ? old.post.thing : latest.post.thing;

  mutationList.forEach((it) => {
    it.addedNodes.forEach((node) => {
      const post = select<HTMLElement>(postSelector, node);
      setAttributes(post!);
    });
  });
}

function createObserver(el: Element) {
  observer = new MutationObserver(observerCallback);
  observer.observe(el!, { childList: true });
}

function setParentContainer(posts: NodeListOf<HTMLElement>): Maybe<ParentNode> {
  return posts?.[0]?.parentNode?.parentNode?.parentNode || null;
}

type VoteType = "up" | "down" | "clear";

function vote(type: VoteType, index?: number) {
  const { old, latest } = reddit;
  let selectors: string[] = [];
  console.log("voting", type);

  if (type === "clear") {
    const thing = index && thingAtIndex(index);

    if (index && isOldReddit) {
      selectors = [`${thing} ${old.vote.downmod}, ${thing} ${old.vote.upmod}`];
    } else if (!index && isOldReddit) {
      selectors = [`${old.vote.downmod},${old.vote.upmod}`];
    } else if (index && !isOldReddit) {
      selectors = latest.vote.pressed.map((s) => `${thing} ${s}`);
    } else {
      selectors = latest.vote.pressed;
    }
  } else {
    selectors = isOldReddit ? [old.vote[type]] : latest.vote[type];

    if (index) selectors = selectors.map((s) => `${thingAtIndex(index)} ${s}`);
  }

  clickIfExists(...selectors);
}

function getCollapseBtnSelector() {
  const { post, special, comments } = reddit.old;
  const { comment } = comments;

  const oldCommentBtnSelector = `${comment.select}${special.notCollapsed} ${comment.expandBtn}`;
  const newCommentBtnSelector = reddit.latest.comments.threadline;

  return {
    postExpBtn: isOldReddit ? `${post.expandBtn}${special.expanded}` : "",
    comExpBtn: isOldReddit ? oldCommentBtnSelector : newCommentBtnSelector,
  };
}

function getExpandableElementsSelectors() {
  const { comments, special, post } = reddit.old;
  const selectors = {
    comExpBtn: "",
    postExpBtn: "",
    comment: "",
  };

  if (isOldReddit) {
    selectors.comExpBtn = comments.comment.expandBtn;
    selectors.postExpBtn = `${post.thing} ${comments.expandBtn}`;
    selectors.comment = `${comments.comment.select}${special.collapsed}`;
  } else {
    selectors.comment = reddit.latest.comments.comment.select;
    selectors.comExpBtn = reddit.latest.comments.comment.expandBtn;
  }

  return selectors;
}

async function expandCurrent() {
  // if expando-button is in frame expand that, otherwise expand first (furthest up) visible comment
  const { postExpBtn, comExpBtn, comment } = getExpandableElementsSelectors();
  const mainItem =
    (!!postExpBtn && select<HTMLAnchorElement>(postExpBtn)) || null;

  if (mainItem && PluginBase.util.isVisible(mainItem)) mainItem.click();
  else {
    const itemsSelector = isOldReddit ? comment : comExpBtn;
    let el: HTMLElement;

    const items = Array.from(selectAll<HTMLElement>(itemsSelector));

    for (el of items.reverse()) {
      if (PluginBase.util.isVisible(el)) {
        if (isOldReddit) {
          return select<HTMLElement>(comExpBtn, el)!.click();
        } else {
          return clickIfDisplayed(el.parentNode as HTMLElement);
        }
      }
    }
  }
}

async function expandAll() {
  const { comment, comExpBtn } = getExpandableElementsSelectors();
  const selector = isOldReddit ? `${comment} ${comExpBtn}` : comExpBtn;

  for (let el of selectAll<HTMLElement>(selector)) {
    if (isOldReddit) {
      el.click();
    } else {
      clickIfDisplayed(el.parentNode as HTMLElement);
    }
  }
}

function collapseCurrent() {
  const { postExpBtn, comExpBtn } = getCollapseBtnSelector();

  const postBtn = (!!postExpBtn && select<HTMLElement>(postExpBtn!)) || null;
  const commentBtns = selectAll<HTMLElement>(comExpBtn);

  postBtn && PluginBase.util.isVisible(postBtn!) && postBtn!.click();

  for (const el of commentBtns) {
    if (PluginBase.util.isVisible(el)) {
      el.click();
      break;
    }
  }
}

function resetDomState() {
  index = 0;
  isDOMLoaded = false;
  scrollContainer = null;
  observer?.disconnect();
  observer = null;
}

function onLoad() {
  currentRoute = window.location.href;

  const { old, latest } = reddit;
  isOldReddit = !!select<HTMLElement>(old.post.thing);

  if (isDOMLoaded) return;

  const postSelector = isOldReddit ? old.post.thing : latest.post.thing;
  posts = selectAll<HTMLElement>(postSelector);

  isDOMLoaded = true;

  addRedditAPostsAttributes(posts, isOldReddit);

  if (!isOldReddit) {
    const home = select(reddit.latest.home);
    window.addEventListener("click", onClick);
    home?.addEventListener("click", homeClickHandler);

    scrollContainer = setParentContainer(posts);
    scrollContainer && createObserver(scrollContainer! as Element);
  }
}

function redefinePosts() {
  waitPosts(() => {
    if (window.location.hostname.endsWith("reddit.com")) {
      isDOMLoaded = false;
      index = 0;
      onLoad();
      toggleContext(COMMENTS_REGX.test(window.location.href));
    } else {
      PluginBase.util.removeContext("Post List", "Post");
    }
  }, 200);
}

function onPopState() {
  setTimeout(redefinePosts);
}

function onClick() {
  if (!isHomeBtnClicked && currentRoute === window.location.href) return;

  setTimeout(() => {
    if (isHomeBtnClicked) isHomeBtnClicked = false;
    redefinePosts();
    currentRoute = window.location.href;
  });
}

function homeClickHandler() {
  isHomeBtnClicked = true;
}

function toggleContext(isPostContext = false) {
  console.log(isPostContext, "post context");

  if (isPostContext) {
    PluginBase.util.prependContext("Post");
    PluginBase.util.removeContext("Post List");
  } else {
    PluginBase.util.prependContext("Post List");
    PluginBase.util.removeContext("Post");
  }
}

function dispatchEvent(eventName: string) {
  const event = new Event(eventName);
  window.dispatchEvent(event);
}

export default <IPluginBase & IPlugin>{
  ...PluginBase,
  ...{
    niceName: "Reddit",
    description: "Commands for Reddit.com",
    version: "4.6.0-alpha.1",
    apiVersion: 2,
    match: /^https?:\/\/.*\.reddit.com/,
    authors: "Miko, Anar",

    // less common -> common
    homophones: {
      navigate: "go",
      contract: "collapse",
      claps: "collapse",
      expense: "expand",
      explain: "expand",
      expanding: "expand",
      "expand noun": "expand 9",
      "it's been": "expand",
      expanse: "expand",
      expanded: "expand",
      stand: "expand",
      xpand: "expand",
      xmen: "expand",
      spend: "expand",
      span: "expand",
      spell: "expand",
      spent: "expand",
      "reddit dot com": "reddit",
      "read it": "reddit",
      shrink: "collapse",
      advert: "upvote",
      download: "downvote",
      commence: "comments",
    },

    contexts: {
      "Post List": {
        commands: [
          "View Comments",
          "Visit Post",
          "Expand",
          "Collapse",
          "Upvote",
          "Downvote",
          "Clear Vote",
        ],
      },
      Post: {
        commands: [
          "Upvote Current",
          "Downvote Current",
          "Clear Vote Current",
          "Visit Current",
          "Expand Current",
          "Collapse Current",
          "Expand All Comments",
        ],
      },
    },

    init: async () => {
      if (window.location.hostname.endsWith("reddit.com")) {
        console.log("init");
        toggleContext(COMMENTS_REGX.test(window.location.href));
        window.addEventListener("load", onLoad);
        window.addEventListener("popstate", onPopState);

        await PluginBase.util.ready();

        setTimeout(() => {
          if (!isDOMLoaded) dispatchEvent("load");
        }, 2000);
      }
    },

    destroy: () => {
      resetDomState();

      PluginBase.util.removeContext("Post List", "Post");
      window.removeEventListener("load", onLoad);

      !isOldReddit && window.removeEventListener("popstate", onPopState);
      !isOldReddit && window.removeEventListener("click", onClick);
    },

    commands: [
      {
        name: "Go to Reddit",
        global: true,
        match: ["[/go to ]reddit"],
        minConfidence: 0.5,
        pageFn: () => {
          document.location.href = "https://www.reddit.com";
        },
      },
      {
        name: "Go to Subreddit",
        match: {
          fn: ({ normTs, preTs }) => {
            const SUBREDDIT_REGX = /\b(?:go to |show )?(?:are|our|r) (.*)/;
            let match = preTs.match(SUBREDDIT_REGX);
            if (match) {
              const endPos = match.index! + match[0].length;
              return [match.index, endPos, [match[1].replace(/\s/g, "")]];
            }
          },
          description: "go to/show r [subreddit name] (do not say slash)",
        },
        isFinal: true,
        nice: (transcript, matchOutput: string) => {
          return `go to r/${matchOutput}`;
        },
        pageFn: (transcript, subredditName: string) => {
          window.location.href = `https://www.reddit.com/r/${subredditName}`;
        },
      },
      {
        name: "View Comments",
        description: "View the comments of a reddit post.",
        match: ["comments #", "# comments"],
        normal: false,
        pageFn: (transcript, index: number) => {
          const selector = isOldReddit
            ? ` ${reddit.old.comments.select}`
            : ` ${reddit.latest.comments.select}`;

          clickIfExists(thingAtIndex(index) + selector);
        },
      },
      {
        name: "Visit Post",
        description: "Equivalent of clicking a reddit post.",
        match: ["visit #", "# visit"],
        normal: false,
        pageFn: (transcript, index: number) => {
          const selector = isOldReddit
            ? ` ${reddit.old.post.title}`
            : reddit.latest.post.thing;
          clickIfExists(thingAtIndex(index) + selector);
        },
      },
      {
        name: "Expand",
        description:
          "Expand a preview of a post, or a comment by it's position (rank).",
        match: ["expand #", "# expand"], // in comments view
        normal: false,
        pageFn: (transcript, index: number) => {
          const { comments, special } = reddit.old;
          const el = select<HTMLElement>(
            `${thingAtIndex(index)} ${comments.expandBtn}${special.collapsed}`
          );
          el!.click();
          PluginBase.util.scrollToAnimated(el!, -25);
        },
        test: async (t: ExecutionContext<ICmdTestContext>, say, client) => {
          await client.url(
            `${t.context.localPageDomain}/reddit-r-comics.html?fakeUrl=https://www.reddit.com/r/comics`
          );
          const selector = `#thing_t3_dvpn38 > div > div > div.expando-button.collapsed`;
          const item = await client.$(selector);
          t.true(await item.isExisting());
          await say("expand for");
          t.true(
            (await item.getAttribute("class")).split(" ").includes("expanded")
          );
        },
      },
      {
        name: "Collapse",
        description:
          "Collapse an expanded preview (or comment if viewing comments). Defaults to topmost in the view port.",
        match: ["collapse #", "# collapse"],
        normal: false,
        pageFn: (transcript, index: number) => {
          const { comments, special } = reddit.old;
          const el = select<HTMLElement>(
            // thingAtIndex(index) + ' .expando-button:not(.collapsed)'
            thingAtIndex(index) + ` ${comments.expandBtn}${special.expanded}`
          );

          el?.click();
        },
        test: async (t: ExecutionContext<ICmdTestContext>, say, client) => {
          await client.url(
            "https://old.reddit.com/r/IAmA/comments/z1c9z/i_am_barack_obama_president_of_the_united_states/"
          );

          // await client.driver.wait(client.until.elementIsVisible(client.driver.findElement(client.By.css('.commentarea'))), 1000);
          await client.execute(() => {
            select(".commentarea")!.scrollIntoView();
          });
          // make sure it's expanded
          //<div class=" thing id-t1_c60o0iw noncollapsed   comment " id="thing_t1_c60o0iw" onclick="click_thing(this)" data-fullname="t1_c60o0iw" data-type="comment" data-subreddit="IAmA" data-subreddit-fullname="t5_2qzb6" data-author="Biinaryy" data-author-fullname="t2_76bmi"><p class="parent"><a name="c60o0iw"></a></p><div class="midcol unvoted"><div class="arrow up login-required archived access-required" data-event-action="upvote" role="button" aria-label="upvote" tabindex="0"></div><div class="arrow down login-required archived access-required" data-event-action="downvote" role="button" aria-label="downvote" tabindex="0"></div></div><div class="entry unvoted"><p class="tagline"><a href="javascript:void(0)" class="expand" onclick="return togglecomment(this)">[–]</a><a href="https://old.reddit.com/user/Biinaryy" class="author may-blank id-t2_76bmi">Bi

          const commentUnderTest = await client.$(
            "//div[contains(@class, 'noncollapsed')][contains(@class, 'comment')][@data-author='Biinaryy']"
          );

          // make sure a child element is visible
          const tierTwoComment = await client.$(
            "//p[contains(text(), 'HE KNOWS')]"
          );
          // await tierTwoComment.waitForDisplayed()
          t.true(
            await tierTwoComment.isDisplayed(),
            `tier two comment should be visible`
          );
          await say();
          // check that the child comment is no longer visible
          t.true(
            (await commentUnderTest.getAttribute("class")).includes(
              "collapsed"
            ),
            `comment under test needs collapsed class`
          );
          t.false(
            await tierTwoComment.isDisplayed(),
            `tier two comment should not be visible`
          );
        },
      },
      {
        name: "Upvote",
        match: ["upvote #", "# upvote"],
        description: "Upvote the post # (doesn't work for comments yet)",
        normal: false,
        pageFn: (transcript, index: number) => vote("up", index),
      },
      {
        name: "Downvote",
        match: ["downvote #", "# downvote"],
        description: "Downvote the post # (doesn't work for comments yet)",
        normal: false,
        pageFn: (transcript, index: number) => vote("down", index),
      },
      {
        name: "Clear Vote",
        description: "Unsets the upvote/downvote so it's neither up or down.",
        match: ["[clear/reset] vote #", "# [clear/reset] vote"],
        normal: false,
        pageFn: (transcript, index: number) => vote("clear", index),
      },
      /* Comments Page */
      {
        name: "Upvote Current",
        match: "upvote",
        description: "Upvote the current post.",
        normal: false,
        pageFn: () => vote("up"),
      },
      {
        name: "Downvote Current",
        match: "downvote",
        description: "Downvote the post # (doesn't work for comments yet)",
        normal: false,
        pageFn: () => vote("down"),
      },
      {
        name: "Clear Vote Current",
        description: "Unsets the upvote/downvote so it's neither up or down.",
        match: ["[clear/reset] vote"],
        normal: false,
        pageFn: () => vote("clear"),
      },
      {
        name: "Visit Current",
        description: "Click the link for the post that we're in.",
        match: "visit",
        normal: false,
        pageFn: () => {
          // here we have to dispatch popstate event
          // because switching to the post page does
          // not cause location popstate event
          dispatchEvent("popstate");
          clickIfExists("#siteTable a.title");
        },
      },
      {
        name: "Expand Current",
        description: "Expand the post that we're in.",
        match: "expand",
        normal: false,
        pageFn: expandCurrent,
      },
      {
        name: "Collapse Current",
        description: "Collapse the current post that we're in.",
        match: ["collapse", "close"],
        normal: false,
        pageFn: collapseCurrent,
      },
      {
        name: "Expand All Comments",
        description: "Expands all the comments.",
        match: ["expand all[/ comments]"],
        normal: false,
        pageFn: expandAll,
        test: async (t, say, client) => {
          // Only checks to see that more than 5 comments are collapsed.
          await client.url(
            "https://old.reddit.com/r/OldSchoolCool/comments/2uak5a/arnold_schwarzenegger_flexing_for_two_old_ladies/co6nw85/"
          );
          // first let's make sure there's some collapsed items
          t.truthy(
            (await client.$$(".thing.comment.collapsed")).length,
            `should be some collapsed items`
          );

          const previousCollapsed = (
            await client.$$(".thing.comment.collapsed")
          ).length;
          await say();

          // no collapsed comments remain
          t.true(
            (await client.$$(".thing.comment.collapsed")).length <
              previousCollapsed - 5,
            `at least 5 comments have been expanded`
          );
        },
      },
    ],
  },
};
