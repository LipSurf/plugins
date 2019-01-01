/// <reference path="../@types/plugin-interface.d.ts"/>
import { TimerPlugin } from './Timer';

TimerPlugin.Plugin.languages.ru = {
        niceName: 'Таймер',
        description: 'Устанавливает таймер.',
        author: 'Hanna',
        
        commands: [
            {
              "Set Timer",       
                name: 'Установить таймер',
                description: 'Показывает уведомление и говорит "Таймер установлен" после того, как назван промежуток времени.',
                global: true,
                match: {
                    // does not handle decimals
                    description: 'Скажите "Установить таймер [имя таймера (не обязательно)] на x секунд/минут/часов" ',
                    fn: (transcript: string) => {
                        let fullMatch = transcript.match(Plugin.SET_TIMER_REGX);
                        if (fullMatch) {
                            return fullMatch;
                        } else if (Plugin.PARTIAL_SET_TIMER_REGX.test(transcript)) {
                            // ideally it would be smarter. Smartness should be built into the recognizer
                            return false;
                        }
                    }
                },
                
                }
            }],
    });
}
