import PluginBase from 'chrome-extension://lnnmjmalakahagblkkcnjkoaihlfglon/dist/modules/plugin-base.js';import ExtensionUtil from 'chrome-extension://lnnmjmalakahagblkkcnjkoaihlfglon/dist/modules/extension-util.js';var e={languages:{ja:{niceName:"天気",authors:"Hiroki Yamazaki",commands:{"Check the Weather":{name:"天気を調べる",description:"任意の都市の天気を調べます。",match:["てんき[/よほう]*"]}}},ru:{niceName:"Прогноз погоды",commands:{"Check the Weather":{name:"Погода",description:'Узнать прогноз погоды в том или ином городе. Например, "погода минск" (название города не склоняется).',match:"погода *"}}}},niceName:"Weather",match:/.*accuweather\.com/,version:"4.4.0",apiVersion:2,commands:[{name:"Check the Weather",description:"Check the weather for a given city.",global:!0,match:["[weather/forecast] [for/in] *"]}]};export{e as default};
LS-SPLITallPlugins.Weather=(()=>{var r={en:async e=>{let a=await(await window.fetch(`https://api.accuweather.com/locations/v1/cities/autocomplete?q=${e}&apikey=d41dfd5e8a1748d0970cba6637647d96&language=en-us&get_param=value`)).json(),t=a[0].Key,o=a[0].Country.ID.toLowerCase(),n=a[0].LocalizedName.replace(" ","-");window.location.href=`https://www.accuweather.com/en/${o}/${n}/${t}/weather-forecast/${t}`}};function c(e,a){r[e]=a}var s={...PluginBase,commands:{"Check the Weather":{pageFn:async(e,a)=>{let t=PluginBase.util.getLanguage(),o=t.substr(0,2),n;return t in r?n=t:o in r?n=o:n="en",r[n](a.preTs)}}}};return c("ja",e=>{window.location.href=`https://tenki.jp/search/?keyword=${e}`}),c("ru",e=>window.location.href=`https://yandex.ru/pogoda/search?request=${e}`),s})();
LS-SPLITallPlugins.Weather=(()=>{var r={en:async e=>{let a=await(await window.fetch(`https://api.accuweather.com/locations/v1/cities/autocomplete?q=${e}&apikey=d41dfd5e8a1748d0970cba6637647d96&language=en-us&get_param=value`)).json(),t=a[0].Key,o=a[0].Country.ID.toLowerCase(),n=a[0].LocalizedName.replace(" ","-");window.location.href=`https://www.accuweather.com/en/${o}/${n}/${t}/weather-forecast/${t}`}};function c(e,a){r[e]=a}var s={...PluginBase,commands:{"Check the Weather":{pageFn:async(e,a)=>{let t=PluginBase.util.getLanguage(),o=t.substr(0,2),n;return t in r?n=t:o in r?n=o:n="en",r[n](a.preTs)}}}};return c("ja",e=>{window.location.href=`https://tenki.jp/search/?keyword=${e}`}),c("ru",e=>window.location.href=`https://yandex.ru/pogoda/search?request=${e}`),s})();
