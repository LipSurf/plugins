import PluginBase from 'chrome-extension://lnnmjmalakahagblkkcnjkoaihlfglon/dist/modules/plugin-base.js';import ExtensionUtil from 'chrome-extension://lnnmjmalakahagblkkcnjkoaihlfglon/dist/modules/extension-util.js';// dist/tmp/Timer/Timer.js
var SET_TIMER_REGX = /\bset (?:(.*) )?timer (?:for )?(\d+) (seconds|minutes?|hours?)(?:(?: and)? (?:(?:(\d+) (seconds|minutes?))|(?:(?:a (?:(half)|(quarter))))))?\b/, PARTIAL_SET_TIMER_REGX = /\bset\b(.* )?(timer)?\b/, Timer_default = {
  ...PluginBase,
  languages: {},
  niceName: "Timer",
  description: "Tools for setting timers.",
  version: "4.0.0",
  match: /.*/,
  authors: "Miko",
  commands: [
    {
      name: "Set Timer",
      description: 'Shows a notification and speaks "timer elapsed" (audio) after the specified duration.',
      global: !0,
      match: {
        description: "set [timer name (optional)] timer for [n] [seconds/minutes/hours]",
        fn: ([rawTs, normTs]) => {
          let match = normTs.match(SET_TIMER_REGX);
          if (match) {
            let endPos = match.index + match[0].length;
            return [match.index, endPos, match];
          } else if (PARTIAL_SET_TIMER_REGX.test(normTs))
            return !1;
        }
      },
      fn: async ([rawTs, normTs], fullMatch, timerName, quantity, unit, quantity2, unit2, half, quarter) => {
        let seconds = Number(quantity);
        unit.startsWith("minute") ? seconds *= 60 : unit.startsWith("hour") && (seconds *= 3600);
        let seconds2 = Number(quantity2);
        !isNaN(seconds2) && seconds2 && (unit2.startsWith("minute") && (seconds2 *= 60), seconds += seconds2), half ? unit.startsWith("minute") ? seconds += 30 : seconds += 1800 : quarter && (unit.startsWith("minute") ? seconds += 15 : seconds += 900), console.log(`total seconds ${seconds}`), setTimeout(() => {
          let title = `${timerName || ""} timer elapsed.`.trimLeft();
          title = title[0].toUpperCase() + title.slice(1, title.length), chrome.notifications.create({
            type: "basic",
            title,
            message: `"${normTs}"`,
            iconUrl: "assets/icon-timer-48.png",
            requireInteraction: !0
          }), chrome.tts.speak(title);
        }, seconds * 1e3);
      }
    }
  ]
};
Timer_default.languages.ru = {
  niceName: "Таймер",
  description: "Поиск в Google",
  authors: "Hanna",
  commands: {
    "Set Timer": {
      name: "Установить таймер",
      description: 'Показывает уведомление и говорит "Таймер установлен" после того, как назван промежуток времени.',
      match: {
        description: 'Скажите "Установить таймер [имя таймера (не обязательно)] на x секунд/минут/часов"',
        fn: ([rawTs, normTs]) => {
          let match = normTs.match(/\b\u0443\u0441\u0442\u0430\u043D\u043E\u0432\u0438\u0442\u044C (?:(.*) )?\u0442\u0430\u0439\u043C\u0435\u0440 (?:\u043D\u0430 )?(\u043F\u043E\u043B\u0447\u0430\u0441\u0430|\u043F\u043E\u043B\u0442\u043E\u0440\u0430 \u0447\u0430\u0441\u0430|(\d+) ?(\u0441\u0435\u043A\u0443\u043D\u0434(?:\u0443|\u044B)?|\u043C\u0438\u043D\u0443\u0442(?:\u0443|\u044B)?|\u0447\u0430\u0441(?:\u0430|\u043E\u0432)?)(?:(?: \u0438)? (?:(?:(\d+) (\u0441\u0435\u043A\u0443\u043D\u0434(?:\u0443|\u044B)?|\u043C\u0438\u043D\u0443\u0442(?:\u0443|\u044B)?))))?)\b/);
          if (match) {
            let quarter = null, timerName = match[1], half = match[2] && match[2].startsWith("пол") ? "half" : null, quantity = match[3], unit = match[4] ? match[4].startsWith("секунд") ? "second" : match[4].startsWith("минут") ? "minute" : "hour" : "", quantity2 = match[5], unit2 = match[6] ? match[6].startsWith("секунд") ? "second" : match[6].startsWith("минут") ? "minute" : "hour" : "", endPos = match.index + match[0].length;
            return [
              match.index,
              endPos,
              [
                match[0],
                timerName,
                quantity,
                unit,
                quantity2,
                unit2,
                half,
                quarter
              ]
            ];
          } else if (/\b\u0443\u0441\u0442\u0430\u043D\u043E\u0432\u0438\u0442\u044C (?:(.*) )?(?:\u0442\u0430\u0439\u043C\u0435\u0440)? (?:\u043D\u0430 )?/.test(normTs))
            return !1;
        }
      }
    }
  }
};
var dumby_default = Timer_default;
export {
  dumby_default as default
};
LS-SPLIT// dist/tmp/Timer/Timer.js
allPlugins.Timer = (() => {
  var SET_TIMER_REGX = /\bset (?:(.*) )?timer (?:for )?(\d+) (seconds|minutes?|hours?)(?:(?: and)? (?:(?:(\d+) (seconds|minutes?))|(?:(?:a (?:(half)|(quarter))))))?\b/, PARTIAL_SET_TIMER_REGX = /\bset\b(.* )?(timer)?\b/;
  return {...PluginBase, commands: {"Set Timer": {match: {en: ([rawTs, normTs]) => {
    let match = normTs.match(SET_TIMER_REGX);
    if (match) {
      let endPos = match.index + match[0].length;
      return [match.index, endPos, match];
    } else if (PARTIAL_SET_TIMER_REGX.test(normTs))
      return !1;
  }, ru: ([rawTs, normTs]) => {
    let match = normTs.match(/\b\u0443\u0441\u0442\u0430\u043D\u043E\u0432\u0438\u0442\u044C (?:(.*) )?\u0442\u0430\u0439\u043C\u0435\u0440 (?:\u043D\u0430 )?(\u043F\u043E\u043B\u0447\u0430\u0441\u0430|\u043F\u043E\u043B\u0442\u043E\u0440\u0430 \u0447\u0430\u0441\u0430|(\d+) ?(\u0441\u0435\u043A\u0443\u043D\u0434(?:\u0443|\u044B)?|\u043C\u0438\u043D\u0443\u0442(?:\u0443|\u044B)?|\u0447\u0430\u0441(?:\u0430|\u043E\u0432)?)(?:(?: \u0438)? (?:(?:(\d+) (\u0441\u0435\u043A\u0443\u043D\u0434(?:\u0443|\u044B)?|\u043C\u0438\u043D\u0443\u0442(?:\u0443|\u044B)?))))?)\b/);
    if (match) {
      let quarter = null, timerName = match[1], half = match[2] && match[2].startsWith("пол") ? "half" : null, quantity = match[3], unit = match[4] ? match[4].startsWith("секунд") ? "second" : match[4].startsWith("минут") ? "minute" : "hour" : "", quantity2 = match[5], unit2 = match[6] ? match[6].startsWith("секунд") ? "second" : match[6].startsWith("минут") ? "minute" : "hour" : "", endPos = match.index + match[0].length;
      return [
        match.index,
        endPos,
        [
          match[0],
          timerName,
          quantity,
          unit,
          quantity2,
          unit2,
          half,
          quarter
        ]
      ];
    } else if (/\b\u0443\u0441\u0442\u0430\u043D\u043E\u0432\u0438\u0442\u044C (?:(.*) )?(?:\u0442\u0430\u0439\u043C\u0435\u0440)? (?:\u043D\u0430 )?/.test(normTs))
      return !1;
  }}}}};
})();
LS-SPLIT// dist/tmp/Timer/Timer.js
allPlugins.Timer = (() => {
  var SET_TIMER_REGX = /\bset (?:(.*) )?timer (?:for )?(\d+) (seconds|minutes?|hours?)(?:(?: and)? (?:(?:(\d+) (seconds|minutes?))|(?:(?:a (?:(half)|(quarter))))))?\b/, PARTIAL_SET_TIMER_REGX = /\bset\b(.* )?(timer)?\b/;
  return {...PluginBase, commands: {"Set Timer": {match: {en: ([rawTs, normTs]) => {
    let match = normTs.match(SET_TIMER_REGX);
    if (match) {
      let endPos = match.index + match[0].length;
      return [match.index, endPos, match];
    } else if (PARTIAL_SET_TIMER_REGX.test(normTs))
      return !1;
  }, ru: ([rawTs, normTs]) => {
    let match = normTs.match(/\b\u0443\u0441\u0442\u0430\u043D\u043E\u0432\u0438\u0442\u044C (?:(.*) )?\u0442\u0430\u0439\u043C\u0435\u0440 (?:\u043D\u0430 )?(\u043F\u043E\u043B\u0447\u0430\u0441\u0430|\u043F\u043E\u043B\u0442\u043E\u0440\u0430 \u0447\u0430\u0441\u0430|(\d+) ?(\u0441\u0435\u043A\u0443\u043D\u0434(?:\u0443|\u044B)?|\u043C\u0438\u043D\u0443\u0442(?:\u0443|\u044B)?|\u0447\u0430\u0441(?:\u0430|\u043E\u0432)?)(?:(?: \u0438)? (?:(?:(\d+) (\u0441\u0435\u043A\u0443\u043D\u0434(?:\u0443|\u044B)?|\u043C\u0438\u043D\u0443\u0442(?:\u0443|\u044B)?))))?)\b/);
    if (match) {
      let quarter = null, timerName = match[1], half = match[2] && match[2].startsWith("пол") ? "half" : null, quantity = match[3], unit = match[4] ? match[4].startsWith("секунд") ? "second" : match[4].startsWith("минут") ? "minute" : "hour" : "", quantity2 = match[5], unit2 = match[6] ? match[6].startsWith("секунд") ? "second" : match[6].startsWith("минут") ? "minute" : "hour" : "", endPos = match.index + match[0].length;
      return [
        match.index,
        endPos,
        [
          match[0],
          timerName,
          quantity,
          unit,
          quantity2,
          unit2,
          half,
          quarter
        ]
      ];
    } else if (/\b\u0443\u0441\u0442\u0430\u043D\u043E\u0432\u0438\u0442\u044C (?:(.*) )?(?:\u0442\u0430\u0439\u043C\u0435\u0440)? (?:\u043D\u0430 )?/.test(normTs))
      return !1;
  }}}}};
})();
