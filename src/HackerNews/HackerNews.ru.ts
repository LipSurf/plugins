/// <reference types="lipsurf-types/extension"/>
import HackerNewsPlugin from './HackerNews';

HackerNewsPlugin.languages!.ru = {
    niceName: 'Хакер Ньюс',
    description: 'Плагин для сайта news.ycombinator.com.',
    authors: "Hanna",
    homophones: {
        "hacker news": "хакер ньюс",
    },
    commands: {
        'Upvote': {
            name: 'Голосовать за',
            description: "Голосует за пост названного номера",
            match: ['голосовать за #', 'голосовать'],
        },
        'Visit Comments': {
            name: 'Открыть комментарии',
            description: "Открывает комментарии к выбранному посту",
            match: ['комментарии #'],
        },
        'Visit Post': {
            name: 'Открыть пост',
            description: "Кликает на пост названного номера",
            match: ['открыть #', 'открыть'],
        },
        'Next Page': {
            name: 'Следующая страница',
            description: "Делает видимыми следующие посты",
            match: ['следующая страница', 'больше'],
        },
    }
};
