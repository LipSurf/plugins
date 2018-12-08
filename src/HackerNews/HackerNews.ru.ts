/// <reference path="../@types/plugin-interface.d.ts"/>
import { PluginBase } from '../PluginBase';

    export let Plugin: IHackerNewsPlugin = Object.assign({}, PluginBase, {
        niceName: 'Hacker News',
        description: 'Basic controls for news.ycombinator.com.',
        authors: "Hanna",
        commands: [
            {
                command: 'Upvote',
                name: 'Голосовать за',
                description: "Голосовать за пост названного #, upvote",
                match: ['голосовать за #'],
                }
            },
            {
                command: 'Visit Comments',
                name: 'Открыть комментарии',
                description: "Открывает комментарии к выбранному посту",
                match: ['открыть комментарии #', 'комментарии #'],
                }
            },
            {
                command: 'Visit Post',
                name: 'Открыть пост',
                description: "Кликает на пост выбранного #",
                match: ['кликнуть #', 'открыть #'],
                }
            },
            {
                command: 'Next Page',
                name: 'Следующая страница',
                description: "Показать больше постов",
                match: ['следующая страница', 'показать больше', 'больше'],
                }
            },

        ],
    });
}
