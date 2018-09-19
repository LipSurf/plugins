
/// <reference path="../@types/plugin-interface.d.ts"/>
/// <reference path="Reddit.ts" />
namespace RedditPlugin {
    Plugin.languages.ja = {
        niceName: "Reddit",
        description: "Поиск в Reddit",
        authors: "Hanna",
        commands: {
            "View comments": {
                name: "Открыть комментарии",
                match: ["комментарий #", "коммент #"],
            }
        }
    };
}
