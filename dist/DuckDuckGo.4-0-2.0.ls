// dist/tmp/DuckDuckGo/DuckDuckGo.js
var DuckDuckGo_default = { ...PluginBase, languages: {}, niceName: "DuckDuckGo", description: "The duckduckgo search engine.", version: "4.0.2", apiVersion: 2, match: /.*/, homophones: { search: "duck" }, authors: "Aparajita Fishman", commands: [{ name: "Search", description: "Do a duckduckgo search.", global: !0, match: "duck *", fn: (transcript, { preTs, normTs }) => {
  chrome.tabs.create({ url: `https://duckduckgo.com/?q=${preTs}`, active: !0 });
} }] }, dumby_default = DuckDuckGo_default;
export {
  dumby_default as default
};
LS-SPLITLS-SPLIT