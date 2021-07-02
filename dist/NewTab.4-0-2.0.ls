// dist/tmp/NewTab/NewTab.js
var NewTab_default = { ...PluginBase, languages: {}, niceName: "New tab", description: "Create a new empty tab.", version: "4.0.2", apiVersion: 2, match: /.*/, homophones: { "open tab": "new tab" }, authors: "Aparajita Fishman", commands: [{ name: "New tab", description: "Create a new empty tab.", global: !0, match: "new tab", fn: async () => {
  chrome.tabs.create({ active: !0 });
} }] }, dumby_default = NewTab_default;
export {
  dumby_default as default
};
LS-SPLITLS-SPLIT