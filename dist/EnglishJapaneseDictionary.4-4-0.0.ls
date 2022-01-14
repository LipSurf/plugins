import PluginBase from 'chrome-extension://lnnmjmalakahagblkkcnjkoaihlfglon/dist/modules/plugin-base.js';import ExtensionUtil from 'chrome-extension://lnnmjmalakahagblkkcnjkoaihlfglon/dist/modules/extension-util.js';// dist/tmp/EnglishJapaneseDictionary/EnglishJapaneseDictionary.js
var EnglishJapaneseDictionary_default = { "languages": { "ja": { "niceName": "英語＜ー＞日本語の辞書", "description": "英語と日本語の言葉を辞書でひいてごらん。", "authors": "Miko", "commands": { "Japanese Word Lookup": { "name": "日本語の言葉を検索する", "match": "じしょ*" } } } }, "niceName": "Dictionary for Japanese Language Learners", "description": "Quickly lookup words in a English ⬌ Japanese dictionary.", "version": "4.4.0", "apiVersion": 2, "match": /https?:\/\/\.jisho\.org/, "authors": "Miko", "commands": [{ "name": "Japanese Word Lookup", "description": "Lookup an English word in an English ⬌ Japanese dictionary.", "global": true, "match": "japanese dictionary *" }] };
export {
  EnglishJapaneseDictionary_default as default
};
LS-SPLIT// dist/tmp/EnglishJapaneseDictionary/EnglishJapaneseDictionary.js
allPlugins.EnglishJapaneseDictionary = (() => {
  var EnglishJapaneseDictionary_default = { ...PluginBase, ...{ "commands": { "Japanese Word Lookup": { "pageFn": async (transcript, { preTs, normTs }) => {
    window.location.href = `https://jisho.org/search/${preTs}`;
  } } } } };
  return EnglishJapaneseDictionary_default;
})();
LS-SPLIT// dist/tmp/EnglishJapaneseDictionary/EnglishJapaneseDictionary.js
allPlugins.EnglishJapaneseDictionary = (() => {
  var EnglishJapaneseDictionary_default = { ...PluginBase, ...{ "commands": { "Japanese Word Lookup": { "pageFn": async (transcript, { preTs, normTs }) => {
    window.location.href = `https://jisho.org/search/${preTs}`;
  } } } } };
  return EnglishJapaneseDictionary_default;
})();
