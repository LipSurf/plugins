import PluginBase from 'chrome-extension://lnnmjmalakahagblkkcnjkoaihlfglon/dist/modules/plugin-base.js';import ExtensionUtil from 'chrome-extension://lnnmjmalakahagblkkcnjkoaihlfglon/dist/modules/extension-util.js';// dist/tmp/Weather/Weather.js
var Weather_default = { "languages": { "ja": { "niceName": "天気", "authors": "Hiroki Yamazaki", "commands": { "Check the Weather": { "name": "天気を調べる", "description": "任意の都市の天気を調べます。", "match": ["てんき[/よほう]*"] } } }, "ru": { "niceName": "Прогноз погоды", "commands": { "Check the Weather": { "name": "Погода", "description": 'Узнать прогноз погоды в том или ином городе. Например, "погода минск" (название города не склоняется).', "match": "погода *" } } } }, "niceName": "Weather", "match": /.*accuweather\.com/, "version": "4.4.0", "apiVersion": 2, "commands": [{ "name": "Check the Weather", "description": "Check the weather for a given city.", "global": true, "match": ["[weather/forecast] [for/in] *"] }] };
export {
  Weather_default as default
};
LS-SPLIT// dist/tmp/Weather/Weather.js
allPlugins.Weather = (() => {
  var weatherForLang = { en: async (q) => {
    const resp = await (await window.fetch(`https://api.accuweather.com/locations/v1/cities/autocomplete?q=${q}&apikey=d41dfd5e8a1748d0970cba6637647d96&language=en-us&get_param=value`)).json();
    let cityId = resp[0].Key;
    let countryCode = resp[0].Country.ID.toLowerCase();
    let cityName = resp[0].LocalizedName.replace(" ", "-");
    window.location.href = `https://www.accuweather.com/en/${countryCode}/${cityName}/${cityId}/weather-forecast/${cityId}`;
  } };
  function registerWeatherCbForLang(lang, cb) {
    weatherForLang[lang] = cb;
  }
  var Weather_default = { ...PluginBase, ...{ "commands": { "Check the Weather": { "pageFn": async (transcript, q) => {
    const curLang = PluginBase.util.getLanguage();
    const shortenedLang = curLang.substr(0, 2);
    let chosenLang;
    if (curLang in weatherForLang) {
      chosenLang = curLang;
    } else if (shortenedLang in weatherForLang) {
      chosenLang = shortenedLang;
    } else {
      chosenLang = "en";
    }
    return weatherForLang[chosenLang](q.preTs);
  } } } } };
  registerWeatherCbForLang("ja", (q) => {
    window.location.href = `https://tenki.jp/search/?keyword=${q}`;
  });
  registerWeatherCbForLang("ru", (q) => {
    return window.location.href = `https://yandex.ru/pogoda/search?request=${q}`;
  });
  return Weather_default;
})();
LS-SPLIT// dist/tmp/Weather/Weather.js
allPlugins.Weather = (() => {
  var weatherForLang = { en: async (q) => {
    const resp = await (await window.fetch(`https://api.accuweather.com/locations/v1/cities/autocomplete?q=${q}&apikey=d41dfd5e8a1748d0970cba6637647d96&language=en-us&get_param=value`)).json();
    let cityId = resp[0].Key;
    let countryCode = resp[0].Country.ID.toLowerCase();
    let cityName = resp[0].LocalizedName.replace(" ", "-");
    window.location.href = `https://www.accuweather.com/en/${countryCode}/${cityName}/${cityId}/weather-forecast/${cityId}`;
  } };
  function registerWeatherCbForLang(lang, cb) {
    weatherForLang[lang] = cb;
  }
  var Weather_default = { ...PluginBase, ...{ "commands": { "Check the Weather": { "pageFn": async (transcript, q) => {
    const curLang = PluginBase.util.getLanguage();
    const shortenedLang = curLang.substr(0, 2);
    let chosenLang;
    if (curLang in weatherForLang) {
      chosenLang = curLang;
    } else if (shortenedLang in weatherForLang) {
      chosenLang = shortenedLang;
    } else {
      chosenLang = "en";
    }
    return weatherForLang[chosenLang](q.preTs);
  } } } } };
  registerWeatherCbForLang("ja", (q) => {
    window.location.href = `https://tenki.jp/search/?keyword=${q}`;
  });
  registerWeatherCbForLang("ru", (q) => {
    return window.location.href = `https://yandex.ru/pogoda/search?request=${q}`;
  });
  return Weather_default;
})();
