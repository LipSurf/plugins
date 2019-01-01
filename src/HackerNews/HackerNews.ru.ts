/// <reference path="../@types/plugin-interface.d.ts"/>
import { HackerNewsPlugin } from './HackerNews';

        niceName: 'Hacker News',
        description: 'Basic controls for news.ycombinator.com.',
        authors: "Hanna",
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
    };
