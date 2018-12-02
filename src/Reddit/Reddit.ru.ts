
/// <reference path="../@types/plugin-interface.d.ts"/>
import { RedditPlugin } from "./Reddit";

RedditPlugin.Plugin.languages.ru = {
    niceName: "Reddit",
    description: "Команды для сайта Reddit.com",
    authors: "Hanna",
    commands: {
        "View Comments": {
            name: "Открыть комментарии",
            description: "Открыть комментарии к посту.",
            match: ["открыть комментарии", "комментарий #", "коммент #"],     
        }
         "Visit Post": {
            name: "Кликнуть пост",
            description: "Кликает выбранный пост.",
            match: ["кликнуть пост #", "кликнуть", "открыть пост #"],
    }
         "Expand": {
            name: "Развернуть",
            description: "Развернуть превью поста или комментария определенного номера.",
            match: ["развернуть", "развернуть #", "# развернуть"],
    }
         "Collapse": {
            name: "Свернуть",
            description: "Свернуть развернутый пост или комментарии. Автоматически сворачивает самый верхний пост/ комментарий в пределах экрана, если не назван номер.",
            match: ["свернуть", "свернуть #", "закрыть"],
    }
            "View Comments": {
            name: "Открыть комментарии",
            description: "Открыть комментарии к посту.",
            match: ["открыть комментарии", "комментарий #", "коммент #"],     
        }
};
