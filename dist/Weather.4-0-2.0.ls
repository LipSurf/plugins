// dist/tmp/Weather/Weather.js
var weatherForLang = { en: async (q) => {
  let resp = await (await window.fetch(`https://api.accuweather.com/locations/v1/cities/autocomplete?q=${q}&apikey=d41dfd5e8a1748d0970cba6637647d96&language=en-us&get_param=value`)).json(), cityId = resp[0].Key, countryCode = resp[0].Country.ID.toLowerCase(), cityName = resp[0].LocalizedName.replace(" ", "-");
  window.location.href = `https://www.accuweather.com/en/${countryCode}/${cityName}/${cityId}/weather-forecast/${cityId}`;
} };
function registerWeatherCbForLang(lang, cb) {
  weatherForLang[lang] = cb;
}
var Weather_default = { ...PluginBase, languages: {}, niceName: "Weather", match: /.*accuweather\.com/, version: "4.0.2", apiVersion: 2, commands: [{ name: "Check the Weather", description: "Check the weather for a given city.", global: !0, match: ["[weather/forecast] [for/in] *"], pageFn: async (transcript, q) => {
  let curLang = PluginBase.util.getLanguage(), shortenedLang = curLang.substr(0, 2), chosenLang;
  return curLang in weatherForLang ? chosenLang = curLang : shortenedLang in weatherForLang ? chosenLang = shortenedLang : chosenLang = "en", weatherForLang[chosenLang](q.preTs);
} }] };
registerWeatherCbForLang("ja", (q) => {
  window.location.href = `https://tenki.jp/search/?keyword=${q}`;
});
Weather_default.languages.ja = { niceName: "天気", authors: "Hiroki Yamazaki", commands: { "Check the Weather": { name: "天気を調べる", description: "任意の都市の天気を調べます。", match: ["てんき[/よほう]*"] } } };
registerWeatherCbForLang("ru", (q) => window.location.href = `https://yandex.ru/pogoda/search?request=${q}`);
Weather_default.languages.ru = { niceName: "Прогноз погоды", commands: { "Check the Weather": { name: "Погода", description: 'Узнать прогноз погоды в том или ином городе. Например, "погода минск" (название города не склоняется).', match: "погода *" } } };
var dumby_default = Weather_default;
export {
  dumby_default as default
};
LS-SPLIT// dist/tmp/Weather/Weather.js
allPlugins.Weather = (() => {
  var weatherForLang = { en: async (q) => {
    let resp = await (await window.fetch(`https://api.accuweather.com/locations/v1/cities/autocomplete?q=${q}&apikey=d41dfd5e8a1748d0970cba6637647d96&language=en-us&get_param=value`)).json(), cityId = resp[0].Key, countryCode = resp[0].Country.ID.toLowerCase(), cityName = resp[0].LocalizedName.replace(" ", "-");
    window.location.href = `https://www.accuweather.com/en/${countryCode}/${cityName}/${cityId}/weather-forecast/${cityId}`;
  } };
  function registerWeatherCbForLang(lang, cb) {
    weatherForLang[lang] = cb;
  }
  return { ...PluginBase, commands: { "Check the Weather": { pageFn: async (transcript, q) => {
    let curLang = PluginBase.util.getLanguage(), shortenedLang = curLang.substr(0, 2), chosenLang;
    return curLang in weatherForLang ? chosenLang = curLang : shortenedLang in weatherForLang ? chosenLang = shortenedLang : chosenLang = "en", weatherForLang[chosenLang](q.preTs);
  } } } };
})();
LS-SPLIT// dist/tmp/Weather/Weather.js
allPlugins.Weather = (() => {
  var weatherForLang = { en: async (q) => {
    let resp = await (await window.fetch(`https://api.accuweather.com/locations/v1/cities/autocomplete?q=${q}&apikey=d41dfd5e8a1748d0970cba6637647d96&language=en-us&get_param=value`)).json(), cityId = resp[0].Key, countryCode = resp[0].Country.ID.toLowerCase(), cityName = resp[0].LocalizedName.replace(" ", "-");
    window.location.href = `https://www.accuweather.com/en/${countryCode}/${cityName}/${cityId}/weather-forecast/${cityId}`;
  } };
  function registerWeatherCbForLang(lang, cb) {
    weatherForLang[lang] = cb;
  }
  return { ...PluginBase, commands: { "Check the Weather": { pageFn: async (transcript, q) => {
    let curLang = PluginBase.util.getLanguage(), shortenedLang = curLang.substr(0, 2), chosenLang;
    return curLang in weatherForLang ? chosenLang = curLang : shortenedLang in weatherForLang ? chosenLang = shortenedLang : chosenLang = "en", weatherForLang[chosenLang](q.preTs);
  } } } };
})();
