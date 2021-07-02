// dist/tmp/HackerNews/HackerNews.js
function getThingAtIndex(index) {
  return document.evaluate(`//table[contains(@class, 'itemlist')]//tr//td//*[contains(@class, 'rank')][contains(text(), "${index}")]/ancestor-or-self::tr[contains(@class, 'athing')]`, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE).singleNodeValue;
}
function isInComments() {
  return window.location.pathname === "/item";
}
function clickIfExists(el) {
  el && el.click();
}
var HackerNews_default = { ...PluginBase, languages: {}, niceName: "Hacker News", description: "Basic controls for news.ycombinator.com.", version: "4.0.2", apiVersion: 2, match: /^https?:\/\/news\.ycombinator\.com/, homophones: { floor: "more", "4": "more" }, authors: "Miko", commands: [{ name: "Hacker News", description: "Go to news.ycombinator.com.", global: !0, match: ["hacker news", "y combinator"], pageFn: () => {
  window.location.href = "https://news.ycombinator.com/";
} }, { name: "Upvote", description: "Upvote a post.", match: ["upvote[ #/]"], pageFn: (transcript, index) => {
  let parent = document;
  isInComments() || (parent = getThingAtIndex(index)), parent && clickIfExists(parent.querySelector('.votearrow[title="upvote"]'));
} }, { name: "Visit Comments", description: "See the comments for a given post.", match: ["[comments/discuss] #"], pageFn: (transcript, index) => {
  let thing = getThingAtIndex(index);
  thing && clickIfExists(thing.nextElementSibling.querySelector('.subtext a[href^="item?id="]'));
} }, { name: "Visit Post", description: "Visit a post.", match: ["visit[ #/]"], pageFn: (transcript, index) => {
  let parent = document;
  isInComments() || (parent = getThingAtIndex(index)), parent && clickIfExists(parent.querySelector("a.storylink"));
} }, { name: "Next Page", description: "Show more Hacker News items.", match: ["next page", "[show /]more"], pageFn: (transcript, index) => {
  clickIfExists(document.querySelector("a.morelink"));
} }] };
HackerNews_default.languages.ru = { niceName: "Хакер Ньюс", description: "Плагин для сайта news.ycombinator.com.", authors: "Hanna", homophones: { "hacker news": "хакер ньюс" }, commands: { Upvote: { name: "Голосовать за", description: "Голосует за пост названного номера", match: ["голосовать[ за #/]"] }, "Visit Comments": { name: "Открыть комментарии", description: "Открывает комментарии к выбранному посту", match: ["комментарии #"] }, "Visit Post": { name: "Открыть пост", description: "Кликает на пост названного номера", match: ["открыть[ #/]"] }, "Next Page": { name: "Следующая страница", description: "Делает видимыми следующие посты", match: ["следующая страница", "больше"] } } };
var dumby_default = HackerNews_default;
export {
  dumby_default as default
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
    el && el.click();
  }
  return { ...PluginBase, commands: { "Hacker News": { pageFn: () => {
    window.location.href = "https://news.ycombinator.com/";
  } }, Upvote: { pageFn: (transcript, index) => {
    let parent = document;
    isInComments() || (parent = getThingAtIndex(index)), parent && clickIfExists(parent.querySelector('.votearrow[title="upvote"]'));
  } }, "Visit Comments": { pageFn: (transcript, index) => {
    let thing = getThingAtIndex(index);
    thing && clickIfExists(thing.nextElementSibling.querySelector('.subtext a[href^="item?id="]'));
  } }, "Visit Post": { pageFn: (transcript, index) => {
    let parent = document;
    isInComments() || (parent = getThingAtIndex(index)), parent && clickIfExists(parent.querySelector("a.storylink"));
  } }, "Next Page": { pageFn: (transcript, index) => {
    clickIfExists(document.querySelector("a.morelink"));
  } } } };
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
    el && el.click();
  }
  return { ...PluginBase, commands: { "Hacker News": { pageFn: () => {
    window.location.href = "https://news.ycombinator.com/";
  } } } };
})();
