import PluginBase from 'chrome-extension://lnnmjmalakahagblkkcnjkoaihlfglon/dist/modules/plugin-base.js';import ExtensionUtil from 'chrome-extension://lnnmjmalakahagblkkcnjkoaihlfglon/dist/modules/extension-util.js';// dist/tmp/Reddit/Reddit.js
var thingAttr = `${PluginBase.util.getNoCollisionUniqueAttr()}-thing`;
var Reddit_default = { "languages": { "ja": { "niceName": "レディット", "description": "Redditで操作します", "authors": "Miko", "commands": { "View Comments": { "name": "コメントを診ます", "match": ["こめんと#"] } } }, "ru": { "niceName": "Реддит", "description": "Команды для сайта Reddit.com", "authors": "Hanna, Miko", "homophones": { "reddit": "реддит", "голоса": "голос за" }, "commands": { "View Comments": { "name": "Открыть комментарии", "description": "Открывает комментарии к посту названного номера.", "match": ["[комментарии/комменты] к #"] }, "Visit Post": { "name": "Открыть пост", "description": "Кликает пост названного номера.", "match": ["открыть пост[/ #]"] }, "Visit Current": { "name": "Открыть пост", "description": "Кликает пост.", "match": ["открыть пост"] }, "Expand": { "name": "Развернуть", "description": "Развернуть превью поста или комментария названного номера.", "match": ["развернуть #", "# развернуть"] }, "Expand Current": { "name": "Развернуть", "description": "Развернуть превью поста или комментария.", "match": "развернуть" }, "Collapse": { "name": "Свернуть", "description": "Свернуть развернутый пост или комментарий. Если не назван номер, автоматически сворачивает самый верхний пост/ комментарий в пределах экрана.", "match": ["[свернуть/закрыть] #"] }, "Collapse Current": { "name": "Свернуть", "description": "Свернуть развернутый пост или комментарий. Если не назван номер, автоматически сворачивает самый верхний пост/ комментарий в пределах экрана.", "match": ["свернуть", "закрыть"] }, "Go to Reddit": { "name": "Открыть реддит", "description": "Переходит на сайт reddit.com", "match": "реддит" }, "Clear Vote": { "name": "Убрать голос", "description": "Убирает последний голос за или против последнего поста или поста названного номера", "match": "убрать голос #" }, "Clear Vote Current": { "name": "Убрать голос", "description": "Убирает последний голос за или против последнего поста или поста", "match": "убрать голос" }, "Downvote": { "name": "Голос против", "description": "Голосует поста названного # (пока нет поддержки комментариев)", "match": "голос против #" }, "Downvote Current": { "name": "Голос против", "description": "Голосует против данного поста (пока нет поддержки комментариев)", "match": "голос против" }, "Upvote": { "name": "Голос за", "description": "Голосует за пост названного # (пока нет поддержки комментариев)", "match": "голос за #" }, "Upvote Current": { "name": "Голос за", "description": "Голосует за данный пост (пока нет поддержки комментариев)", "match": "голос за" }, "Expand All Comments": { "name": "Показать все комментарии", "description": "Открывает все комментарии к данному посту", "match": ["[показать/открыть] все комментарии"] } } } }, "niceName": "Reddit", "description": "Commands for Reddit.com", "version": "4.4.0", "apiVersion": 2, "match": /^https?:\/\/.*\.reddit.com/, "authors": "Miko", "homophones": { "navigate": "go", "contract": "collapse", "claps": "collapse", "expense": "expand", "explain": "expand", "expanding": "expand", "expand noun": "expand 9", "it's been": "expand", "expanse": "expand", "expanded": "expand", "stand": "expand", "xpand": "expand", "xmen": "expand", "spend": "expand", "span": "expand", "spell": "expand", "spent": "expand", "reddit dot com": "reddit", "read it": "reddit", "shrink": "collapse", "advert": "upvote", "download": "downvote" }, "contexts": { "Post List": { "commands": ["View Comments", "Visit Post", "Expand", "Collapse", "Upvote", "Downvote", "Clear Vote"] }, "Post": { "commands": ["Upvote Current", "Downvote Current", "Clear Vote Current", "Visit Current", "Expand Current", "Collapse Current", "Expand All Comments"] } }, "commands": [{ "name": "Go to Reddit", "global": true, "match": ["[/go to ]reddit"], "minConfidence": 0.5 }, { "name": "Go to Subreddit", "match": { "fn": () => {
}, "description": "go to/show r [subreddit name] (do not say slash)" }, "isFinal": true, "nice": (transcript, matchOutput) => {
  return `go to r/${matchOutput}`;
} }, { "name": "View Comments", "description": "View the comments of a reddit post.", "match": ["comments #", "# comments"], "normal": false }, { "name": "Visit Post", "description": "Equivalent of clicking a reddit post.", "match": ["visit #", "# visit"], "normal": false }, { "name": "Expand", "description": "Expand a preview of a post, or a comment by it's position (rank).", "match": ["expand #", "# expand"], "normal": false }, { "name": "Collapse", "description": "Collapse an expanded preview (or comment if viewing comments). Defaults to topmost in the view port.", "match": ["collapse #", "# collapse"], "normal": false }, { "name": "Upvote", "match": ["upvote #", "# upvote"], "description": "Upvote the post # (doesn't work for comments yet)", "normal": false }, { "name": "Downvote", "match": ["downvote #", "# downvote"], "description": "Downvote the post # (doesn't work for comments yet)", "normal": false }, { "name": "Clear Vote", "description": "Unsets the upvote/downvote so it's neither up or down.", "match": ["[clear/reset] vote #", "# [clear/reset] vote"], "normal": false }, { "name": "Upvote Current", "match": "upvote", "description": "Upvote the current post.", "normal": false }, { "name": "Downvote Current", "match": "downvote", "description": "Downvote the post # (doesn't work for comments yet)", "normal": false }, { "name": "Clear Vote Current", "description": "Unsets the upvote/downvote so it's neither up or down.", "match": ["[clear/reset] vote"], "normal": false }, { "name": "Visit Current", "description": "Click the link for the post that we're in.", "match": "visit", "normal": false }, { "name": "Expand Current", "description": "Expand the post that we're in.", "match": "expand", "normal": false }, { "name": "Collapse Current", "description": "Collapse the current post that we're in.", "match": ["collapse", "close"], "normal": false }, { "name": "Expand All Comments", "description": "Expands all the comments.", "match": ["expand all[/ comments]"], "normal": false }] };
export {
  Reddit_default as default
};
LS-SPLIT// dist/tmp/Reddit/Reddit.js
allPlugins.Reddit = (() => {
  function setStyles(stylesObject, el) {
    Object.keys(stylesObject).forEach((key) => {
      el.style[key] = stylesObject[key];
    });
  }
  function select(selector, el) {
    const element = el || document;
    return element.querySelector(selector);
  }
  function selectAll(selector, el) {
    const element = el || document;
    return element.querySelectorAll(selector);
  }
  var thingAttr = `${PluginBase.util.getNoCollisionUniqueAttr()}-thing`;
  var COMMENTS_REGX = /reddit.com\/r\/[^\/]*\/comments\//;
  var isOldReddit = false;
  var scrollContainer = null;
  var observer = null;
  var posts = null;
  var index = 0;
  var isDOMLoaded = false;
  var currentRoute;
  var reddit = { old: { post: { thing: ".thing", title: "a.title", expandBtn: ".expando-button", commentarea: ".commentarea" }, comments: { select: "a.comments", expandBtn: ".expando-button", comment: { select: ".comment", expandBtn: "a.expand" } }, special: { collapsed: ".collapsed", expanded: ".expanded", notCollapsed: ":not(.collapsed)" }, vote: { btn: "#siteTable *[role='button']", up: ".arrow.up:not(.upmod)", down: ".arrow.down:not(.downmod)", upmod: ".arrow.upmod", downmod: ".arrow.downmod" } }, latest: { post: { thing: ".Post" }, comments: { select: "a[data-click-id='comments']", threadline: ".threadline", comment: { select: ".Comment", expandBtn: ".icon-expand" } }, vote: { btn: ".voteButton", up: ".voteButton[aria-label='upvote']", down: ".voteButton[aria-label='downvote']", pressed: ".voteButton[aria-pressed='true']", unpressed: ".voteButton[aria-pressed='false']" } } };
  function thingAtIndex(i) {
    if (isOldReddit) {
      return `${reddit.old.post.thing}[${thingAttr}="${i}"]`;
    } else {
      return `${reddit.latest.post.thing}[${thingAttr}="${i}"]`;
    }
  }
  function waitPostsLoading(fn, timeout) {
    let timer = null;
    let posts1;
    posts1 = selectAll(".Post");
    if (posts1 && posts1.length > 5) {
      clearTimeout(timer);
      fn();
    } else {
      timer = setTimeout(() => {
        waitPostsLoading(fn, timeout);
      }, timeout);
    }
  }
  function clickIfExists(selector) {
    const el = select(selector);
    if (el)
      el.click();
  }
  function clickIfDisplayed(el) {
    if (parseFloat(getComputedStyle(el).width)) {
      el.click();
    }
  }
  function genPostNumberElement(number) {
    const span = document.createElement("span");
    span.textContent = number;
    span.className = "post-number";
    return span;
  }
  function addRedditAPostsAttributes(posts2, isOld) {
    if (isOld) {
      return posts2.forEach((post) => {
        index += 1;
        post.setAttribute(thingAttr, `${index}`);
        const oldRank = select(".rank", post);
        const newRank = genPostNumberElement(index);
        setStyles({ position: "relative" }, post);
        setStyles({ visibility: "hidden" }, oldRank);
        setStyles({ position: "absolute", top: "20px", left: "10px", fontWeight: 700, fontSize: "1rem", color: "#999999", transform: "translateY(-50%)" }, newRank);
        post.appendChild(newRank);
      });
    }
    posts2.forEach(setAttributes);
  }
  function setAttributes(post) {
    var _a;
    const postNum = (_a = select(".post-number", post)) == null ? void 0 : _a.textContent;
    if (postNum)
      index = +postNum;
    if (post && getComputedStyle(post).display !== "none" && !postNum) {
      index += 1;
      const span = genPostNumberElement(index);
      post.setAttribute(thingAttr, `${index}`);
      setStyles({ position: "relative", overflow: "visible" }, post);
      setStyles({ position: "absolute", top: "0", right: "102%", fontWeight: 700, opacity: 0.8 }, span);
      post.appendChild(span);
    }
  }
  function observerCallback(mutationList) {
    const { old, latest } = reddit;
    const postSelector = isOldReddit ? old.post.thing : latest.post.thing;
    mutationList.forEach((it) => {
      it.addedNodes.forEach((node) => {
        const post = select(postSelector, node);
        setAttributes(post);
      });
    });
  }
  function createObserver(el) {
    observer = new MutationObserver(observerCallback);
    observer.observe(el, { childList: true });
  }
  function setParentContainer(posts3) {
    var _a, _b, _c;
    return ((_c = (_b = (_a = posts3 == null ? void 0 : posts3[0]) == null ? void 0 : _a.parentNode) == null ? void 0 : _b.parentNode) == null ? void 0 : _c.parentNode) || null;
  }
  function getVoteSelector(cmd, index1) {
    const { old, latest } = reddit;
    const selector = isOldReddit ? old.vote[cmd] : latest.vote[cmd];
    if (index1)
      return `${thingAtIndex(index1)} ${selector}`;
    return selector;
  }
  function getClearVoteSelector(index2) {
    const { old, latest } = reddit;
    const thing = index2 && thingAtIndex(index2);
    if (index2 && isOldReddit) {
      return `${thing} ${old.vote.downmod}, ${thing} ${old.vote.upmod}`;
    }
    if (!index2 && isOldReddit) {
      return `${old.vote.downmod},${old.vote.upmod}`;
    }
    if (index2 && !isOldReddit) {
      return `${thing} ${latest.vote.pressed}`;
    }
    return latest.vote.pressed;
  }
  function vote(type, index3) {
    let q = "";
    if (type === "up")
      q = getVoteSelector("up", index3);
    if (type === "down")
      q = getVoteSelector("down", index3);
    if (type === "clear")
      q = getClearVoteSelector(index3);
    clickIfExists(q);
  }
  function getCollapseBtnSelector() {
    const { post, special, comments } = reddit.old;
    const { comment } = comments;
    const oldCommentBtnSelector = `${comment.select}${special.notCollapsed} ${comment.expandBtn}`;
    const newCommentBtnSelector = reddit.latest.comments.threadline;
    return { postExpBtn: isOldReddit ? `${post.expandBtn}${special.expanded}` : "", comExpBtn: isOldReddit ? oldCommentBtnSelector : newCommentBtnSelector };
  }
  function getExpandableElementsSelectors() {
    const { comments, special, post } = reddit.old;
    const selectors = { comExpBtn: "", postExpBtn: "", comment: "" };
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
    const { postExpBtn, comExpBtn, comment } = getExpandableElementsSelectors();
    const mainItem = !!postExpBtn && select(postExpBtn) || null;
    if (mainItem && PluginBase.util.isVisible(mainItem))
      mainItem.click();
    else {
      const itemsSelector = isOldReddit ? comment : comExpBtn;
      let el;
      const items = Array.from(selectAll(itemsSelector));
      for (el of items.reverse()) {
        if (PluginBase.util.isVisible(el)) {
          if (isOldReddit) {
            return select(comExpBtn, el).click();
          } else {
            return clickIfDisplayed(el.parentNode);
          }
        }
      }
    }
  }
  async function expandAll() {
    const { comment, comExpBtn } = getExpandableElementsSelectors();
    const selector = isOldReddit ? `${comment} ${comExpBtn}` : comExpBtn;
    for (let el of selectAll(selector)) {
      if (isOldReddit) {
        el.click();
      } else {
        clickIfDisplayed(el.parentNode);
      }
    }
  }
  function collapseCurrent() {
    const { postExpBtn, comExpBtn } = getCollapseBtnSelector();
    const postBtn = !!postExpBtn && select(postExpBtn) || null;
    const commentBtns = selectAll(comExpBtn);
    postBtn && PluginBase.util.isVisible(postBtn) && postBtn.click();
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
    observer == null ? void 0 : observer.disconnect();
    observer = null;
  }
  function onLoad() {
    currentRoute = location.href;
    const { old, latest } = reddit;
    isOldReddit = !!select(old.post.thing);
    if (isDOMLoaded)
      return;
    const postSelector = isOldReddit ? old.post.thing : latest.post.thing;
    posts = selectAll(postSelector);
    isDOMLoaded = true;
    addRedditAPostsAttributes(posts, isOldReddit);
    if (!isOldReddit) {
      window.addEventListener("click", onClick);
      scrollContainer = setParentContainer(posts);
      scrollContainer && createObserver(scrollContainer);
    }
  }
  function onPopState() {
    console.log("pop state event handler called");
    waitPostsLoading(() => {
      if (location.hostname.endsWith("reddit.com")) {
        isDOMLoaded = false;
        index = 0;
        onLoad();
        toggleContext(COMMENTS_REGX.test(location.href));
      } else {
        PluginBase.util.removeContext("Post List", "Post");
      }
    }, 200);
  }
  function onClick() {
    setTimeout(() => {
      if (currentRoute === location.href)
        return;
      dispatchEvent("popstate");
    });
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
  function dispatchEvent(eventName) {
    const event = new Event(eventName);
    window.dispatchEvent(event);
  }
  var Reddit_default = { ...PluginBase, ...{ "init": async () => {
    if (location.hostname.endsWith("reddit.com")) {
      console.log("init");
      toggleContext(COMMENTS_REGX.test(location.href));
      window.addEventListener("load", onLoad);
      window.addEventListener("popstate", onPopState);
      await PluginBase.util.ready();
      setTimeout(() => {
        if (!isDOMLoaded)
          dispatchEvent("load");
      }, 2e3);
    }
  }, "destroy": () => {
    resetDomState();
    PluginBase.util.removeContext("Post List", "Post");
    window.removeEventListener("load", onLoad);
    !isOldReddit && window.removeEventListener("popstate", onPopState);
    !isOldReddit && window.removeEventListener("click", onClick);
  }, "commands": { "Go to Reddit": { "pageFn": () => {
    document.location.href = "https://www.reddit.com";
  } }, "Go to Subreddit": { "match": { "en": ({ normTs, preTs }) => {
    const SUBREDDIT_REGX = /\b(?:go to |show )?(?:are|our|r) (.*)/;
    let match = preTs.match(SUBREDDIT_REGX);
    if (match) {
      const endPos = match.index + match[0].length;
      return [match.index, endPos, [match[1].replace(/\s/g, "")]];
    }
  } }, "isFinal": true, "nice": (transcript, matchOutput) => {
    return `go to r/${matchOutput}`;
  }, "pageFn": (transcript, subredditName) => {
    window.location.href = `https://www.reddit.com/r/${subredditName}`;
  } }, "View Comments": { "pageFn": (transcript, index4) => {
    const selector = isOldReddit ? ` ${reddit.old.comments.select}` : ` ${reddit.latest.comments.select}`;
    clickIfExists(thingAtIndex(index4) + selector);
  } }, "Visit Post": { "pageFn": (transcript, index5) => {
    const selector = isOldReddit ? ` ${reddit.old.post.title}` : reddit.latest.post.thing;
    clickIfExists(thingAtIndex(index5) + selector);
  } }, "Expand": { "pageFn": (transcript, index6) => {
    const { comments, special } = reddit.old;
    const el = select(`${thingAtIndex(index6)} ${comments.expandBtn}${special.collapsed}`);
    el.click();
    PluginBase.util.scrollToAnimated(el, -25);
  } }, "Collapse": { "pageFn": (transcript, index7) => {
    const { comments, special } = reddit.old;
    const el = select(thingAtIndex(index7) + ` ${comments.expandBtn}${special.expanded}`);
    el == null ? void 0 : el.click();
  } }, "Upvote": { "pageFn": (transcript, index8) => {
    vote("up", index8);
  } }, "Downvote": { "pageFn": (transcript, index9) => {
    vote("down", index9);
  } }, "Clear Vote": { "pageFn": (transcript, index10) => {
    vote("clear", index10);
  } }, "Upvote Current": { "pageFn": () => vote("up") }, "Downvote Current": { "pageFn": () => vote("down") }, "Clear Vote Current": { "pageFn": () => vote("clear") }, "Visit Current": { "pageFn": () => {
    dispatchEvent("popstate");
    clickIfExists("#siteTable a.title");
  } }, "Expand Current": { "pageFn": async function expandCurrent2() {
    const { postExpBtn, comExpBtn, comment } = getExpandableElementsSelectors();
    const mainItem = !!postExpBtn && select(postExpBtn) || null;
    if (mainItem && PluginBase.util.isVisible(mainItem))
      mainItem.click();
    else {
      const itemsSelector = isOldReddit ? comment : comExpBtn;
      let el;
      const items = Array.from(selectAll(itemsSelector));
      for (el of items.reverse()) {
        if (PluginBase.util.isVisible(el)) {
          if (isOldReddit) {
            return select(comExpBtn, el).click();
          } else {
            return clickIfDisplayed(el.parentNode);
          }
        }
      }
    }
  } }, "Collapse Current": { "pageFn": function collapseCurrent2() {
    const { postExpBtn, comExpBtn } = getCollapseBtnSelector();
    const postBtn = !!postExpBtn && select(postExpBtn) || null;
    const commentBtns = selectAll(comExpBtn);
    postBtn && PluginBase.util.isVisible(postBtn) && postBtn.click();
    for (const el of commentBtns) {
      if (PluginBase.util.isVisible(el)) {
        el.click();
        break;
      }
    }
  } }, "Expand All Comments": { "pageFn": async function expandAll2() {
    const { comment, comExpBtn } = getExpandableElementsSelectors();
    const selector = isOldReddit ? `${comment} ${comExpBtn}` : comExpBtn;
    for (let el of selectAll(selector)) {
      if (isOldReddit) {
        el.click();
      } else {
        clickIfDisplayed(el.parentNode);
      }
    }
  } } } } };
  return Reddit_default;
})();
LS-SPLIT// dist/tmp/Reddit/Reddit.js
allPlugins.Reddit = (() => {
  function setStyles(stylesObject, el) {
    Object.keys(stylesObject).forEach((key) => {
      el.style[key] = stylesObject[key];
    });
  }
  function select(selector, el) {
    const element = el || document;
    return element.querySelector(selector);
  }
  function selectAll(selector, el) {
    const element = el || document;
    return element.querySelectorAll(selector);
  }
  var thingAttr = `${PluginBase.util.getNoCollisionUniqueAttr()}-thing`;
  var COMMENTS_REGX = /reddit.com\/r\/[^\/]*\/comments\//;
  var isOldReddit = false;
  var scrollContainer = null;
  var observer = null;
  var posts = null;
  var index = 0;
  var isDOMLoaded = false;
  var currentRoute;
  var reddit = { old: { post: { thing: ".thing", title: "a.title", expandBtn: ".expando-button", commentarea: ".commentarea" }, comments: { select: "a.comments", expandBtn: ".expando-button", comment: { select: ".comment", expandBtn: "a.expand" } }, special: { collapsed: ".collapsed", expanded: ".expanded", notCollapsed: ":not(.collapsed)" }, vote: { btn: "#siteTable *[role='button']", up: ".arrow.up:not(.upmod)", down: ".arrow.down:not(.downmod)", upmod: ".arrow.upmod", downmod: ".arrow.downmod" } }, latest: { post: { thing: ".Post" }, comments: { select: "a[data-click-id='comments']", threadline: ".threadline", comment: { select: ".Comment", expandBtn: ".icon-expand" } }, vote: { btn: ".voteButton", up: ".voteButton[aria-label='upvote']", down: ".voteButton[aria-label='downvote']", pressed: ".voteButton[aria-pressed='true']", unpressed: ".voteButton[aria-pressed='false']" } } };
  function thingAtIndex(i) {
    if (isOldReddit) {
      return `${reddit.old.post.thing}[${thingAttr}="${i}"]`;
    } else {
      return `${reddit.latest.post.thing}[${thingAttr}="${i}"]`;
    }
  }
  function waitPostsLoading(fn, timeout) {
    let timer = null;
    let posts1;
    posts1 = selectAll(".Post");
    if (posts1 && posts1.length > 5) {
      clearTimeout(timer);
      fn();
    } else {
      timer = setTimeout(() => {
        waitPostsLoading(fn, timeout);
      }, timeout);
    }
  }
  function clickIfExists(selector) {
    const el = select(selector);
    if (el)
      el.click();
  }
  function clickIfDisplayed(el) {
    if (parseFloat(getComputedStyle(el).width)) {
      el.click();
    }
  }
  function genPostNumberElement(number) {
    const span = document.createElement("span");
    span.textContent = number;
    span.className = "post-number";
    return span;
  }
  function addRedditAPostsAttributes(posts2, isOld) {
    if (isOld) {
      return posts2.forEach((post) => {
        index += 1;
        post.setAttribute(thingAttr, `${index}`);
        const oldRank = select(".rank", post);
        const newRank = genPostNumberElement(index);
        setStyles({ position: "relative" }, post);
        setStyles({ visibility: "hidden" }, oldRank);
        setStyles({ position: "absolute", top: "20px", left: "10px", fontWeight: 700, fontSize: "1rem", color: "#999999", transform: "translateY(-50%)" }, newRank);
        post.appendChild(newRank);
      });
    }
    posts2.forEach(setAttributes);
  }
  function setAttributes(post) {
    var _a;
    const postNum = (_a = select(".post-number", post)) == null ? void 0 : _a.textContent;
    if (postNum)
      index = +postNum;
    if (post && getComputedStyle(post).display !== "none" && !postNum) {
      index += 1;
      const span = genPostNumberElement(index);
      post.setAttribute(thingAttr, `${index}`);
      setStyles({ position: "relative", overflow: "visible" }, post);
      setStyles({ position: "absolute", top: "0", right: "102%", fontWeight: 700, opacity: 0.8 }, span);
      post.appendChild(span);
    }
  }
  function observerCallback(mutationList) {
    const { old, latest } = reddit;
    const postSelector = isOldReddit ? old.post.thing : latest.post.thing;
    mutationList.forEach((it) => {
      it.addedNodes.forEach((node) => {
        const post = select(postSelector, node);
        setAttributes(post);
      });
    });
  }
  function createObserver(el) {
    observer = new MutationObserver(observerCallback);
    observer.observe(el, { childList: true });
  }
  function setParentContainer(posts3) {
    var _a, _b, _c;
    return ((_c = (_b = (_a = posts3 == null ? void 0 : posts3[0]) == null ? void 0 : _a.parentNode) == null ? void 0 : _b.parentNode) == null ? void 0 : _c.parentNode) || null;
  }
  function getVoteSelector(cmd, index1) {
    const { old, latest } = reddit;
    const selector = isOldReddit ? old.vote[cmd] : latest.vote[cmd];
    if (index1)
      return `${thingAtIndex(index1)} ${selector}`;
    return selector;
  }
  function getClearVoteSelector(index2) {
    const { old, latest } = reddit;
    const thing = index2 && thingAtIndex(index2);
    if (index2 && isOldReddit) {
      return `${thing} ${old.vote.downmod}, ${thing} ${old.vote.upmod}`;
    }
    if (!index2 && isOldReddit) {
      return `${old.vote.downmod},${old.vote.upmod}`;
    }
    if (index2 && !isOldReddit) {
      return `${thing} ${latest.vote.pressed}`;
    }
    return latest.vote.pressed;
  }
  function vote(type, index3) {
    let q = "";
    if (type === "up")
      q = getVoteSelector("up", index3);
    if (type === "down")
      q = getVoteSelector("down", index3);
    if (type === "clear")
      q = getClearVoteSelector(index3);
    clickIfExists(q);
  }
  function getCollapseBtnSelector() {
    const { post, special, comments } = reddit.old;
    const { comment } = comments;
    const oldCommentBtnSelector = `${comment.select}${special.notCollapsed} ${comment.expandBtn}`;
    const newCommentBtnSelector = reddit.latest.comments.threadline;
    return { postExpBtn: isOldReddit ? `${post.expandBtn}${special.expanded}` : "", comExpBtn: isOldReddit ? oldCommentBtnSelector : newCommentBtnSelector };
  }
  function getExpandableElementsSelectors() {
    const { comments, special, post } = reddit.old;
    const selectors = { comExpBtn: "", postExpBtn: "", comment: "" };
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
    const { postExpBtn, comExpBtn, comment } = getExpandableElementsSelectors();
    const mainItem = !!postExpBtn && select(postExpBtn) || null;
    if (mainItem && PluginBase.util.isVisible(mainItem))
      mainItem.click();
    else {
      const itemsSelector = isOldReddit ? comment : comExpBtn;
      let el;
      const items = Array.from(selectAll(itemsSelector));
      for (el of items.reverse()) {
        if (PluginBase.util.isVisible(el)) {
          if (isOldReddit) {
            return select(comExpBtn, el).click();
          } else {
            return clickIfDisplayed(el.parentNode);
          }
        }
      }
    }
  }
  async function expandAll() {
    const { comment, comExpBtn } = getExpandableElementsSelectors();
    const selector = isOldReddit ? `${comment} ${comExpBtn}` : comExpBtn;
    for (let el of selectAll(selector)) {
      if (isOldReddit) {
        el.click();
      } else {
        clickIfDisplayed(el.parentNode);
      }
    }
  }
  function collapseCurrent() {
    const { postExpBtn, comExpBtn } = getCollapseBtnSelector();
    const postBtn = !!postExpBtn && select(postExpBtn) || null;
    const commentBtns = selectAll(comExpBtn);
    postBtn && PluginBase.util.isVisible(postBtn) && postBtn.click();
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
    observer == null ? void 0 : observer.disconnect();
    observer = null;
  }
  function onLoad() {
    currentRoute = location.href;
    const { old, latest } = reddit;
    isOldReddit = !!select(old.post.thing);
    if (isDOMLoaded)
      return;
    const postSelector = isOldReddit ? old.post.thing : latest.post.thing;
    posts = selectAll(postSelector);
    isDOMLoaded = true;
    addRedditAPostsAttributes(posts, isOldReddit);
    if (!isOldReddit) {
      window.addEventListener("click", onClick);
      scrollContainer = setParentContainer(posts);
      scrollContainer && createObserver(scrollContainer);
    }
  }
  function onPopState() {
    console.log("pop state event handler called");
    waitPostsLoading(() => {
      if (location.hostname.endsWith("reddit.com")) {
        isDOMLoaded = false;
        index = 0;
        onLoad();
        toggleContext(COMMENTS_REGX.test(location.href));
      } else {
        PluginBase.util.removeContext("Post List", "Post");
      }
    }, 200);
  }
  function onClick() {
    setTimeout(() => {
      if (currentRoute === location.href)
        return;
      dispatchEvent("popstate");
    });
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
  function dispatchEvent(eventName) {
    const event = new Event(eventName);
    window.dispatchEvent(event);
  }
  var Reddit_default = { ...PluginBase, ...{ "init": async () => {
    if (location.hostname.endsWith("reddit.com")) {
      console.log("init");
      toggleContext(COMMENTS_REGX.test(location.href));
      window.addEventListener("load", onLoad);
      window.addEventListener("popstate", onPopState);
      await PluginBase.util.ready();
      setTimeout(() => {
        if (!isDOMLoaded)
          dispatchEvent("load");
      }, 2e3);
    }
  }, "destroy": () => {
    resetDomState();
    PluginBase.util.removeContext("Post List", "Post");
    window.removeEventListener("load", onLoad);
    !isOldReddit && window.removeEventListener("popstate", onPopState);
    !isOldReddit && window.removeEventListener("click", onClick);
  }, "commands": { "Go to Reddit": { "pageFn": () => {
    document.location.href = "https://www.reddit.com";
  } } } } };
  return Reddit_default;
})();
