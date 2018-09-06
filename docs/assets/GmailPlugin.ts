/// <reference path="../@types/plugin-interface.d.ts"/>
namespace GmailPlugin {
    declare const PluginBase: IPlugin;
    export let Plugin = Object.assign({}, PluginBase, {
        niceName: 'Gmail',
        match: /.*gmail.com/,
        commands = [{
            name: 'Compose Mail',
            description: 'Open the new email composition form in gmail',
            global: true,
            match: ['compose mail', 'write new mail'],
            pageFn: async () => { window.location.href = 'https://mail.google.com/mail/?view=cm&fs=1'; }
        }],
    });
}
