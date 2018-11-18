
/// <reference path="../@types/plugin-interface.d.ts"/>
import { RedditPlugin } from "./Reddit";

RedditPlugin.Plugin.languages.ru = {
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
