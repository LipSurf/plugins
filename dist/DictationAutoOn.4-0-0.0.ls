import PluginBase from 'chrome-extension://lnnmjmalakahagblkkcnjkoaihlfglon/dist/modules/plugin-base.js';import ExtensionUtil from 'chrome-extension://lnnmjmalakahagblkkcnjkoaihlfglon/dist/modules/extension-util.js';// dist/tmp/DictationAutoOn/DictationAutoOn.js
var DictationAutoOn_default = {
  ...PluginBase,
  languages: {},
  niceName: "Dictation Auto On",
  description: "Automatically go into dictation mode when LipSurf is turned on.",
  version: "4.0.0",
  match: /.*/,
  authors: "Miko",
  init: () => {
    PluginBase.util.enterContext(["Dictate"]);
  },
  commands: []
}, dumby_default = DictationAutoOn_default;
export {
  dumby_default as default
};
LS-SPLIT// dist/tmp/DictationAutoOn/DictationAutoOn.js
allPlugins.DictationAutoOn = (() => ({...PluginBase, init: () => {
  PluginBase.util.enterContext(["Dictate"]);
}, commands: {}}))();
LS-SPLIT// dist/tmp/DictationAutoOn/DictationAutoOn.js
allPlugins.DictationAutoOn = (() => ({...PluginBase, init: () => {
  PluginBase.util.enterContext(["Dictate"]);
}, commands: {}}))();
