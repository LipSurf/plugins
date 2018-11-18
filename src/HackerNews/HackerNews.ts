/// <reference path="../@types/plugin-interface.d.ts"/>
import { PluginBase } from '../PluginBase';

export module HackerNewsPlugin {
    interface IHackerNewsPlugin extends IPlugin {
        getThingAtIndex: (index: number) => JQuery<HTMLElement>;
    }

    export let Plugin: IHackerNewsPlugin = Object.assign({}, PluginBase, {
        niceName: 'Hacker News',
        description: 'Basic controls for news.ycombinator.com.',
        version: '1.0.0',
        apiVersion: '1',
        match: /^https?:\/\/news\.ycombinator\.com/,
        homophones: {
            'floor': 'more',
            '4': 'more',
        },
        authors: "Miko",

        getThingAtIndex: (index: number) => {
            return $(`table.itemlist tr td .rank:contains("${index}")`).closest('tr.athing');
        },

        commands: [
            {
                name: 'Upvote',
                description: "Upvote a post",
                match: 'upvote #',
                pageFn: async (transcript:string, index:number) => {
                    Plugin.getThingAtIndex(index).find('.votearrow[title="upvote"]').get(0).click();
                }
            },
            {
                name: 'Visit Comments',
                description: "See the comments for a given post",
                match: ['comments #', 'discuss #'],
                pageFn: async (transcript:string, index:number) => {
                    Plugin.getThingAtIndex(index).find('+tr .subtext a[href^="item?id="]').get(0).click();
                }
            },
            {
                name: 'Visit Post',
                description: "Click a post",
                match: ['click #', 'visit #'],
                pageFn: async (transcript:string, index:number) => {
                    Plugin.getThingAtIndex(index).find('a.storylink').get(0).click();
                }
            },
            {
                name: 'Next Page',
                description: "Show more hacker news items",
                match: ['next page', 'show more', 'more'],
                pageFn: async (transcript:string, index:number) => {
                    $('a.morelink').get(0).click();
                }
            },

        ],
    });
}
