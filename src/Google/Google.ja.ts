/// <reference path="../@types/plugin-interface.d.ts"/>
/// <reference path="Google.ts" />

namespace GooglePlugin {
    Plugin.languages.ja = {
        niceName: "ググる",
        description: "Googleで検索します",
        authors: "Miko",
        commands: {
            "Search": {
                name: "検索します",
                match: {
                    description: "ググる「空欄を埋めて下さい」",
                    fn: (input) => {
                        const REGX = /^(?:ぐーぐる|ぐぐる|google) (.*)/;
                        let match = input.match(REGX);
                        if (match) {
                            return [match[1]];
                        }
                    }
                },
            }
        }
    };
}