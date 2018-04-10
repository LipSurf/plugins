/*
 * LipSurf plugin for Google search
 */
/// <reference path="../@types/plugin-interface.d.ts"/>

export class GooglePlugin extends PluginBase {
    static friendlyName = 'Google';
    static description = 'The google search engine.';
    static version = '1.0.0';
    static apiVersion = '1';
    static match = /.*google.com/;
    static homophones = {
    };

    static commands = [{
        name: 'Search',
        description: "Do a google search",
        global: true,
        match: {
            fn: (input) => {
                const REGX = /^(?:search|google) (.*)/;
                let match = input.match(REGX);
                // console.log(`navigate subreddit input: ${input} match: ${match}`);
                if (match) {
                    return [match[1]];
                }
            },
            description: 'google/search [your search terms]',
        },
        delay: 1000,
        runOnPage: function (searchQuery) {
            window.location.href = `https://www.google.com/search?q=${searchQuery}`;
        }
    }
    ];
}
