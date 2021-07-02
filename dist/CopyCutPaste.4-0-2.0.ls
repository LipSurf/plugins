// dist/tmp/CopyCutPaste/CopyCutPaste.js
function ensurePermission(perm) {
  return new Promise((cb) => {
    chrome.permissions.contains({ permissions: [perm] }, (granted) => {
      granted ? cb(!0) : chrome.permissions.request({ permissions: [perm] }, (granted1) => {
        cb(granted1);
      });
    });
  });
}
var CopyCutPaste_default = { ...PluginBase, languages: {}, niceName: "Copy, Cut and Paste", description: "Permissions must be granted with the mouse the first time this plugin is used.", version: "4.0.2", apiVersion: 2, match: /.*/, homophones: { coffee: "copy", poppee: "copy", pissed: "paste", taste: "paste" }, authors: "Miko", commands: [{ name: "Copy", description: "Copies the selected text to the clipboard.", match: "copy", fn: async () => {
  await ensurePermission("clipboardWrite");
}, pageFn: async () => {
  document.execCommand("copy");
} }, { name: "Cut", description: "Cut the selected text to the clipboard.", match: "cut", fn: async () => {
  await ensurePermission("clipboardWrite");
}, pageFn: async () => {
  document.execCommand("cut");
} }, { name: "Paste", description: "Paste the item in the clipboard.", match: "paste", fn: async () => {
  await ensurePermission("clipboardRead");
}, pageFn: async () => {
  document.execCommand("paste");
} }] };
CopyCutPaste_default.languages.ja = { niceName: "コピー, 切り取り, 貼り付け", description: "このプラグインの使用前にマウスで権限を与える必要があります。", authors: "Hiroki Yamazaki, Miko", commands: { Copy: { name: "コピー", description: "選択されたテキストをクリップボードにコピーします。", match: "こぴー" }, Cut: { name: "切り取り", description: "選択されたテキストをクリップボードに切り取ります。", match: ["かっと", "きりとり"] }, Paste: { name: "貼り付け", description: "クリップボードの内容を貼り付けます。", match: ["はりつけ", "ぺーすと"] } } };
var dumby_default = CopyCutPaste_default;
export {
  dumby_default as default
};
LS-SPLIT// dist/tmp/CopyCutPaste/CopyCutPaste.js
allPlugins.CopyCutPaste = (() => {
  function ensurePermission(perm) {
    return new Promise((cb) => {
      chrome.permissions.contains({ permissions: [perm] }, (granted) => {
        granted ? cb(!0) : chrome.permissions.request({ permissions: [perm] }, (granted1) => {
          cb(granted1);
        });
      });
    });
  }
  return { ...PluginBase, commands: { Copy: { pageFn: async () => {
    document.execCommand("copy");
  } }, Cut: { pageFn: async () => {
    document.execCommand("cut");
  } }, Paste: { pageFn: async () => {
    document.execCommand("paste");
  } } } };
})();
LS-SPLIT