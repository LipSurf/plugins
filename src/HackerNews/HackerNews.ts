/// <reference types="lipsurf-plugin-types"/>
declare const PluginBase: IPluginBase;

function getThingAtIndex(index: number) {
    return $(`table.itemlist tr td .rank:contains("${index}")`).closest('tr.athing');
}

export default <IPluginBase & IPlugin> {...PluginBase, ...{
    niceName: 'Hacker News',
    description: 'Basic controls for news.ycombinator.com.',
    version: '2.3.3',
    match: /^https?:\/\/news\.ycombinator\.com/,
    homophones: {
        'floor': 'more',
        '4': 'more',
    },
    authors: "Miko",

    commands: [
        {
            name: 'Hacker News',
            global: true,
            match: ['hacker news', 'y combinator'],
            pageFn: async () => {
                window.location.href = 'https://news.ycombinator.com/';
            }
        },
        {
            name: 'Upvote',
            description: "Upvote a post",
            match: 'upvote #',
            pageFn: async (transcript:string, index:number) => {
                getThingAtIndex(index).find('.votearrow[title="upvote"]').get(0).click();
            }
        },
        {
            name: 'Visit Comments',
            description: "See the comments for a given post",
            match: ['comments #', 'discuss #'],
            pageFn: async (transcript:string, index:number) => {
                getThingAtIndex(index).find('+tr .subtext a[href^="item?id="]').get(0).click();
            }
        },
        {
            name: 'Visit Post',
            description: "Click a post",
            match: ['click #', 'visit #'],
            pageFn: async (transcript:string, index:number) => {
                getThingAtIndex(index).find('a.storylink').get(0).click();
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
}};
