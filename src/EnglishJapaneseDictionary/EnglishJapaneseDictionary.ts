/// <reference path="../@types/plugin-interface.d.ts"/>
import { PluginBase } from '../PluginBase';

export module EnglishJapaneseDictionaryPlugin {
    export let Plugin: IPlugin & IPluginBase = Object.assign<{}, IPluginBase, IPlugin>({}, PluginBase, {
        niceName: 'Dictionary for Japanese Language Learners',
        description: 'Quickly lookup words in a English ⬌ Japanese dictionary.',
        version: '1.0.0',
        apiVersion: '1',
        match: /https?:\/\/\.jisho\.org/,
        homophones: {
        },
        authors: "Miko",

        commands: [{
            name: 'Japanese Word Lookup',
            description: "Lookup an English word in an English ⬌ Japanese dictionary.",
            global: true,
            match: 'japanese dictionary *',
            pageFn: async (transcript: string, query: string) => {
                window.location.href = `https://jisho.org/search/${query}`;
            }
        },
        ],
    });
}
