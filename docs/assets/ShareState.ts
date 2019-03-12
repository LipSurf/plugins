/// <reference path="../@types/plugin-interface.d.ts"/>
import { PluginBase } from '../PluginBase';

export module GmailPlugin {

    interface IFolder {
        id: string;
        name: string;
    }

    interface IMessage {
        id: string;
        subject: string;
    }

    type IFolderQuery =  { name: string; } | { id: string };

    interface IGmailPlugin extends IPlugin {
        getSelectedMessages: () => Promise<IMessage[]>;
        moveToFolder: (messages: IMessage[], q: IFolderQuery) => Promise<void>;
    }

    export let Plugin: IGmailPlugin & IPluginBase = Object.assign<{}, IPluginBase, IGmailPlugin>({}, PluginBase, {
        niceName: 'Gmail',
        match: /.*gmail.com/,
        moveToFolder: async (messages, q) => {
            // ...
        },
        getSelectedMessages: async () => {
            // return messages;
        },
        commands: [
            {
                name: 'Move to Folder',
                description: 'Move currently selected messages to a spoken folder',
                match: {
                    description: 'Say "move to [folder name]"',
                    fn: async (transcript: string) => {
                        // if (transcript in folderNames) {
                        //    ...
                        //    return [folderName];
                        // }
                    },
                },
                pageFn: async (transcript: string, folderName: string) => {
                    // ...
                    Plugin.moveToFolder(await Plugin.getSelectedMessages(), { name: folderName });
                }
            },
            {
                name: 'Move to Spam',
                description: "Move currently selected messages to the spam box",
                match: ['move to spam', 'mark as spam'],
                pageFn: async () => {
                    Plugin.moveToFolder(await Plugin.getSelectedMessages(), { name: 'Spam' });
                }
            }
        ],
    });
}
