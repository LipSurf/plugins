/// <reference types="lipsurf-types/extension"/>
import Weather, { registerWeatherCbForLang } from "./Weather";

registerWeatherCbForLang('ja', (q) => {
    window.location.href = `https://tenki.jp/search/?keyword=${q}`;
});

Weather.languages!.ja = {
    niceName: '天気',
    authors: "Hiroki Yamazaki",
    commands: {
        'Check the Weather': {
            name: "天気を調べる",
            description: '任意の都市の天気を調べます。',
            match: ['てんき*', 'てんきよほう*'],
        },
    }
};
