import PluginBase from 'chrome-extension://lnnmjmalakahagblkkcnjkoaihlfglon/dist/modules/plugin-base.js';import ExtensionUtil from 'chrome-extension://lnnmjmalakahagblkkcnjkoaihlfglon/dist/modules/extension-util.js';// dist/tmp/DuckDuckGo/DuckDuckGo.js
var DuckDuckGo_default = {
  ...PluginBase,
  languages: {},
  niceName: "DuckDuckGo",
  description: "The duckduckgo search engine.",
  version: "4.0.0",
  match: /.*/,
  homophones: {
    search: "duck"
  },
  authors: "Aparajita Fishman",
  commands: [
    {
      name: "Search",
      description: "Do a duckduckgo search.",
      global: !0,
      match: "duck *",
      fn: async (transcript, [rawTs, normTs]) => {
        chrome.tabs.create({
          url: `https://duckduckgo.com/?q=${rawTs}`,
          active: !0
        });
      }
    }
  ]
}, dumby_default = DuckDuckGo_default;
export {
  dumby_default as default
};
LS-SPLITLS-SPLIT