/// <reference types="lipsurf-plugin-types"/>
import TopSitesPlugin from "./TopSites";

TopSitesPlugin.languages.ru = {
    niceName: 'Популярные сайты',
    description: 'Комманды для перехода на популярные сайты',
    homophones: {

    },
    authors: "Hanna",

    commands: {
        "Youtube": {
            name: 'Youtube',
            match: ['ютюб', 'youtube']
        },

        "Wikipedia": {
            name: 'Wikipedia',
            match: ['википедия', 'wikipedia']
            },

        "Facebook": {
            name: 'Facebook',
            match: ['фэйсбук', 'facebook']
        },

        "Twitter": {
            name: 'Twitter',
            match: ['твиттер', 'twitter']
        },

        "Instagram": {
            name: 'Instagram',
            match: ['инстаграм', 'instagram']
        },
        "Amazon": {
            name: 'Amazon',
            match: ['амазон', 'amazon']
        },
        "Ebay": {
            name: 'Ebay',
            match: ['ебэй', 'ибэй', 'ebay']
        },
        "VK": {
            name: 'Вконтакте',
            match: ['вконтакте', "вк"]
        },
        "Netflix": {
            name: 'Netflix',
            match: ['нэтфликс', 'нетфликс', 'netflix']
        },
        "Twitch": {
            name: 'Twitch',
            match: ['твич', 'twitch']
        },
        "New York Times": {
            name: 'New York Times',
            match: ['нью йорк таймс', 'ньюйорк таймс', 'new york times']
        },
        "Github": {
            name: 'Github',
            match: ['гитхаб', 'github']
        },
        "Hacker News": {
            name: 'Hacker News',
            match: ['хакер ньюз', 'уай комбинатор', 'уай комбинэтор', 'hacker news', 'y combinator'],
        },
        "Product Hunt": {
            name: 'Product Hunt',
            match: ['продакт хант', 'product hunt']
        },
        }
};
