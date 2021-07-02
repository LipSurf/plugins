// dist/tmp/Anki/Anki.js
var Anki_default = { ...PluginBase, languages: {}, niceName: "Anki", description: "Anki web flashcard functionality.", version: "4.0.2", apiVersion: 2, match: [/^https:\/\/ankiweb\.net/, /^https:\/\/ankiuser\.net/], homophones: { "and key": "anki", "show insta": "show answer", "show enter": "show answer", "show cancer": "show answer", "should i answer": "show answer", "show me answer": "show answer" }, authors: "Miko", commands: [{ name: "Anki", description: "Go to ankiweb decks page.", match: "anki", global: !0, pageFn: async () => {
  window.location.href = "https://ankiweb.net/decks/";
} }, { name: "Select Answer Difficulty", description: "Select the ease level after seeing the answer.", match: ["again", "hard", "good", "easy"], pageFn: async ({ preTs, normTs }) => {
  let capitalized = normTs.charAt(0).toUpperCase() + normTs.slice(1);
  document.evaluate(`//*[@id='easebuts']//button[contains(text(), "${capitalized}")]`, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE).singleNodeValue.click();
} }, { name: "Show Answer", description: "Show the other side of the flash card.", match: "show answer", pageFn: async () => {
  document.querySelector("#ansbuta").click();
} }] }, dumby_default = Anki_default;
export {
  dumby_default as default
};
LS-SPLIT// dist/tmp/Anki/Anki.js
allPlugins.Anki = (() => ({ ...PluginBase, commands: { Anki: { pageFn: async () => {
  window.location.href = "https://ankiweb.net/decks/";
} }, "Select Answer Difficulty": { pageFn: async ({ preTs, normTs }) => {
  let capitalized = normTs.charAt(0).toUpperCase() + normTs.slice(1);
  document.evaluate(`//*[@id='easebuts']//button[contains(text(), "${capitalized}")]`, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE).singleNodeValue.click();
} }, "Show Answer": { pageFn: async () => {
  document.querySelector("#ansbuta").click();
} } } }))();
LS-SPLIT// dist/tmp/Anki/Anki.js
allPlugins.Anki = (() => ({ ...PluginBase, commands: { Anki: { pageFn: async () => {
  window.location.href = "https://ankiweb.net/decks/";
} } } }))();
