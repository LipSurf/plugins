/// <reference path="../@types/plugin-interface.d.ts"/>
namespace AntiProcrastinationPlugin {
    declare const PluginBase: IPlugin;

    interface IAntiProcrastinationPlugin extends IPlugin {
        OPEN_X_FOR_Y_TIME_REGX: RegExp;
        OPEN_REGX: RegExp;
        OPEN_FOR_REGX: RegExp;
    }

    export let Plugin = Object.assign({}, PluginBase, {
        niceName: 'Anti-procrastination',
        description: 'Tools for curbing procrastination.',
        match: /.*/,
        author: 'Miko',
        OPEN_X_FOR_Y_TIME_REGX: /\bopen (.*) for (\d+) (seconds|minutes?|hours?)/,
        OPEN_REGX: /\bopen\b/,
        commands: [
            {
                name: 'Self Destructing Tab',
                description: 'Open a new tab with x website for y time. Useful for limiting the time-sucking power of sites like facebook, reddit, twitter etc.',
                global: true,
                match: {
                    description: 'Say "open [website name] for x seconds/minutes/hours"',
                    fn: (transcript: string) => {
                        let fullMatch = transcript.match(Plugin.OPEN_X_FOR_Y_TIME_REGX);
                        if (fullMatch) {
                            return fullMatch;
                        } else if (Plugin.OPEN_REGX.test(transcript)) {
                            // ideally it would be smarter than just testing (open) but that functionality 
                            // should be built into the recognizer
                            return false;
                        }
                    }
                },
                // delay is needed to get more accurate site name
                delay: 600,
                fn: async (transcript: string, fullMatch: string, siteStr: string, secondsStr: string, unit: string) => {
                    let seconds = Number(secondsStr);
                    if (unit.startsWith('minute'))
                        seconds *= 60;
                    else if (unit.startsWith('hour'))
                        seconds *= 3600;
                    if (~siteStr.indexOf('hacker news'))
                        siteStr = 'news.ycombinator';
                    else if (siteStr === 'reddit')
                        // faster than the redirect
                        siteStr = 'old.reddit.com'
                    let site = `https://${siteStr.replace(/\s+/g, '').replace("'", '').replace('.com', '').replace('dot com', '')}.com`;
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
