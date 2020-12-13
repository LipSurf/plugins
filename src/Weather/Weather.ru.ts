/// <reference types="lipsurf-types/extension"/>
import Weather, { registerWeatherCbForLang } from "./Weather";

registerWeatherCbForLang("ru", (q) => {
  return (window.location.href = `https://yandex.ru/pogoda/search?request=${q}`);
});

Weather.languages!.ru = {
  niceName: "Прогноз погоды",
  commands: {
    "Check the Weather": {
      name: "Погода",
      description:
        'Узнать прогноз погоды в том или ином городе. Например, "погода минск" (название города не склоняется).',
      match: "погода *",
    },
  },
};
