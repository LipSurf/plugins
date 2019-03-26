/// <reference types="lipsurf-plugin-types"/>
import { PluginBase } from '../PluginBase';

export module GmailPlugin {
    export let Plugin: IPlugin & IPluginBase = Object.assign<{}, IPluginBase, IPlugin>({}, PluginBase, {
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
