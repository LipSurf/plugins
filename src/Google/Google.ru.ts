/// <reference path="../@types/plugin-interface.d.ts"/>
/// <reference path="Google.ts" />
namespace GooglePlugin {
    Plugin.languages.ru = {
        niceName: "Google",
        description: "Поиск в Google",
        authors: "Hanna",
        homophones: {
          "google": "гугл"
        },
        commands: {
            "Search": {
                name: "Поиск в Google",
                description: "Сказажите \"Гугл\" и задайте свой вопрос",
                match: ["гугл *", "найти в гугл *", "найди в гугл *", "искать в гугл *", "ищи в гугл *", "искать *", "ищи *", "найти *", "найди *"]
            }
        }
    };
}
