/// <reference path="../@types/plugin-interface.d.ts"/>
import { WikipediaPlugin } from './Wikipedia';

WikipediaPlugin.Plugin.languages.ru = {
    niceName: 'Wikipedia',
    description: 'Поиск по Википедии.',
    authors: 'Hanna',
    homophones: {
        'википедия': 'wikipedia',
    },
    commands: [{
      "Wikipedia": {
          name: 'Википедия',
          description: "Выполняет поиск по википедии. Скажите википедия [запрос].",
          match: ['википедия *',],
      }
    }],
};
