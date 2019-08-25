/// <reference types="lipsurf-plugin-types"/>
declare const PluginBase: IPluginBase;

const SET_TIMER_REGX = /^set (?:(.*) )?timer (?:for )?(\d+) (seconds|minutes?|hours?)(?:(?: and)? (?:(?:(\d+) (seconds|minutes?))|(?:(?:a (?:(half)|(quarter))))))?/;
const PARTIAL_SET_TIMER_REGX = /^set\b(.* )?(timer)?/;

export default <IPluginBase & IPlugin> {...PluginBase, ...{
    niceName: 'Timer',
    description: 'Tools for setting timers.',
    version: '2.5.1',
    match: /.*/,
    authors: 'Miko',
    commands: [
        {
            name: 'Set Timer',
            description: 'Shows a notification and speaks "timer elapsed" (audio) after the specified duration.',
            global: true,
            match: {
                // does not handle decimals
                description: 'Say "set [timer name (optional)] timer for x seconds/minutes/hours"',
                fn: (transcript: string) => {
                    let fullMatch = transcript.match(SET_TIMER_REGX);
                    if (fullMatch) {
                        return fullMatch;
                    } else if (PARTIAL_SET_TIMER_REGX.test(transcript)) {
                        // ideally it would be smarter. Smartness should be built into the recognizer
                        return false;
                    }
                }
            },
            fn: async (transcript: string, fullMatch: string, timerName: string, quantity: string, unit: string, quantity2: string, unit2: string, half: 'half'|null, quarter: 'quarter'|null) => {
                let seconds = Number(quantity);
                if (unit.startsWith('minute'))
                    seconds *= 60;
                else if (unit.startsWith('hour'))
                    seconds *= 3600;

                let seconds2 = Number(quantity2);
                if (!isNaN(seconds2) && seconds2) {
                    if (unit2.startsWith('minute'))
                        seconds2 *= 60;
                    seconds += seconds2;
                } 

                if (half) 
                    if (unit.startsWith('minute'))
                        seconds += 30
                    else 
                        seconds += 1800
                else if (quarter)
                    if (unit.startsWith('minute'))
                        seconds += 15
                    else 
                        seconds += 900

                console.log(`total seconds ${seconds}`);
                setTimeout(() => {
                    let title = `${(timerName ? timerName : '')} timer elapsed.`.trimLeft();
                    title = title[0].toUpperCase() + title.slice(1, title.length);
                    chrome.notifications.create({
                        type: 'basic',
                        title,
                        message: `"${transcript}"`,
                        iconUrl: 'assets/icon-timer-48.png',
                        requireInteraction: true
                    });
                    chrome.tts.speak(title);
                }, seconds * 1000);
            }
        }],
    }
};
