/// <reference types="lipsurf-types/extension"/>
declare const PluginBase: IPluginBase;

const weatherForLang = {
  en: async (q) => {
    // https://api.accuweather.com/locations/v1/cities/autocomplete?q=chiang%20mai&apikey=d41dfd5e8a1748d0970cba6637647d96&language=en-us&get_param=value
    // ex resp: [{"Version":1,"Key":"317505","Type":"City","Rank":41,"LocalizedName":"Chiang Mai","Country":{"ID":"TH","LocalizedName":"Thailand"},"AdministrativeArea":{"ID":"50","LocalizedName":"Chiang Mai"}}]
    // https://www.accuweather.com/en/th/chiang-mai/317505/weather-forecast/317505
    const resp = await (
      await window.fetch(
        `https://api.accuweather.com/locations/v1/cities/autocomplete?q=${q}&apikey=d41dfd5e8a1748d0970cba6637647d96&language=en-us&get_param=value`
      )
    ).json();
    let cityId = resp[0].Key;
    let countryCode = resp[0].Country.ID.toLowerCase();
    let cityName = resp[0].LocalizedName.replace(" ", "-");
    window.location.href = `https://www.accuweather.com/en/${countryCode}/${cityName}/${cityId}/weather-forecast/${cityId}`;
  },
};

export function registerWeatherCbForLang(
  lang: LanguageCode,
  cb: (q: string) => void
) {
  weatherForLang[lang] = cb;
}

export default <IPluginBase & IPlugin>{
  ...PluginBase,
  ...{
    niceName: "Weather",
    match: /.*accuweather\.com/,
    version: "4.0.0",
    apiVersion: 2,
    commands: [
      {
        name: "Check the Weather",
        description: "Check the weather for a given city.",
        // say it on any page (not just accuweather domain)
        global: true,
        match: ["[weather/forecast] [for/in] *"],
        pageFn: async (transcript, q: TsData) => {
          const curLang = PluginBase.util.getLanguage();
          const shortenedLang: LanguageCode = <LanguageCode>(
            curLang.substr(0, 2)
          );
          let chosenLang: LanguageCode;
          if (curLang in weatherForLang) {
            chosenLang = curLang;
          } else if (shortenedLang in weatherForLang) {
            chosenLang = shortenedLang;
          } else {
            chosenLang = "en";
          }
          return weatherForLang[chosenLang](q.preTs);
        },
      },
    ],
  },
};
