/*
 * LipSurf plugin for Google search
 */
/// <reference path="../@types/plugin-interface.d.ts"/>

namespace GooglePlugin {
    declare const PluginBase: IPlugin;

    interface IGooglePlugin extends IPlugin {

    }

    export let Plugin = Object.assign({}, PluginBase, {
        niceName: 'Google',
        description: 'The google search engine.',
        version: '1.0.0',
        apiVersion: '1',
        match: /.*google.com/,
        homophones: { },
        authors: "Miko",

        commands: [{
            name: 'Search',
            description: "Do a google search",
            global: true,
            match: {
                fn: (input) => {
                    const REGX = /^(?:search|google) (.*)/;
                    let match = input.match(REGX);
                    if (match) {
                        return [match[1]];
                    }
                },
                description: 'google/search [your search terms]',
            },
            delay: 1000,
            pageFn: async function (searchQuery) {
                window.location.href = `https://www.google.com/search?q=${searchQuery}`;
            }
        }
        ],
    });
}
