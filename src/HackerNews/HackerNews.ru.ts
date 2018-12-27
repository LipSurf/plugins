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
                description: "Голосует за пост названного номера",
                match: ['голосовать за #'],
                }
            },
            {
                command: 'Visit Comments',
                name: 'Открыть комментарии',
                description: "Открывает комментарии к выбранному посту",
                match: ['комментарии #'],
                }
            },
            {
                command: 'Visit Post',
                name: 'Открыть пост',
                description: "Кликает на пост названного номера",
                match: ['кликнуть #', 'открыть #'],
                }
            },
            {
                command: 'Next Page',
                name: 'Следующая страница',
                description: "Делает видимыми следующие посты",
                match: ['следующая страница', 'больше'],
                }
            },

        ],
    });
}
