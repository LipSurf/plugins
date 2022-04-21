/// <reference types="@lipsurf/types/extension"/>
import Scroll from "./Scroll";

Scroll.languages!.uk = {
  niceName: "браузер",
  description: "",
  homophones: {},
  authors: "Tanya Kunica",
  commands: {
    "Scroll Down": {
      name: "прокрутити вниз",
      match: ["вниз", "прокрутити вниз"],
    },
    "Scroll Up": {
      name: "прокрутити вгору",
      match: ["вгору", "прокрутити вгору", "наверх", "прокрутити наверх"],
    },
    "Auto Scroll": {
      name: "автопрокрутка",
      match: ["автопрокрутка", "авто прокрутка", "автоматична прокрутка"],
      description: "Постійне повільне прокручування сторінки, в темпі читання.",
    },
    "Slow Down": {
      name: "уповільнення",
      match: ["повільніше", "уповільнення"],
      description: "Уповільнення автопрокрутки.",
    },
    "Speed Up": {
      name: "пришвидшення",
      match: ["швидше", "пришвидшення"],
      description: "Пришвидшення автопрокрутки.",
    },
    "Stop Scrolling": {
      name: "зупинка прокрутки",
      match: ["стоп"],
      description: "Зупинення автопрокрутки.",
    },
    "Scroll Bottom": {
      name: "прокрутити в кінець сторінки ",
      match: ["в кінець", "кінець сторінки"],
    },
    "Scroll Top": {
      name: "прокрутити на початок",
      match: ["вгору", "початок сторінки", " прокрутити на початок"],
    },
    "Scroll Help Down": {
      name: "прокрутити довідку вниз",
      match: ["прокрутити довідку вниз"],
    },
    "Scroll Help Up": {
      name: "прокрутити довідку вгору",
      match: ["прокрутити довідку [вгору/наверх]"],
    },
    "Scroll Down a Little": {
      name: "прокрутити трохи нижче",
      match: ["[трішки/трохи] [вниз/нижче]", "нижче"],
    },
    "Scroll Up a Little": {
      name: "прокрутити трохи вище",
      match: ["[трішки/трохи] [вгору/вище]", "вище"],
    },
    "Scroll Left": {
      name: "прокрутити ліворуч",
      match: ["ліворуч", "наліво"],
    },
    "Scroll Right": {
      name: "прокрутити праворуч",
      match: ["праворуч", "направо"],
    },
  },
};
