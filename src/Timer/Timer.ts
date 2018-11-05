/// <reference path="../@types/plugin-interface.d.ts"/>
namespace TimerPlugin {
    declare const PluginBase: IPlugin;

    interface ITimerPlugin extends IPlugin {
        SET_TIMER_REGX: RegExp;
        PARTIAL_SET_TIMER_REGX: RegExp;
    }

    export let Plugin: ITimerPlugin = Object.assign({}, PluginBase, {
        niceName: 'Timer',
        description: 'Tools for setting timers.',
        match: /.*/,
        author: 'Miko',
        SET_TIMER_REGX: /^set (?:(.*) )?timer (?:for )?(\d+) (seconds|minutes?|hours?)$/,
        PARTIAL_SET_TIMER_REGX: /^set\b(.* )?(timer)?/,
        commands: [
            {
                name: 'Set Timer',
                description: 'Shows a notification and speaks "timer elapsed" (audio) after the specified duration.',
                global: true,
                match: {
                    description: 'Say "set [timer name (optional)] timer for x seconds/minutes/hours"',
                    fn: (transcript: string) => {
                        let fullMatch = transcript.match(Plugin.SET_TIMER_REGX);
                        if (fullMatch) {
                            return fullMatch;
                        } else if (Plugin.PARTIAL_SET_TIMER_REGX.test(transcript)) {
                            // ideally it would be smarter than just testing (open) but that functionality 
                            // should be built into the recognizer
                            return false;
                        }
                    }
                },
                fn: async (transcript: string, fullMatch: string, timerName: string, quantity: string, unit: string) => {
                    let seconds = Number(quantity);
                    if (unit.startsWith('minute'))
                        seconds *= 60;
                    else if (unit.startsWith('hour'))
                        seconds *= 3600;

                    setTimeout(() => {
                        let title = `${(timerName ? timerName : '')} timer elapsed.`.trimLeft();
                        title = title[0].toUpperCase() + title.slice(1, title.length);
                        chrome.notifications.create({
                            type: 'basic',
                            title,
                            message: '',
                            iconUrl: 'assets/icon-timer-48.png',
                            requireInteraction: true
                        });
                        chrome.tts.speak(title);
                    }, seconds * 1000);
                }
            }],
    });
}
