/// <reference path="../@types/plugin-interface.d.ts"/>
namespace AntiProcrastinationPlugin {
    declare const PluginBase: IPlugin;

    export let Plugin = Object.assign({}, PluginBase, {
        niceName: 'Anti-procrastination',
        description: 'Helpers for overcoming procrastination.',
        match: /.*/,
        commands = [{
            name: 'Self destructing tab',
            description: 'Open a new tab with x website for y minutes. Useful for limiting the time-sucking power of sites like facebook, reddit, twitter etc.',
            global: true,
            match: 'open * for # minutes',
            pageFn: async (siteStr: string, minutes: number) => {
                console.log(`site: ${sitestr}, minutes: ${minutes}`);
            }
        }],
    });
}
