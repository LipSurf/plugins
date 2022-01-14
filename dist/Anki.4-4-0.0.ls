import PluginBase from 'chrome-extension://lnnmjmalakahagblkkcnjkoaihlfglon/dist/modules/plugin-base.js';import ExtensionUtil from 'chrome-extension://lnnmjmalakahagblkkcnjkoaihlfglon/dist/modules/extension-util.js';// dist/tmp/Anki/Anki.js
var Anki_default = { "languages": {}, "niceName": "Anki", "description": "Anki web flashcard functionality.", "version": "4.4.0", "apiVersion": 2, "match": [/^https:\/\/ankiweb\.net/, /^https:\/\/ankiuser\.net/], "homophones": { "and key": "anki", "show insta": "show answer", "show enter": "show answer", "show cancer": "show answer", "should i answer": "show answer", "show me answer": "show answer" }, "authors": "Miko", "commands": [{ "name": "Anki", "description": "Go to ankiweb decks page.", "match": "anki", "global": true }, { "name": "Select Answer Difficulty", "description": "Select the ease level after seeing the answer.", "match": ["again", "hard", "good", "easy"] }, { "name": "Show Answer", "description": "Show the other side of the flash card.", "match": "show answer" }] };
export {
  Anki_default as default
};
LS-SPLIT// dist/tmp/Anki/Anki.js
allPlugins.Anki = (() => {
  var Anki_default = { ...PluginBase, ...{ "commands": { "Anki": { "pageFn": async () => {
    window.location.href = "https://ankiweb.net/decks/";
  } }, "Select Answer Difficulty": { "pageFn": async ({ preTs, normTs }) => {
    let capitalized = normTs.charAt(0).toUpperCase() + normTs.slice(1);
    document.evaluate(`//*[@id='easebuts']//button[contains(text(), "${capitalized}")]`, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE).singleNodeValue.click();
  } }, "Show Answer": { "pageFn": async () => {
    document.querySelector("#ansbuta").click();
  } } } } };
  return Anki_default;
})();
LS-SPLIT// dist/tmp/Anki/Anki.js
allPlugins.Anki = (() => {
  var Anki_default = { ...PluginBase, ...{ "commands": { "Anki": { "pageFn": async () => {
    window.location.href = "https://ankiweb.net/decks/";
  } } } } };
  return Anki_default;
})();
