/// <reference types="lipsurf-plugin-types"/>
import Timer from './Timer';

Timer.languages.ru = {
    niceName: "Таймер",
    description: "Поиск в Google",
    authors: "Hanna",
    commands: {
        "Set Timer": {
            name: 'Установить таймер',
            description: 'Показывает уведомление и говорит "Таймер установлен" после того, как назван промежуток времени.',
            match: {
                // does not handle decimals
                description: 'Скажите "Установить таймер [имя таймера (не обязательно)] на x секунд/минут/часов"',
                fn: (transcript: string) => {
                    let regxMatch = transcript.match(/^установить (?:(.*) )?таймер (?:на )?(полчаса|полтора часа|(\d+) ?(секунд(?:у|ы)?|минут(?:у|ы)?|час(?:а|ов)?)(?:(?: и)? (?:(?:(\d+) (секунд(?:у|ы)?|минут(?:у|ы)?))))?)/);
                    if (regxMatch) {
                        let quarter = null;
                        let timerName = regxMatch[1];
                        let half = regxMatch[2] && regxMatch[2].startsWith('пол') ? 'half' : null;
                        let quantity = regxMatch[3];
                        let unit = regxMatch[4] ? regxMatch[4].startsWith('секунд') ? 'second' : regxMatch[4].startsWith('минут') ? 'minute' : 'hour' : '';
                        let quantity2 = regxMatch[5];
                        let unit2 = regxMatch[6] ? regxMatch[6].startsWith('секунд') ? 'second' : regxMatch[6].startsWith('минут') ? 'minute' : 'hour' : '';
                        return [regxMatch[0], timerName, quantity, unit, quantity2, unit2, half, quarter];
                    } else if (/^установить (?:(.*) )?(?:таймер)? (?:на )?/.test(transcript)) {
                        // ideally it would be smarter. Smartness should be built into the recognizer
                        return false;
                    }
                }
            },
        },
    }
};