/// <reference types="lipsurf-plugin-types"/>
import AntiProcrastination from './AntiProcrastination';

AntiProcrastination.languages!.ru = {
    niceName: 'Анти-прокрастинатор',
    authors: 'Hanna',
    commands: {
        'Self Destructing Tab': {
            name: 'Самозакрывающаяся вкладка',
            description: 'Открывает новую вкладку только на заданное время. Удобно для ограничения пользования сайтами-времяубийцами вроде facebook, reddit, twitter etc.',
            match: {
                description: 'Скажите "открыть [название сайта] на x секунд/минут/часов"',
                fn: (transcript: string) => {
                    let fullMatch = transcript.match(/^открыть (.*) на (\d+) (секунд(?:у|ы)?|минут(?:у|ы)?|час(?:а|ов)?)/);
                    if (fullMatch) {
                        fullMatch[3] = fullMatch[3].startsWith('минут') ? 'minute' : fullMatch[3].startsWith('час') ? 'hour' : 'second';
                        return fullMatch;
                    } else if (/^открыть\b/.test(transcript)) {
                        // ideally it would be smarter than just testing (open) but that functionality 
                        // should be built into the recognizer
                        return false;
                    }
                }
            },
            // delay is needed to get more accurate site name
            delay: 600,
        },
    }
}
