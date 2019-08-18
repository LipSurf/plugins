/*
 * LipSurf plugin for going to popular sites
 */
/// <reference types="lipsurf-plugin-types"/>
declare const PluginBase: IPluginBase;

export default <IPluginBase & IPlugin> {...PluginBase, ...{
    niceName: 'Top Sites',
    description: 'Shortcuts for going to popular websites.',
    version: '2.4.0',
    match: /.*/,
    authors: "Miko",

    commands: [
        {
            name: 'Youtube',
            global: true,
            match: 'youtube',
            minConfidence: 0.5,
            pageFn: async () => {
                window.location.href = 'https://www.youtube.com/';
            }
        },
        {
            name: 'Wikipedia',
            global: true,
            match: 'wikipedia',
            pageFn: async () => {
                window.location.href = 'https://www.wikipedia.org/';
            }
        },
        {
            name: 'Facebook',
            global: true,
            match: 'facebook',
            pageFn: async () => {
                window.location.href = 'https://www.facebook.com/';
            }
        },
        {
            name: 'Twitter',
            global: true,
            match: 'twitter',
            pageFn: async () => {
                window.location.href = 'https://twitter.com/';
            }
        },
        {
            name: 'Instagram',
            global: true,
            match: 'instagram',
            pageFn: async () => {
                window.location.href = 'https://www.instagram.com/';
            }
        },
        {
            name: 'Amazon',
            global: true,
            match: 'amazon',
            pageFn: async () => {
                window.location.href = 'https://www.amazon.com/';
            }
        },
        {
            name: 'Ebay',
            global: true,
            match: 'ebay',
            pageFn: async () => {
                window.location.href = 'https://www.ebay.com/';
            }
        },
        {
            name: 'VK',
            global: true,
            match: 'vk',
            minConfidence: 0.5,
            pageFn: async () => {
                window.location.href = 'https://vk.com';
            }
        },
        {
            name: 'Netflix',
            global: true,
            match: 'netflix',
            minConfidence: 0.5,
            pageFn: async () => {
                window.location.href = 'https://www.netflix.com';
            }
        },
        {
            name: 'Twitch',
            global: true,
            match: 'twitch',
            pageFn: async () => {
                window.location.href = 'https://twitch.tv';
            }
        },
        {
            name: 'New York Times',
            global: true,
            match: 'new york times',
            pageFn: async () => {
                window.location.href = 'https://www.nytimes.com';
            }
        },
        {
            name: 'Github',
            global: true,
            match: 'github',
            pageFn: async () => {
                window.location.href = 'https://github.com/';
            }
        },
        {
            name: 'Product Hunt',
            global: true,
            match: 'product hunt',
            pageFn: async() => {
                window.location.href = 'https://www.producthunt.com';
            }
        }
    ]
    }
};
