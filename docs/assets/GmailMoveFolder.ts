/// <reference path="../@types/plugin-interface.d.ts"/>
import { PluginBase } from '../PluginBase';

export module GmailPlugin {
    export let Plugin = Object.assign({}, PluginBase, {
        niceName: 'Gmail',
        match: /.*gmail.com/,
        commands: [{
            name: 'Move to Folder',
            description: 'Move already selected emails to a spoken folder',
            match: {
                description: 'Say "move to [folder name]"',
                fn: async (folderStr: string) => {
                    // if (folderStr in folders) {
                    //    ...
                    // }
                },
            },
            pageFn: async () => {
                // ...
            }
        }],
    });
}
