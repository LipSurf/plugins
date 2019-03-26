/// <reference types="lipsurf-plugin-types"/>
import { HackerNewsPlugin } from './HackerNews';

HackerNewsPlugin.Plugin.languages.ru = {
        niceName: 'Хакер Ньюс',
        description: 'Плагин для сайта news.ycombinator.com.',
        authors: "Hanna",
        homophones: {
        "hacker news": "хакер ньюс"   
        },
        commands: {
             'Upvote': {
                name: 'Голосовать за',
                description: "Голосует за пост названного номера",
                match: ['голосовать за #'],
                },
              'Visit Comments': {
                name: 'Открыть комментарии',
                description: "Открывает комментарии к выбранному посту",
                match: ['комментарии #'],
                },
              'Visit Post': {
                name: 'Открыть пост',
                description: "Кликает на пост названного номера",
                match: ['кликнуть #', 'открыть #'],
                },
              'Next Page': {
                name: 'Следующая страница',
                description: "Делает видимыми следующие посты",
                match: ['следующая страница', 'больше'],
                },
    }
  };
