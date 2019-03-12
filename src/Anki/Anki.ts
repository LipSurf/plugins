/// <reference path="../@types/plugin-interface.d.ts"/>
import { PluginBase } from '../PluginBase';

export module AnkiPlugin {
    export let Plugin: IPlugin & IPluginBase = Object.assign<{}, IPluginBase, IPlugin>({}, PluginBase, {
        niceName: 'Anki',
        description: 'Anki web flashcard functionality.',
        version: '1.0.0',
        apiVersion: '1',
        match: [/^https:\/\/ankiweb\.net/, /^https:\/\/ankiuser\.net/],
        homophones: {
            'and key': 'anki',
            'should i answer': 'show answer',
            'show me answer': 'show answer',
        },
        authors: "Miko",

        commands: [
            {
                name: 'Anki',
                description: 'Go to ankiweb decks page',
                match: 'anki',
                global: true,
                pageFn: async () => {
                    window.location.href = 'https://ankiweb.net/decks/';
                }
            },
        {
            name: 'Select Answer Difficulty',
            description: "Select the ease level after seeing the answer.",
            // only works with the default ease levels...
            match: ['again', 'hard', 'good', 'easy'],
            pageFn: async (transcript:string) => {
                let capitalized = transcript.charAt(0).toUpperCase() + transcript.slice(1);
                $(`#easebuts button:contains("${capitalized}")`).click();
            }
        },
        {
            name: 'Show Answer',
            description: "Show the other side of the flash card.",
            match: 'show answer',
            pageFn: async () => {
                $('#ansbuta').click();
            }
        }],
    });
}
