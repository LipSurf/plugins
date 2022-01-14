import PluginBase from 'chrome-extension://lnnmjmalakahagblkkcnjkoaihlfglon/dist/modules/plugin-base.js';import ExtensionUtil from 'chrome-extension://lnnmjmalakahagblkkcnjkoaihlfglon/dist/modules/extension-util.js';// dist/tmp/CopyCutPaste/CopyCutPaste.js
function ensurePermission(perm) {
  return new Promise((cb) => {
    chrome.permissions.contains({ permissions: [perm] }, (granted1) => {
      if (granted1) {
        cb(true);
      } else {
        chrome.permissions.request({ permissions: [perm] }, (granted) => {
          cb(granted);
        });
      }
    });
  });
}
var CopyCutPaste_default = { "languages": { "ja": { "niceName": "コピー, 切り取り, 貼り付け", "description": "このプラグインの使用前にマウスで権限を与える必要があります。", "authors": "Hiroki Yamazaki, Miko", "commands": { "Copy": { "name": "コピー", "description": "選択されたテキストをクリップボードにコピーします。", "match": "こぴー" }, "Cut": { "name": "切り取り", "description": "選択されたテキストをクリップボードに切り取ります。", "match": ["かっと", "きりとり"] }, "Paste": { "name": "貼り付け", "description": "クリップボードの内容を貼り付けます。", "match": ["はりつけ", "ぺーすと"] } } } }, "niceName": "Copy, Cut and Paste", "description": "Permissions must be granted with the mouse the first time this plugin is used.", "version": "4.4.0", "apiVersion": 2, "match": /.*/, "homophones": { "coffee": "copy", "poppee": "copy", "pissed": "paste", "taste": "paste" }, "authors": "Miko", "commands": [{ "name": "Copy", "description": "Copies the selected text to the clipboard.", "match": "copy", "fn": async () => {
  await ensurePermission("clipboardWrite");
} }, { "name": "Cut", "description": "Cut the selected text to the clipboard.", "match": "cut", "fn": async () => {
  await ensurePermission("clipboardWrite");
} }, { "name": "Paste", "description": "Paste the item in the clipboard.", "match": "paste", "fn": async () => {
  await ensurePermission("clipboardRead");
} }] };
export {
  CopyCutPaste_default as default
};
LS-SPLIT// dist/tmp/CopyCutPaste/CopyCutPaste.js
allPlugins.CopyCutPaste = (() => {
  function ensurePermission(perm) {
    return new Promise((cb) => {
      chrome.permissions.contains({ permissions: [perm] }, (granted1) => {
        if (granted1) {
          cb(true);
        } else {
          chrome.permissions.request({ permissions: [perm] }, (granted) => {
            cb(granted);
          });
        }
      });
    });
  }
  var CopyCutPaste_default = { ...PluginBase, ...{ "commands": { "Copy": { "pageFn": async () => {
    document.execCommand("copy");
  } }, "Cut": { "pageFn": async () => {
    document.execCommand("cut");
  } }, "Paste": { "pageFn": async () => {
    document.execCommand("paste");
  } } } } };
  return CopyCutPaste_default;
})();
LS-SPLIT