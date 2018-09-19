/// <reference path="../@types/plugin-interface.d.ts"/>
namespace AntiProcrastinationPlugin {
    declare const PluginBase: IPlugin;

    interface IAntiProcrastinationPlugin extends IPlugin {
        OPEN_X_FOR_Y_TIME_REGX: RegExp;
    }

    export let Plugin = Object.assign({}, PluginBase, {
        niceName: 'Anti-procrastination',
        description: 'Tools for curbing procrastination.',
        match: /.*/,
        author: 'Miko',
        OPEN_X_FOR_Y_TIME_REGX: /open (.*) for (\d+) (seconds|minutes?|hours?)/,
        commands: [
            {
                name: 'Self Destructing Tab',
                description: 'Open a new tab with x website for y time. Useful for limiting the time-sucking power of sites like facebook, reddit, twitter etc.',
                global: true,
                match: {
                    description: 'Say "open [website name] for x seconds/minutes/hours"',
                    fn: (transcript: string) => {
                        return transcript.match(Plugin.OPEN_X_FOR_Y_TIME_REGX);
                    }
                },
                fn: async (fullMatch: string, siteStr: string, secondsStr: string, unit: string) => {
                    let seconds = Number(secondsStr);
                    if (unit.startsWith('minute'))
                        seconds *= 60;
                    else if (unit.startsWith('hour'))
                        seconds *= 3600;
                    let site = `https://${siteStr.replace(/\s+/g, '').replace('.com', '').replace('dot com', '')}.com`;
                    let id = chrome.tabs.create({
                        url: site,
                        active: true,
                    }, (tab) => {
                        setTimeout(() => {
                            chrome.tabs.remove(tab.id);
                        }, seconds * 1000);
                    });
                }
            }],
    });
}
