import PluginBase from 'chrome-extension://lnnmjmalakahagblkkcnjkoaihlfglon/dist/modules/plugin-base.js';import ExtensionUtil from 'chrome-extension://lnnmjmalakahagblkkcnjkoaihlfglon/dist/modules/extension-util.js';// dist/tmp/Dictionary/Dictionary.js
var Dictionary_default = { "languages": { "ja": { "niceName": "辞書", "description": "辞書で言葉をひいてごらん", "authors": "Miko", "homophones": {}, "commands": { "Lookup Word": { "name": "言葉を検索します", "description": "「言葉」をひいて", "match": "*をひく" } } } }, "niceName": "Dictionary", "description": "Quickly lookup words in an English dictionary. Switch to another language to lookup words in the language's respective dictionary.", "version": "4.4.0", "apiVersion": 2, "match": [/https?:\/\/www\.merriam-webster\.com/, /https?:\/\/www\.weblio\.jp/], "authors": "Miko", "commands": [{ "name": "Lookup Word", "description": "Lookup a word in the dictionary.", "global": true, "match": "dictionary *" }] };
export {
  Dictionary_default as default
};
LS-SPLIT// dist/tmp/Dictionary/Dictionary.js
allPlugins.Dictionary = (() => {
  var Dictionary_default = { ...PluginBase, ...{ "commands": { "Lookup Word": { "pageFn": async (transcript, { preTs, normTs }) => {
    let selectedLang = PluginBase.util.getLanguage();
    if (selectedLang.startsWith("en")) {
      window.location.href = `https://www.merriam-webster.com/dictionary/${normTs}`;
    } else {
      window.location.href = `https://www.weblio.jp/content/${normTs}`;
    }
  } } } } };
  return Dictionary_default;
})();
LS-SPLIT// dist/tmp/Dictionary/Dictionary.js
allPlugins.Dictionary = (() => {
  var Dictionary_default = { ...PluginBase, ...{ "commands": { "Lookup Word": { "pageFn": async (transcript, { preTs, normTs }) => {
    let selectedLang = PluginBase.util.getLanguage();
    if (selectedLang.startsWith("en")) {
      window.location.href = `https://www.merriam-webster.com/dictionary/${normTs}`;
    } else {
      window.location.href = `https://www.weblio.jp/content/${normTs}`;
    }
  } } } } };
  return Dictionary_default;
})();
