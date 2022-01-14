import PluginBase from 'chrome-extension://lnnmjmalakahagblkkcnjkoaihlfglon/dist/modules/plugin-base.js';import ExtensionUtil from 'chrome-extension://lnnmjmalakahagblkkcnjkoaihlfglon/dist/modules/extension-util.js';// dist/tmp/AntiProcrastination/AntiProcrastination.js
var AntiProcrastination_default = { "languages": { "ru": { "niceName": "Анти-прокрастинатор", "authors": "Hanna", "commands": { "Self Destructing Tab": { "name": "Самозакрывающаяся вкладка", "description": "Открывает новую вкладку только на заданное время. Удобно для ограничения пользования сайтами-времяубийцами вроде facebook, reddit, twitter etc.", "match": { "description": 'Скажите "открыть [название сайта] на x секунд/минут/часов"', "fn": ({ preTs, normTs }) => {
  let match = normTs.match(/\b\xBE\x82\xBA\x80\x8B\x82\x8C (.*) \xBD\xB0 (\d+) (\x81\xB5\xBA\x83\xBD\xB4(?:\x83|\x8B)?|\xBC\xB8\xBD\x83\x82(?:\x83|\x8B)?|\x87\xB0\x81(?:\xB0|\xBE\xB2)?)\b/);
  if (match) {
    const endPos = match.index + match[0].length;
    match[3] = match[3].startsWith("минут") ? "minute" : match[3].startsWith("час") ? "hour" : "second";
    return [match.index, endPos, match];
  } else if (/\b\xBE\x82\xBA\x80\x8B\x82\x8C\b/.test(normTs)) {
    return false;
  }
} }, "delay": 600 } } } }, "niceName": "Anti-procrastination", "description": "Tools for curbing procrastination.", "match": /.*/, "version": "4.4.0", "apiVersion": 2, "authors": "Miko", "commands": [{ "name": "Self Destructing Tab", "description": "Open a new tab with x website for y time. Useful for limiting the time-sucking power of sites like facebook, reddit, twitter etc.", "global": true, "match": { "description": "open [website name] for [n] [seconds/minutes/hours]", "fn": () => {
} }, "delay": 600, "fn": async (transcript, fullMatch, siteStr, secondsStr, unit) => {
  let seconds = Number(secondsStr);
  if (unit.startsWith("minute"))
    seconds *= 60;
  else if (unit.startsWith("hour"))
    seconds *= 3600;
  if (~siteStr.indexOf("hacker news"))
    siteStr = "news.ycombinator";
  else if (siteStr === "reddit" || siteStr === "ready")
    siteStr = "old.reddit.com";
  let site = `https://${siteStr.replace(/\s+/g, "").replace("'", "").replace(".com", "").replace("dot com", "")}.com`;
  let id = chrome.tabs.create({ url: site, active: true }, (tab) => {
    setTimeout(() => {
      chrome.tabs.remove(tab.id);
    }, seconds * 1e3);
  });
} }] };
export {
  AntiProcrastination_default as default
};
LS-SPLIT// dist/tmp/AntiProcrastination/AntiProcrastination.js
allPlugins.AntiProcrastination = (() => {
  var OPEN_X_FOR_Y_TIME_REGX = /\bopen (.*) for (\d+) (seconds|minutes?|hours?)\b/;
  var OPEN_REGX = /\bopen\b/;
  var AntiProcrastination_default = { ...PluginBase, ...{ "commands": { "Self Destructing Tab": { "match": { "en": ({ preTs, normTs }) => {
    const match = normTs.match(OPEN_X_FOR_Y_TIME_REGX);
    if (match) {
      const endPos = match.index + match[0].length;
      return [match.index, endPos, match];
    } else if (OPEN_REGX.test(normTs)) {
      return false;
    }
  }, "ru": ({ preTs, normTs }) => {
    let match = normTs.match(/\b\xBE\x82\xBA\x80\x8B\x82\x8C (.*) \xBD\xB0 (\d+) (\x81\xB5\xBA\x83\xBD\xB4(?:\x83|\x8B)?|\xBC\xB8\xBD\x83\x82(?:\x83|\x8B)?|\x87\xB0\x81(?:\xB0|\xBE\xB2)?)\b/);
    if (match) {
      const endPos = match.index + match[0].length;
      match[3] = match[3].startsWith("минут") ? "minute" : match[3].startsWith("час") ? "hour" : "second";
      return [match.index, endPos, match];
    } else if (/\b\xBE\x82\xBA\x80\x8B\x82\x8C\b/.test(normTs)) {
      return false;
    }
  } } } } } };
  return AntiProcrastination_default;
})();
LS-SPLIT// dist/tmp/AntiProcrastination/AntiProcrastination.js
allPlugins.AntiProcrastination = (() => {
  var OPEN_X_FOR_Y_TIME_REGX = /\bopen (.*) for (\d+) (seconds|minutes?|hours?)\b/;
  var OPEN_REGX = /\bopen\b/;
  var AntiProcrastination_default = { ...PluginBase, ...{ "commands": { "Self Destructing Tab": { "match": { "en": ({ preTs, normTs }) => {
    const match = normTs.match(OPEN_X_FOR_Y_TIME_REGX);
    if (match) {
      const endPos = match.index + match[0].length;
      return [match.index, endPos, match];
    } else if (OPEN_REGX.test(normTs)) {
      return false;
    }
  }, "ru": ({ preTs, normTs }) => {
    let match = normTs.match(/\b\xBE\x82\xBA\x80\x8B\x82\x8C (.*) \xBD\xB0 (\d+) (\x81\xB5\xBA\x83\xBD\xB4(?:\x83|\x8B)?|\xBC\xB8\xBD\x83\x82(?:\x83|\x8B)?|\x87\xB0\x81(?:\xB0|\xBE\xB2)?)\b/);
    if (match) {
      const endPos = match.index + match[0].length;
      match[3] = match[3].startsWith("минут") ? "minute" : match[3].startsWith("час") ? "hour" : "second";
      return [match.index, endPos, match];
    } else if (/\b\xBE\x82\xBA\x80\x8B\x82\x8C\b/.test(normTs)) {
      return false;
    }
  } } } } } };
  return AntiProcrastination_default;
})();
