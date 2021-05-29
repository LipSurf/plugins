import PluginBase from 'chrome-extension://lnnmjmalakahagblkkcnjkoaihlfglon/dist/modules/plugin-base.js';import ExtensionUtil from 'chrome-extension://lnnmjmalakahagblkkcnjkoaihlfglon/dist/modules/extension-util.js';// dist/tmp/AntiProcrastination/AntiProcrastination.js
var OPEN_X_FOR_Y_TIME_REGX = /\bopen (.*) for (\d+) (seconds|minutes?|hours?)\b/, OPEN_REGX = /\bopen\b/, AntiProcrastination_default = {
  ...PluginBase,
  languages: {},
  niceName: "Anti-procrastination",
  description: "Tools for curbing procrastination.",
  match: /.*/,
  version: "4.0.0",
  authors: "Miko",
  commands: [
    {
      name: "Self Destructing Tab",
      description: "Open a new tab with x website for y time. Useful for limiting the time-sucking power of sites like facebook, reddit, twitter etc.",
      global: !0,
      match: {
        description: "open [website name] for [n] [seconds/minutes/hours]",
        fn: ([rawTs, normTs]) => {
          let match = normTs.match(OPEN_X_FOR_Y_TIME_REGX);
          if (match) {
            let endPos = match.index + match[0].length;
            return [match.index, endPos, match];
          } else if (OPEN_REGX.test(normTs))
            return !1;
        }
      },
      delay: 600,
      fn: async (transcript, fullMatch, siteStr, secondsStr, unit) => {
        let seconds = Number(secondsStr);
        unit.startsWith("minute") ? seconds *= 60 : unit.startsWith("hour") && (seconds *= 3600), ~siteStr.indexOf("hacker news") ? siteStr = "news.ycombinator" : (siteStr === "reddit" || siteStr === "ready") && (siteStr = "old.reddit.com");
        let site = `https://${siteStr.replace(/\s+/g, "").replace("'", "").replace(".com", "").replace("dot com", "")}.com`, id = chrome.tabs.create({
          url: site,
          active: !0
        }, (tab) => {
          setTimeout(() => {
            chrome.tabs.remove(tab.id);
          }, seconds * 1e3);
        });
      }
    }
  ]
};
AntiProcrastination_default.languages.ru = {
  niceName: "Анти-прокрастинатор",
  authors: "Hanna",
  commands: {
    "Self Destructing Tab": {
      name: "Самозакрывающаяся вкладка",
      description: "Открывает новую вкладку только на заданное время. Удобно для ограничения пользования сайтами-времяубийцами вроде facebook, reddit, twitter etc.",
      match: {
        description: 'Скажите "открыть [название сайта] на x секунд/минут/часов"',
        fn: ([rawTs, normTs]) => {
          let match = normTs.match(/\b\u043E\u0442\u043A\u0440\u044B\u0442\u044C (.*) \u043D\u0430 (\d+) (\u0441\u0435\u043A\u0443\u043D\u0434(?:\u0443|\u044B)?|\u043C\u0438\u043D\u0443\u0442(?:\u0443|\u044B)?|\u0447\u0430\u0441(?:\u0430|\u043E\u0432)?)\b/);
          if (match) {
            let endPos = match.index + match[0].length;
            return match[3] = match[3].startsWith("минут") ? "minute" : match[3].startsWith("час") ? "hour" : "second", [match.index, endPos, match];
          } else if (/\b\u043E\u0442\u043A\u0440\u044B\u0442\u044C\b/.test(normTs))
            return !1;
        }
      },
      delay: 600
    }
  }
};
var dumby_default = AntiProcrastination_default;
export {
  dumby_default as default
};
LS-SPLIT// dist/tmp/AntiProcrastination/AntiProcrastination.js
allPlugins.AntiProcrastination = (() => {
  var OPEN_X_FOR_Y_TIME_REGX = /\bopen (.*) for (\d+) (seconds|minutes?|hours?)\b/, OPEN_REGX = /\bopen\b/;
  return {...PluginBase, commands: {"Self Destructing Tab": {match: {en: ([rawTs, normTs]) => {
    let match = normTs.match(OPEN_X_FOR_Y_TIME_REGX);
    if (match) {
      let endPos = match.index + match[0].length;
      return [match.index, endPos, match];
    } else if (OPEN_REGX.test(normTs))
      return !1;
  }, ru: ([rawTs, normTs]) => {
    let match = normTs.match(/\b\u043E\u0442\u043A\u0440\u044B\u0442\u044C (.*) \u043D\u0430 (\d+) (\u0441\u0435\u043A\u0443\u043D\u0434(?:\u0443|\u044B)?|\u043C\u0438\u043D\u0443\u0442(?:\u0443|\u044B)?|\u0447\u0430\u0441(?:\u0430|\u043E\u0432)?)\b/);
    if (match) {
      let endPos = match.index + match[0].length;
      return match[3] = match[3].startsWith("минут") ? "minute" : match[3].startsWith("час") ? "hour" : "second", [match.index, endPos, match];
    } else if (/\b\u043E\u0442\u043A\u0440\u044B\u0442\u044C\b/.test(normTs))
      return !1;
  }}}}};
})();
LS-SPLIT// dist/tmp/AntiProcrastination/AntiProcrastination.js
allPlugins.AntiProcrastination = (() => {
  var OPEN_X_FOR_Y_TIME_REGX = /\bopen (.*) for (\d+) (seconds|minutes?|hours?)\b/, OPEN_REGX = /\bopen\b/;
  return {...PluginBase, commands: {"Self Destructing Tab": {match: {en: ([rawTs, normTs]) => {
    let match = normTs.match(OPEN_X_FOR_Y_TIME_REGX);
    if (match) {
      let endPos = match.index + match[0].length;
      return [match.index, endPos, match];
    } else if (OPEN_REGX.test(normTs))
      return !1;
  }, ru: ([rawTs, normTs]) => {
    let match = normTs.match(/\b\u043E\u0442\u043A\u0440\u044B\u0442\u044C (.*) \u043D\u0430 (\d+) (\u0441\u0435\u043A\u0443\u043D\u0434(?:\u0443|\u044B)?|\u043C\u0438\u043D\u0443\u0442(?:\u0443|\u044B)?|\u0447\u0430\u0441(?:\u0430|\u043E\u0432)?)\b/);
    if (match) {
      let endPos = match.index + match[0].length;
      return match[3] = match[3].startsWith("минут") ? "minute" : match[3].startsWith("час") ? "hour" : "second", [match.index, endPos, match];
    } else if (/\b\u043E\u0442\u043A\u0440\u044B\u0442\u044C\b/.test(normTs))
      return !1;
  }}}}};
})();
