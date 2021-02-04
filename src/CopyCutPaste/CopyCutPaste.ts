/// <reference types="lipsurf-types/extension"/>
declare const PluginBase: IPluginBase;

function ensurePermission(perm: string) {
  return new Promise((cb) => {
    chrome.permissions.contains({ permissions: [perm] }, (granted) => {
      if (granted) {
        cb(true);
      } else {
        chrome.permissions.request({ permissions: [perm] }, (granted) => {
          cb(granted);
        });
      }
    });
  });
}

export default <IPluginBase & IPlugin>{
  ...PluginBase,
  ...{
    niceName: "Copy, Cut and Paste",
    description:
      "Permissions must be granted with the mouse the first time this plugin is used.",
    version: "3.11.3",
    match: /.*/,
    homophones: {
      coffee: "copy",
      poppee: "copy",
      pissed: "paste",
      taste: "paste",
    },
    authors: "Miko",

    commands: [
      {
        name: "Copy",
        description: "Copies the selected text to the clipboard.",
        match: "copy",
        fn: async () => {
          await ensurePermission("clipboardWrite");
        },
        pageFn: async () => {
          document.execCommand("copy");
        },
      },
      {
        name: "Cut",
        description: "Cut the selected text to the clipboard.",
        // only works with the default ease levels...
        match: "cut",
        fn: async () => {
          await ensurePermission("clipboardWrite");
        },
        pageFn: async () => {
          document.execCommand("cut");
        },
      },
      {
        name: "Paste",
        description: "Paste the item in the clipboard.",
        match: "paste",
        fn: async () => {
          await ensurePermission("clipboardRead");
        },
        pageFn: async () => {
          document.execCommand("paste");
        },
      },
    ],
  },
};
