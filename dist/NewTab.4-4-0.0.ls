import PluginBase from 'chrome-extension://lnnmjmalakahagblkkcnjkoaihlfglon/dist/modules/plugin-base.js';import ExtensionUtil from 'chrome-extension://lnnmjmalakahagblkkcnjkoaihlfglon/dist/modules/extension-util.js';// dist/tmp/NewTab/NewTab.js
var NewTab_default = { "languages": {}, "niceName": "New tab", "description": "Create a new empty tab.", "version": "4.4.0", "apiVersion": 2, "match": /.*/, "homophones": { "open tab": "new tab" }, "authors": "Aparajita Fishman", "commands": [{ "name": "New tab", "description": "Create a new empty tab.", "global": true, "match": "new tab", "fn": async () => {
  chrome.tabs.create({ active: true });
} }] };
export {
  NewTab_default as default
};
LS-SPLITLS-SPLIT