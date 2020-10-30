/// <reference types="lipsurf-types/extension"/>
import WikipediaPlugin from './Wikipedia';

WikipediaPlugin.languages!.ru = {
    niceName: 'Wikipedia',
    description: 'Поиск по Википедии.',
    authors: 'Hanna',
    homophones: {
        'википедия': 'wikipedia',
    },
    commands: {
      "Wikipedia": {
          name: 'Википедия',
          description: "Выполняет поиск по википедии. Скажите википедия [запрос].",
          match: ['википедия *',],
      }
    },
};
