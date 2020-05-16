/// <reference types="lipsurf-types/extension"/>
import Google from './Google';

Google.languages!.ja = {
    niceName: "ググる",
    description: "Googleで検索します",
    authors: "Miko",
    homophones: {
        'google': 'ぐぐる'
    },
    commands: {
        "Search": {
            name: "検索します",
            description: "ググる「空欄を埋めて下さい」",
            match: "ぐぐる*",
        }
    }
};