
/// <reference path="../@types/plugin-interface.d.ts"/>
/// <reference path="Reddit.ts" />

namespace RedditPlugin {
    Plugin.languages.ja = {
        niceName: "レディット",
        description: "Redditで操作します",
        authors: "Miko",
        commands: {
            "View Comments": {
                name: "コメントを診ます",
                match: ["こめんと#"],
            }
        }
    };
}
