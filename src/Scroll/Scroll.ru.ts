/// <reference types="lipsurf-types/extension"/>
import Scroll from "./Scroll";

Scroll.languages!.ru = {
    niceName: "Браузер",
    description: "Контроль действий в браузере, как-то: создание новой вкладки, навигация по странице (назад, вперед, вниз), вызов справки и т.д.",
    homophones: {
        "тунис": "вниз",
        "обнинск": "вниз",
        "знаешь": "вниз",
        "вниис": "вниз",
        "beer": "вверх",
        "вир": "вверх",
        "вера": "вверх",
    },
    commands: {
        "Scroll Bottom": {
            name: "Прокрутить в конец страницы",
            match: ["в конец", "конец страницы"]
        },
        "Scroll Down a Little": {
            name: "Прокрутить немного вниз",
            match: ["[немного/чутьчуть] вниз"]
        },
        "Scroll Down": {
            name: "Прокрутить вниз",
            match: ["вниз"],
        },
        "Scroll Top": {
            name: "Вернуться на верх страницы",
            match: ["на верх страницы"]
        },
        "Scroll Up a Little": {
            name: "Прокрутить немного вверх",
            match: ["[немного/чутьчуть] вверх"]
        },
        "Scroll Up": {
            name: "Прокрутить вверх",
            match: ["вверх"]
        },
        "Scroll Left": {
            name: "Прокрутить влево",
            match: ["влево"]
        },
        "Scroll Right": {
            name: "Прокрутить вправо",
            match: ["вправо"],
        },
        "Auto Scroll": {
            name: "Автопрокрутка",
            match: "автопрокрутка"
        }
    },
};

