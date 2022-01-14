import PluginBase from 'chrome-extension://lnnmjmalakahagblkkcnjkoaihlfglon/dist/modules/plugin-base.js';import ExtensionUtil from 'chrome-extension://lnnmjmalakahagblkkcnjkoaihlfglon/dist/modules/extension-util.js';// dist/tmp/DuckDuckGo/DuckDuckGo.js
var DuckDuckGo_default = { "languages": {}, "niceName": "DuckDuckGo", "description": "The duckduckgo search engine.", "version": "4.4.0", "apiVersion": 2, "match": /.*/, "homophones": { "search": "duck" }, "authors": "Aparajita Fishman", "commands": [{ "name": "Search", "description": "Do a duckduckgo search.", "global": true, "match": "duck *", "fn": (transcript, { preTs, normTs }) => {
  chrome.tabs.create({ url: `https://duckduckgo.com/?q=${preTs}`, active: true });
} }] };
export {
  DuckDuckGo_default as default
};
LS-SPLITLS-SPLIT