/*
 * LipSurf plugin for Google search
 */
import { PluginBase } from "../common/plugin-lib";

class GooglePlugin extends PluginBase {
    static friendlyName = 'Google';
    static description = 'The google search engine.';
    static version = '1.0.0';
    static match = /.*/;
    static homophones = {
    };

    static commands = [{
        name: 'Search',
        description: "Do a google search",
        match: (input) => {
            const REGX = /^(?:search|google) (.*)/;
            let match = input.match(REGX);
            // console.log(`navigate subreddit input: ${input} match: ${match}`);
            if (match) {
                return [match[1]];
            }
        },
        delay: 3000,
        runOnPage: function (searchQuery) {
            window.location.href = `https://www.google.com/search?q=${searchQuery}`;
        }
    }
    ];
}

