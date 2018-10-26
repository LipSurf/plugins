/// <reference path="../@types/plugin-interface.d.ts"/>
namespace WeatherPlugin {
    declare const PluginBase: IPlugin;

    export let Plugin = Object.assign({}, PluginBase, {
        niceName: 'Weather',
        match: /.*accuweather\.com/,
        commands: [{
            name: 'Check the Weather',
            description: 'Check the weather for a given city.',
            // say it on any page (not just accuweather domain)
            global: true,
            match: 'weather for *',
            pageFn: async (transcript: string, q: string) => {
                // https://api.accuweather.com/locations/v1/cities/autocomplete?q=chiang%20mai&apikey=d41dfd5e8a1748d0970cba6637647d96&language=en-us&get_param=value
                // ex resp: [{"Version":1,"Key":"317505","Type":"City","Rank":41,"LocalizedName":"Chiang Mai","Country":{"ID":"TH","LocalizedName":"Thailand"},"AdministrativeArea":{"ID":"50","LocalizedName":"Chiang Mai"}}]
                // https://www.accuweather.com/en/th/chiang-mai/317505/weather-forecast/317505
                $.get(`https://api.accuweather.com/locations/v1/cities/autocomplete?q=${q}&apikey=d41dfd5e8a1748d0970cba6637647d96&language=en-us&get_param=value`, (resp) => {
                    let cityId = resp[0].Key;
                    let countryCode = resp[0].Country.ID.toLowerCase();
                    let cityName = resp[0].LocalizedName.replace(' ', '-');
                    window.location.href = `https://www.accuweather.com/en/${countryCode}/${cityName}/${cityId}/weather-forecast/${cityId}`;
                });
            }
        }],
    });
}
