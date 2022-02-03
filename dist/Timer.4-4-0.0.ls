import PluginBase from 'chrome-extension://lnnmjmalakahagblkkcnjkoaihlfglon/dist/modules/plugin-base.js';import ExtensionUtil from 'chrome-extension://lnnmjmalakahagblkkcnjkoaihlfglon/dist/modules/extension-util.js';// dist/tmp/Timer/Timer.js
var Timer_default = { "languages": { "ru": { "niceName": "Таймер", "description": "Поиск в Google", "authors": "Hanna", "commands": { "Set Timer": { "name": "Установить таймер", "description": 'Показывает уведомление и говорит "Таймер установлен" после того, как назван промежуток времени.', "match": { "description": 'Скажите "Установить таймер [имя таймера (не обязательно)] на x секунд/минут/часов"', "fn": ({ preTs, normTs }) => {
  const match = normTs.match(/\b\x83\x81\x82\xB0\xBD\xBE\xB2\xB8\x82\x8C (?:(.*) )?\x82\xB0\xB9\xBC\xB5\x80 (?:\xBD\xB0 )?(\xBF\xBE\xBB\x87\xB0\x81\xB0|\xBF\xBE\xBB\x82\xBE\x80\xB0 \x87\xB0\x81\xB0|(\d+) ?(\x81\xB5\xBA\x83\xBD\xB4(?:\x83|\x8B)?|\xBC\xB8\xBD\x83\x82(?:\x83|\x8B)?|\x87\xB0\x81(?:\xB0|\xBE\xB2)?)(?:(?: \xB8)? (?:(?:(\d+) (\x81\xB5\xBA\x83\xBD\xB4(?:\x83|\x8B)?|\xBC\xB8\xBD\x83\x82(?:\x83|\x8B)?))))?)\b/);
  if (match) {
    let quarter = null;
    let timerName = match[1];
    let half = match[2] && match[2].startsWith("пол") ? "half" : null;
    let quantity = match[3];
    let unit = match[4] ? match[4].startsWith("секунд") ? "second" : match[4].startsWith("минут") ? "minute" : "hour" : "";
    let quantity2 = match[5];
    let unit2 = match[6] ? match[6].startsWith("секунд") ? "second" : match[6].startsWith("минут") ? "minute" : "hour" : "";
    const endPos = match.index + match[0].length;
    return [match.index, endPos, [match[0], timerName, quantity, unit, quantity2, unit2, half, quarter]];
  } else if (/\b\x83\x81\x82\xB0\xBD\xBE\xB2\xB8\x82\x8C (?:(.*) )?(?:\x82\xB0\xB9\xBC\xB5\x80)? (?:\xBD\xB0 )?/.test(normTs)) {
    return false;
  }
} } } } } }, "niceName": "Timer", "description": "Tools for setting timers.", "version": "4.4.0", "apiVersion": 2, "match": /.*/, "authors": "Miko", "commands": [{ "name": "Set Timer", "description": 'Shows a notification and speaks "timer elapsed" (audio) after the specified duration.', "global": true, "match": { "description": "set [timer name (optional)] timer for [n] [seconds/minutes/hours]", "fn": () => {
} }, "fn": async ({ preTs, normTs }, fullMatch, timerName, quantity, unit, quantity2, unit2, half, quarter) => {
  let seconds = Number(quantity);
  if (unit.startsWith("minute"))
    seconds *= 60;
  else if (unit.startsWith("hour"))
    seconds *= 3600;
  let seconds2 = Number(quantity2);
  if (!isNaN(seconds2) && seconds2) {
    if (unit2.startsWith("minute"))
      seconds2 *= 60;
    seconds += seconds2;
  }
  if (half)
    if (unit.startsWith("minute"))
      seconds += 30;
    else
      seconds += 1800;
  else if (quarter)
    if (unit.startsWith("minute"))
      seconds += 15;
    else
      seconds += 900;
  console.log(`total seconds ${seconds}`);
  setTimeout(() => {
    let title = `${timerName ? timerName : ""} timer elapsed.`.trimLeft();
    title = title[0].toUpperCase() + title.slice(1, title.length);
    chrome.notifications.create({ type: "basic", title, message: `"${normTs}"`, iconUrl: "assets/icon-timer-48.png", requireInteraction: true });
    chrome.tts.speak(title);
  }, seconds * 1e3);
} }] };
export {
  Timer_default as default
};
LS-SPLIT// dist/tmp/Timer/Timer.js
allPlugins.Timer = (() => {
  var SET_TIMER_REGX = /\bset (?:(.*) )?timer (?:for )?(\d+) (seconds|minutes?|hours?)(?:(?: and)? (?:(?:(\d+) (seconds|minutes?))|(?:(?:a (?:(half)|(quarter))))))?\b/;
  var PARTIAL_SET_TIMER_REGX = /\bset\b(.* )?(timer)?\b/;
  var Timer_default = { ...PluginBase, ...{ "commands": { "Set Timer": { "match": { "en": ({ preTs, normTs }) => {
    let match = normTs.match(SET_TIMER_REGX);
    if (match) {
      const endPos = match.index + match[0].length;
      return [match.index, endPos, match];
    } else if (PARTIAL_SET_TIMER_REGX.test(normTs)) {
      return false;
    }
  }, "ru": ({ preTs, normTs }) => {
    const match = normTs.match(/\b\x83\x81\x82\xB0\xBD\xBE\xB2\xB8\x82\x8C (?:(.*) )?\x82\xB0\xB9\xBC\xB5\x80 (?:\xBD\xB0 )?(\xBF\xBE\xBB\x87\xB0\x81\xB0|\xBF\xBE\xBB\x82\xBE\x80\xB0 \x87\xB0\x81\xB0|(\d+) ?(\x81\xB5\xBA\x83\xBD\xB4(?:\x83|\x8B)?|\xBC\xB8\xBD\x83\x82(?:\x83|\x8B)?|\x87\xB0\x81(?:\xB0|\xBE\xB2)?)(?:(?: \xB8)? (?:(?:(\d+) (\x81\xB5\xBA\x83\xBD\xB4(?:\x83|\x8B)?|\xBC\xB8\xBD\x83\x82(?:\x83|\x8B)?))))?)\b/);
    if (match) {
      let quarter = null;
      let timerName = match[1];
      let half = match[2] && match[2].startsWith("пол") ? "half" : null;
      let quantity = match[3];
      let unit = match[4] ? match[4].startsWith("секунд") ? "second" : match[4].startsWith("минут") ? "minute" : "hour" : "";
      let quantity2 = match[5];
      let unit2 = match[6] ? match[6].startsWith("секунд") ? "second" : match[6].startsWith("минут") ? "minute" : "hour" : "";
      const endPos = match.index + match[0].length;
      return [match.index, endPos, [match[0], timerName, quantity, unit, quantity2, unit2, half, quarter]];
    } else if (/\b\x83\x81\x82\xB0\xBD\xBE\xB2\xB8\x82\x8C (?:(.*) )?(?:\x82\xB0\xB9\xBC\xB5\x80)? (?:\xBD\xB0 )?/.test(normTs)) {
      return false;
    }
  } } } } } };
  return Timer_default;
})();
LS-SPLIT// dist/tmp/Timer/Timer.js
allPlugins.Timer = (() => {
  var SET_TIMER_REGX = /\bset (?:(.*) )?timer (?:for )?(\d+) (seconds|minutes?|hours?)(?:(?: and)? (?:(?:(\d+) (seconds|minutes?))|(?:(?:a (?:(half)|(quarter))))))?\b/;
  var PARTIAL_SET_TIMER_REGX = /\bset\b(.* )?(timer)?\b/;
  var Timer_default = { ...PluginBase, ...{ "commands": { "Set Timer": { "match": { "en": ({ preTs, normTs }) => {
    let match = normTs.match(SET_TIMER_REGX);
    if (match) {
      const endPos = match.index + match[0].length;
      return [match.index, endPos, match];
    } else if (PARTIAL_SET_TIMER_REGX.test(normTs)) {
      return false;
    }
  }, "ru": ({ preTs, normTs }) => {
    const match = normTs.match(/\b\x83\x81\x82\xB0\xBD\xBE\xB2\xB8\x82\x8C (?:(.*) )?\x82\xB0\xB9\xBC\xB5\x80 (?:\xBD\xB0 )?(\xBF\xBE\xBB\x87\xB0\x81\xB0|\xBF\xBE\xBB\x82\xBE\x80\xB0 \x87\xB0\x81\xB0|(\d+) ?(\x81\xB5\xBA\x83\xBD\xB4(?:\x83|\x8B)?|\xBC\xB8\xBD\x83\x82(?:\x83|\x8B)?|\x87\xB0\x81(?:\xB0|\xBE\xB2)?)(?:(?: \xB8)? (?:(?:(\d+) (\x81\xB5\xBA\x83\xBD\xB4(?:\x83|\x8B)?|\xBC\xB8\xBD\x83\x82(?:\x83|\x8B)?))))?)\b/);
    if (match) {
      let quarter = null;
      let timerName = match[1];
      let half = match[2] && match[2].startsWith("пол") ? "half" : null;
      let quantity = match[3];
      let unit = match[4] ? match[4].startsWith("секунд") ? "second" : match[4].startsWith("минут") ? "minute" : "hour" : "";
      let quantity2 = match[5];
      let unit2 = match[6] ? match[6].startsWith("секунд") ? "second" : match[6].startsWith("минут") ? "minute" : "hour" : "";
      const endPos = match.index + match[0].length;
      return [match.index, endPos, [match[0], timerName, quantity, unit, quantity2, unit2, half, quarter]];
    } else if (/\b\x83\x81\x82\xB0\xBD\xBE\xB2\xB8\x82\x8C (?:(.*) )?(?:\x82\xB0\xB9\xBC\xB5\x80)? (?:\xBD\xB0 )?/.test(normTs)) {
      return false;
    }
  } } } } } };
  return Timer_default;
})();
