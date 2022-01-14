import PluginBase from 'chrome-extension://lnnmjmalakahagblkkcnjkoaihlfglon/dist/modules/plugin-base.js';import ExtensionUtil from 'chrome-extension://lnnmjmalakahagblkkcnjkoaihlfglon/dist/modules/extension-util.js';// dist/tmp/HackerNews/HackerNews.js
var HackerNews_default = { "languages": { "ru": { "niceName": "Хакер Ньюс", "description": "Плагин для сайта news.ycombinator.com.", "authors": "Hanna", "homophones": { "hacker news": "хакер ньюс" }, "commands": { "Upvote": { "name": "Голосовать за", "description": "Голосует за пост названного номера", "match": ["голосовать[ за #/]"] }, "Visit Comments": { "name": "Открыть комментарии", "description": "Открывает комментарии к выбранному посту", "match": ["комментарии #"] }, "Visit Post": { "name": "Открыть пост", "description": "Кликает на пост названного номера", "match": ["открыть[ #/]"] }, "Next Page": { "name": "Следующая страница", "description": "Делает видимыми следующие посты", "match": ["следующая страница", "больше"] } } } }, "niceName": "Hacker News", "description": "Basic controls for news.ycombinator.com.", "version": "4.4.0", "apiVersion": 2, "match": /^https?:\/\/news\.ycombinator\.com/, "homophones": { "4": "more", "floor": "more" }, "authors": "Miko", "commands": [{ "name": "Hacker News", "description": "Go to news.ycombinator.com.", "global": true, "match": ["hacker news", "y combinator"] }, { "name": "Upvote", "description": "Upvote a post.", "match": ["upvote[ #/]"] }, { "name": "Visit Comments", "description": "See the comments for a given post.", "match": ["[comments/discuss] #"] }, { "name": "Visit Post", "description": "Visit a post.", "match": ["visit[ #/]"] }, { "name": "Next Page", "description": "Show more Hacker News items.", "match": ["next page", "[show /]more"] }] };
export {
  HackerNews_default as default
};
LS-SPLIT// dist/tmp/HackerNews/HackerNews.js
allPlugins.HackerNews = (() => {
  function getThingAtIndex(index) {
    return document.evaluate(`//table[contains(@class, 'itemlist')]//tr//td//*[contains(@class, 'rank')][contains(text(), "${index}")]/ancestor-or-self::tr[contains(@class, 'athing')]`, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE).singleNodeValue;
  }
  function isInComments() {
    return window.location.pathname === "/item";
  }
  function clickIfExists(el) {
    if (el)
      el.click();
  }
  var HackerNews_default = { ...PluginBase, ...{ "commands": { "Hacker News": { "pageFn": () => {
    window.location.href = "https://news.ycombinator.com/";
  } }, "Upvote": { "pageFn": (transcript, index) => {
    let parent = document;
    if (!isInComments()) {
      parent = getThingAtIndex(index);
    }
    if (parent)
      clickIfExists(parent.querySelector('.votearrow[title="upvote"]'));
  } }, "Visit Comments": { "pageFn": (transcript, index) => {
    let thing = getThingAtIndex(index);
    if (thing)
      clickIfExists(thing.nextElementSibling.querySelector('.subtext a[href^="item?id="]'));
  } }, "Visit Post": { "pageFn": (transcript, index) => {
    let parent = document;
    if (!isInComments()) {
      parent = getThingAtIndex(index);
    }
    if (parent)
      clickIfExists(parent.querySelector("a.storylink"));
  } }, "Next Page": { "pageFn": (transcript, index) => {
    clickIfExists(document.querySelector("a.morelink"));
  } } } } };
  return HackerNews_default;
})();
LS-SPLIT// dist/tmp/HackerNews/HackerNews.js
allPlugins.HackerNews = (() => {
  function getThingAtIndex(index) {
    return document.evaluate(`//table[contains(@class, 'itemlist')]//tr//td//*[contains(@class, 'rank')][contains(text(), "${index}")]/ancestor-or-self::tr[contains(@class, 'athing')]`, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE).singleNodeValue;
  }
  function isInComments() {
    return window.location.pathname === "/item";
  }
  function clickIfExists(el) {
    if (el)
      el.click();
  }
  var HackerNews_default = { ...PluginBase, ...{ "commands": { "Hacker News": { "pageFn": () => {
    window.location.href = "https://news.ycombinator.com/";
  } } } } };
  return HackerNews_default;
})();
