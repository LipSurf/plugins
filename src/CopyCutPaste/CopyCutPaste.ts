import { PluginBase } from '../PluginBase';

export module CopyCutPastePlugin {
    interface ICopyCutPastePlugin extends IPlugin {
        ensurePermission: (perm: string) => Promise<boolean>;
    }

    export let Plugin: ICopyCutPastePlugin & IPluginBase = Object.assign<{}, IPluginBase, ICopyCutPastePlugin>({}, PluginBase, {
        niceName: 'Copy, Cut and Paste',
        version: '1.0.0',
        apiVersion: '1',
        match: /.*/,
        homophones: {
            'coffee': 'copy',
            'poppee': 'copy',
        },
        authors: "Miko",

        ensurePermission: (perm: string) => {
            return new Promise(cb => {
                chrome.permissions.contains({permissions: [perm]}, granted => {
                    if (granted) {
                        cb(true);
                    } else {
                        chrome.permissions.request({permissions: [perm]}, granted => {
                            cb(granted);
                        });
                    }
                });
            });
        },

        commands: [
            {
                name: 'Copy',
                description: 'Copies the selected text to the clipboard.',
                match: 'copy',
                fn: async () => {
                    await Plugin.ensurePermission('clipboardWrite');
                },
                pageFn: async () => {
                    document.execCommand('copy');
                }
            },
            {
                name: 'Cut',
                description: "Cut the selected text to the clipboard.",
                // only works with the default ease levels...
                match: 'cut',
                fn: async () => {
                    await Plugin.ensurePermission('clipboardWrite');
                },
                pageFn: async () => {
                    document.execCommand('cut');
                }
            },
            {
                name: 'Paste',
                description: 'Paste the item in the clipboard.',
                match: 'paste',
                fn: async () => {
                    await Plugin.ensurePermission('clipboardRead');
                },
                pageFn: async () => {
                    document.execCommand('paste');
                }
            }
        ],
    });
}
