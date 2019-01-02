/// <reference path="../@types/plugin-interface.d.ts"/>
import { AntiProcrastinationPlugin } from './AntiProcrastinationPlugin';

AntiProcrastinationPlugin.Plugin.languages.ru = {
        niceName: 'Anti-procrastination',
        description: 'Анти-прокрастинатор',
        authors: 'Hanna',
        commands: {
              'Self Destructing Tab',
                name: 'Самозакрывающаяся вкладка',
                description: 'Открывает новую вкладку только на заданное время. Удобно для ограничения пользования сайтами-времяубийцами вроде facebook, reddit, twitter etc.',
                match: {
                    description: 'Скажите "открыть [название сайта] на x секунд/минут/часов"',
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
