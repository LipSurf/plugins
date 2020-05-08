/// <reference types="lipsurf-types/extension"/>
import Google from './Google';

Google.languages!.ru = {
    niceName: "Гугл",
    description: "Поиск в Google",
    authors: "Hanna",
    homophones: {
        "google": "гугл"
    },
    commands: {
        "Search": {
            name: "Поиск в Google",
            description: "Сказажите \"Гугл\" и задайте свой вопрос",
            match: ["гугл *", "искать *", "найти *"]
        },
        "Google Calendar": {
            name: "Google Календарь",
            description: "Открывает Google Календарь",
            match: ["гугл календарь", "google calendar"]
        },
        "Add Event to Google Calendar": {
            name: "Добавить событие в Google Calendar",
            description: "Добавляет событие в Google Календарь",
            match: ["добавить в гугл календарь", "добавить в google calendar"]
        }
    }
};
