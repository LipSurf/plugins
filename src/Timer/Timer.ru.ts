/// <reference types="@lipsurf/types/extension"/>
import Timer from "./Timer";

Timer.languages!.ru = {
  niceName: "Таймер",
  description: "Поиск в Google",
  authors: "Hanna",
  commands: {
    "Set Timer": {
      name: "Установить таймер",
      description:
        'Показывает уведомление и говорит "Таймер установлен" после того, как назван промежуток времени.',
      match: {
        // does not handle decimals
        description:
          'Скажите "Установить таймер [имя таймера (не обязательно)] на x секунд/минут/часов"',
        fn: ({ preTs, normTs }) => {
          const match = normTs.match(
            /\bустановить (?:(.*) )?таймер (?:на )?(полчаса|полтора часа|(\d+) ?(секунд(?:у|ы)?|минут(?:у|ы)?|час(?:а|ов)?)(?:(?: и)? (?:(?:(\d+) (секунд(?:у|ы)?|минут(?:у|ы)?))))?)\b/
          );
          if (match) {
            let quarter = null;
            let timerName = match[1];
            let half = match[2] && match[2].startsWith("пол") ? "half" : null;
            let quantity = match[3];
            let unit = match[4]
              ? match[4].startsWith("секунд")
                ? "second"
                : match[4].startsWith("минут")
                ? "minute"
                : "hour"
              : "";
            let quantity2 = match[5];
            let unit2 = match[6]
              ? match[6].startsWith("секунд")
                ? "second"
                : match[6].startsWith("минут")
                ? "minute"
                : "hour"
              : "";
            const endPos = match.index! + match[0].length;
            return [
              match.index!,
              endPos,
              [
                match[0],
                timerName,
                quantity,
                unit,
                quantity2,
                unit2,
                half,
                quarter,
              ],
            ];
          } else if (
            /\bустановить (?:(.*) )?(?:таймер)? (?:на )?/.test(normTs)
          ) {
            // ideally it would be smarter. Smartness should be built into the recognizer
            return false;
          }
        },
      },
    },
  },
};
