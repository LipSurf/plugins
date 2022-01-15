import PluginBase from 'chrome-extension://lnnmjmalakahagblkkcnjkoaihlfglon/dist/modules/plugin-base.js';import ExtensionUtil from 'chrome-extension://lnnmjmalakahagblkkcnjkoaihlfglon/dist/modules/extension-util.js';// dist/tmp/Reddit/Reddit.js
var thingAttr = `${PluginBase.util.getNoCollisionUniqueAttr()}-thing`;
var isOldReddit = /https:\/\/old/.test(window.location.href);
var Reddit_default = { "languages": { "ja": { "niceName": "レディット", "description": "Redditで操作します", "authors": "Miko", "commands": { "View Comments": { "name": "コメントを診ます", "match": ["こめんと#"] } } }, "ru": { "niceName": "Реддит", "description": "Команды для сайта Reddit.com", "authors": "Hanna, Miko", "homophones": { "reddit": "реддит", "голоса": "голос за" }, "commands": { "View Comments": { "name": "Открыть комментарии", "description": "Открывает комментарии к посту названного номера.", "match": ["[комментарии/комменты] к #"] }, "Visit Post": { "name": "Открыть пост", "description": "Кликает пост названного номера.", "match": ["открыть пост[/ #]"] }, "Visit Current": { "name": "Открыть пост", "description": "Кликает пост.", "match": ["открыть пост"] }, "Expand": { "name": "Развернуть", "description": "Развернуть превью поста или комментария названного номера.", "match": ["развернуть #", "# развернуть"] }, "Expand Current": { "name": "Развернуть", "description": "Развернуть превью поста или комментария.", "match": "развернуть" }, "Collapse": { "name": "Свернуть", "description": "Свернуть развернутый пост или комментарий. Если не назван номер, автоматически сворачивает самый верхний пост/ комментарий в пределах экрана.", "match": ["[свернуть/закрыть] #"] }, "Collapse Current": { "name": "Свернуть", "description": "Свернуть развернутый пост или комментарий. Если не назван номер, автоматически сворачивает самый верхний пост/ комментарий в пределах экрана.", "match": ["свернуть", "закрыть"] }, "Go to Reddit": { "name": "Открыть реддит", "description": "Переходит на сайт reddit.com", "match": "реддит" }, "Clear Vote": { "name": "Убрать голос", "description": "Убирает последний голос за или против последнего поста или поста названного номера", "match": "убрать голос #" }, "Clear Vote Current": { "name": "Убрать голос", "description": "Убирает последний голос за или против последнего поста или поста", "match": "убрать голос" }, "Downvote": { "name": "Голос против", "description": "Голосует поста названного # (пока нет поддержки комментариев)", "match": "голос против #" }, "Downvote Current": { "name": "Голос против", "description": "Голосует против данного поста (пока нет поддержки комментариев)", "match": "голос против" }, "Upvote": { "name": "Голос за", "description": "Голосует за пост названного # (пока нет поддержки комментариев)", "match": "голос за #" }, "Upvote Current": { "name": "Голос за", "description": "Голосует за данный пост (пока нет поддержки комментариев)", "match": "голос за" }, "Expand All Comments": { "name": "Показать все комментарии", "description": "Открывает все комментарии к данному посту", "match": ["[показать/открыть] все комментарии"] } } } }, "niceName": "Reddit", "description": "Commands for Reddit.com", "version": "4.4.0", "apiVersion": 2, "match": /^https?:\/\/.*\.reddit.com/, "authors": "Miko", "homophones": { "navigate": "go", "contract": "collapse", "claps": "collapse", "expense": "expand", "explain": "expand", "expanding": "expand", "expand noun": "expand 9", "it's been": "expand", "expanse": "expand", "expanded": "expand", "stand": "expand", "xpand": "expand", "xmen": "expand", "spend": "expand", "span": "expand", "spell": "expand", "spent": "expand", "reddit dot com": "reddit", "read it": "reddit", "shrink": "collapse", "advert": "upvote", "download": "downvote" }, "contexts": { "Post List": { "commands": ["View Comments", "Visit Post", "Expand", "Collapse", "Upvote", "Downvote", "Clear Vote"] }, "Post": { "commands": ["Upvote Current", "Downvote Current", "Clear Vote Current", "Visit Current", "Expand Current", "Collapse Current", "Expand All Comments"] } }, "commands": [{ "name": "Go to Reddit", "global": true, "match": ["[/go to ]reddit"], "minConfidence": 0.5 }, { "name": "Go to Subreddit", "match": { "fn": () => {
}, "description": "go to/show r [subreddit name] (do not say slash)" }, "isFinal": true, "nice": (transcript, matchOutput) => {
  return `go to r/${matchOutput}`;
} }, { "name": "View Comments", "description": "View the comments of a reddit post.", "match": ["comments #", "# comments"], "normal": false }, { "name": "Visit Post", "description": "Equivalent of clicking a reddit post.", "match": ["visit #", "# visit"], "normal": false }, { "name": "Expand", "description": "Expand a preview of a post, or a comment by it's position (rank).", "match": ["expand #", "# expand"], "normal": false }, { "name": "Collapse", "description": "Collapse an expanded preview (or comment if viewing comments). Defaults to topmost in the view port.", "match": ["collapse #", "# collapse"], "normal": false }, { "name": "Upvote", "match": ["upvote #", "# upvote"], "description": "Upvote the post # (doesn't work for comments yet)", "normal": false }, { "name": "Downvote", "match": ["downvote #", "# downvote"], "description": "Downvote the post # (doesn't work for comments yet)", "normal": false }, { "name": "Clear Vote", "description": "Unsets the upvote/downvote so it's neither up or down.", "match": ["[clear/reset] vote #", "# [clear/reset] vote"], "normal": false }, { "name": "Upvote Current", "match": "upvote", "description": "Upvote the current post.", "normal": false }, { "name": "Downvote Current", "match": "downvote", "description": "Downvote the post # (doesn't work for comments yet)", "normal": false }, { "name": "Clear Vote Current", "description": "Unsets the upvote/downvote so it's neither up or down.", "match": ["[clear/reset] vote"], "normal": false }, { "name": "Visit Current", "description": "Click the link for the post that we're in.", "match": "visit", "normal": false }, { "name": "Expand Current", "description": "Expand the post that we're in.", "match": "expand", "normal": false }, { "name": "Collapse Current", "description": "Collapse the current post that we're in.", "match": ["collapse", "close"], "normal": false }, { "name": "Expand All Comments", "description": "Expands all the comments.", "match": ["expand all[/ comments]"], "normal": false }] };
export {
  Reddit_default as default
};
LS-SPLIT// dist/tmp/Reddit/Reddit.js
allPlugins.Reddit = (() => {
  var thingAttr = `${PluginBase.util.getNoCollisionUniqueAttr()}-thing`;
  var COMMENTS_REGX = /reddit.com\/r\/[^\/]*\/comments\//;
  var isOldReddit = /https:\/\/old/.test(window.location.href);
  var postSelector = isOldReddit ? "#siteTable>div.thing" : ".Post";
  var scrollContainer = null;
  var observer = null;
  var posts = null;
  var index = 0;
  function thingAtIndex(i) {
    return `#siteTable>div.thing[${thingAttr}="${i}"]`;
  }
  function clickIfExists(selector) {
    const el = document.querySelector(selector);
    if (el)
      el.click();
  }
  function genPostNumberElement(number) {
    const span = document.createElement("span");
    span.textContent = number;
    span.style.cssText = "position: absolute; bottom: 2px; right: 2px; font-weight: 700; opacity: .3";
    return span;
  }
  function setAttributes(el) {
    if (el && getComputedStyle(el).display !== "none") {
      index += 1;
      el.setAttribute(thingAttr, `${index}`);
      el.style.position = "relative";
      el.appendChild(genPostNumberElement(index));
    }
  }
  function addOldRedditPostsAttributes(posts1) {
    posts1.forEach((el) => {
      index += 1;
      el.setAttribute(thingAttr, `${index}`);
      const rank = el.querySelector(".rank");
      rank.style.cssText = "display:block;margin-right:10px;opacity:1 !important;";
    });
  }
  function addNewRedditPostsAttributes(posts2) {
    posts2.forEach(setAttributes);
  }
  function observerCallback(mutationList) {
    mutationList.forEach((it) => {
      it.addedNodes.forEach((node) => setAttributes(node.querySelector(postSelector)));
    });
  }
  function onLoad() {
    posts = document.querySelectorAll(postSelector);
    if (isOldReddit) {
      addOldRedditPostsAttributes(posts);
    } else {
      observer = new MutationObserver(observerCallback);
      scrollContainer = posts[0].parentNode.parentNode.parentNode;
      observer.observe(scrollContainer, { childList: true });
      addNewRedditPostsAttributes(posts);
    }
  }
  function vote(type, index1) {
    console.log("voting", type, index1);
    let q;
    switch (type) {
      case "up":
        if (index1)
          q = `${thingAtIndex(index1)} .arrow.up:not(.upmod)`;
        else
          q = `#siteTable *[role="button"][aria-label="upvote"]:not(.upmod)`;
        break;
      case "down":
        if (index1)
          q = `${thingAtIndex(index1)} .arrow.down:not(.downmod)`;
        else
          q = `#siteTable *[role="button"][aria-label="downvote"]:not(.downmod)`;
        break;
      default:
        if (index1)
          q = `${thingAtIndex(index1)} .arrow.downmod,${thingAtIndex(index1)} .arrow.upmod`;
        else
          q = `#siteTable *[role="button"][aria-label="downvote"].arrow.downmod,#siteTable *[role="button"][aria-label="upvote"].arrow.upmod`;
        break;
    }
    clickIfExists(q);
  }
  var Reddit_default = { ...PluginBase, ...{ "init": async () => {
    if (document.location.hostname.endsWith("reddit.com")) {
      console.log("init");
      if (COMMENTS_REGX.test(document.location.href)) {
        PluginBase.util.prependContext("Post");
        PluginBase.util.removeContext("Post List");
      } else {
        PluginBase.util.prependContext("Post List");
        PluginBase.util.removeContext("Post");
      }
      await PluginBase.util.ready();
      window.addEventListener("load", onLoad);
    }
  }, "destroy": () => {
    PluginBase.util.removeContext("Post List", "Post");
    observer && observer.disconnect();
    window.removeEventListener("load", onLoad);
  }, "commands": { "Go to Reddit": { "pageFn": () => {
    document.location.href = "https://old.reddit.com";
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
    window.location.href = `https://old.reddit.com/r/${subredditName}`;
  } }, "View Comments": { "pageFn": (transcript, index2) => {
    if (isOldReddit) {
      clickIfExists(thingAtIndex(index2) + " a.comments");
    } else {
      console.log("its not all version");
    }
  } }, "Visit Post": { "pageFn": (transcript, index3) => {
    clickIfExists(thingAtIndex(index3) + " a.title");
  } }, "Expand": { "pageFn": (transcript, index4) => {
    const el = document.querySelector(`${thingAtIndex(index4)} .expando-button.collapsed`);
    el.click();
    PluginBase.util.scrollToAnimated(el, -25);
  } }, "Collapse": { "pageFn": (transcript, index5) => {
    const el = document.querySelector(thingAtIndex(index5) + " .expando-button:not(.collapsed)");
    el.click();
  } }, "Upvote": { "pageFn": (transcript, index6) => {
    vote("up", index6);
  } }, "Downvote": { "pageFn": (transcript, index7) => {
    vote("down", index7);
  } }, "Clear Vote": { "pageFn": (transcript, index8) => {
    vote("clear", index8);
  } }, "Upvote Current": { "pageFn": () => vote("up") }, "Downvote Current": { "pageFn": () => vote("down") }, "Clear Vote Current": { "pageFn": () => vote("clear") }, "Visit Current": { "pageFn": () => clickIfExists("#siteTable p.title a.title") }, "Expand Current": { "pageFn": () => {
    const mainItem = document.querySelector(`#siteTable .thing .expando-button.collapsed`);
    const commentItems = Array.from(document.querySelectorAll(`.commentarea > div > .thing.collapsed`));
    if (mainItem && PluginBase.util.isVisible(mainItem)) {
      mainItem.click();
    } else {
      let el;
      for (el of commentItems.reverse()) {
        if (PluginBase.util.isVisible(el)) {
          el.querySelector(".comment.collapsed a.expand").click();
          return;
        }
      }
    }
  } }, "Collapse Current": { "pageFn": () => {
    for (const el of document.querySelectorAll(`#siteTable .thing .expando-button.expanded, .commentarea > div > div.thing:not(.collapsed) > div > p > a.expand`)) {
      if (PluginBase.util.isVisible(el)) {
        el.click();
        break;
      }
    }
  } }, "Expand All Comments": { "pageFn": async () => {
    for (let el of document.querySelectorAll(".thing.comment.collapsed a.expand")) {
      el.click();
    }
  } } } } };
  return Reddit_default;
})();
LS-SPLIT// dist/tmp/Reddit/Reddit.js
allPlugins.Reddit = (() => {
  var thingAttr = `${PluginBase.util.getNoCollisionUniqueAttr()}-thing`;
  var COMMENTS_REGX = /reddit.com\/r\/[^\/]*\/comments\//;
  var isOldReddit = /https:\/\/old/.test(window.location.href);
  var postSelector = isOldReddit ? "#siteTable>div.thing" : ".Post";
  var scrollContainer = null;
  var observer = null;
  var posts = null;
  var index = 0;
  function thingAtIndex(i) {
    return `#siteTable>div.thing[${thingAttr}="${i}"]`;
  }
  function clickIfExists(selector) {
    const el = document.querySelector(selector);
    if (el)
      el.click();
  }
  function genPostNumberElement(number) {
    const span = document.createElement("span");
    span.textContent = number;
    span.style.cssText = "position: absolute; bottom: 2px; right: 2px; font-weight: 700; opacity: .3";
    return span;
  }
  function setAttributes(el) {
    if (el && getComputedStyle(el).display !== "none") {
      index += 1;
      el.setAttribute(thingAttr, `${index}`);
      el.style.position = "relative";
      el.appendChild(genPostNumberElement(index));
    }
  }
  function addOldRedditPostsAttributes(posts1) {
    posts1.forEach((el) => {
      index += 1;
      el.setAttribute(thingAttr, `${index}`);
      const rank = el.querySelector(".rank");
      rank.style.cssText = "display:block;margin-right:10px;opacity:1 !important;";
    });
  }
  function addNewRedditPostsAttributes(posts2) {
    posts2.forEach(setAttributes);
  }
  function observerCallback(mutationList) {
    mutationList.forEach((it) => {
      it.addedNodes.forEach((node) => setAttributes(node.querySelector(postSelector)));
    });
  }
  function onLoad() {
    posts = document.querySelectorAll(postSelector);
    if (isOldReddit) {
      addOldRedditPostsAttributes(posts);
    } else {
      observer = new MutationObserver(observerCallback);
      scrollContainer = posts[0].parentNode.parentNode.parentNode;
      observer.observe(scrollContainer, { childList: true });
      addNewRedditPostsAttributes(posts);
    }
  }
  function vote(type, index1) {
    console.log("voting", type, index1);
    let q;
    switch (type) {
      case "up":
        if (index1)
          q = `${thingAtIndex(index1)} .arrow.up:not(.upmod)`;
        else
          q = `#siteTable *[role="button"][aria-label="upvote"]:not(.upmod)`;
        break;
      case "down":
        if (index1)
          q = `${thingAtIndex(index1)} .arrow.down:not(.downmod)`;
        else
          q = `#siteTable *[role="button"][aria-label="downvote"]:not(.downmod)`;
        break;
      default:
        if (index1)
          q = `${thingAtIndex(index1)} .arrow.downmod,${thingAtIndex(index1)} .arrow.upmod`;
        else
          q = `#siteTable *[role="button"][aria-label="downvote"].arrow.downmod,#siteTable *[role="button"][aria-label="upvote"].arrow.upmod`;
        break;
    }
    clickIfExists(q);
  }
  var Reddit_default = { ...PluginBase, ...{ "init": async () => {
    if (document.location.hostname.endsWith("reddit.com")) {
      console.log("init");
      if (COMMENTS_REGX.test(document.location.href)) {
        PluginBase.util.prependContext("Post");
        PluginBase.util.removeContext("Post List");
      } else {
        PluginBase.util.prependContext("Post List");
        PluginBase.util.removeContext("Post");
      }
      await PluginBase.util.ready();
      window.addEventListener("load", onLoad);
    }
  }, "destroy": () => {
    PluginBase.util.removeContext("Post List", "Post");
    observer && observer.disconnect();
    window.removeEventListener("load", onLoad);
  }, "commands": { "Go to Reddit": { "pageFn": () => {
    document.location.href = "https://old.reddit.com";
  } } } } };
  return Reddit_default;
})();
