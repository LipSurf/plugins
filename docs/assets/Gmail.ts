/// <reference path="../@types/plugin-interface.d.ts"/>
import { PluginBase } from '../PluginBase';

export module GmailPlugin {
    export let Plugin = Object.assign({}, PluginBase, {
        niceName: 'Gmail',
        match: /^https:\/\/mail\.google\.com/,
        commands: [{
            name: 'Compose Mail',
            description: 'Open the new email composition form in gmail',
            global: true,
            match: ['compose mail', 'write new mail'],
            pageFn: async () => {
                window.location.href = 'https://mail.google.com/mail/?view=cm&fs=1';
            }
        }],
    });
}
