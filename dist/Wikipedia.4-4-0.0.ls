import PluginBase from 'chrome-extension://lnnmjmalakahagblkkcnjkoaihlfglon/dist/modules/plugin-base.js';import ExtensionUtil from 'chrome-extension://lnnmjmalakahagblkkcnjkoaihlfglon/dist/modules/extension-util.js';// dist/tmp/Wikipedia/Wikipedia.js
var Wikipedia_default = { "languages": { "ru": { "niceName": "Wikipedia", "description": "Поиск по Википедии.", "authors": "Hanna", "homophones": { "википедия": "wikipedia" }, "commands": { "Wikipedia": { "name": "Википедия", "description": "Выполняет поиск по википедии. Скажите википедия [запрос].", "match": ["википедия *"] } } } }, "niceName": "Wikipedia", "description": "The Wikipedia search engine.", "version": "4.4.0", "apiVersion": 2, "match": /.*/, "homophones": { "wiki": "wikipedia" }, "authors": "Aparajita Fishman", "commands": [{ "name": "Wikipedia", "description": "Do a wikipedia search.", "global": true, "match": "wikipedia *", "fn": async (transcript, searchQuery) => {
  chrome.tabs.create({ url: `https://wikipedia.org/w/index.php?search=${encodeURIComponent(searchQuery.preTs).replace(/%20/g, "+")}`, active: true });
} }] };
export {
  Wikipedia_default as default
};
LS-SPLITLS-SPLIT