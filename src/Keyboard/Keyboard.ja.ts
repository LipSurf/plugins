/// <reference types="@lipsurf/types/extension"/>
import Keyboard from "./Keyboard";

Keyboard.languages!.ja = {
  niceName: "キーボード",
  description: "キーボードのキーを個別に声で押せます。",
  authors: "Hiroki Yamazaki, Miko",
  commands: {
    "Press Tab": {
      name: "Tabを押す",
      description: "Tabキーを押すのと同じ動作をします。",
      match: "たぶをおす",
    },
    "Press Enter": {
      name: "Enterを押す",
      description: "Enterキーを押すのと同じ動作をします。",
      match: "えんたーをおす",
    },
    "Press Down": {
      name: "↓を押す",
      description: "↓キーを押すのと同じ動作をします。",
      match: "したをおす",
    },
    "Press Up": {
      name: "↑を押す",
      description: "↑キーを押すのと同じ動作をします。",
      match: "うえをおす",
    },
    "Press Left": {
      name: "←を押す",
      description: "←キーを押すのと同じ動作をします。",
      match: "ひだりをおす",
    },
    "Press Right": {
      name: "→を押す",
      description: "→キーを押すのと同じ動作をします。",
      match: "みぎをおす",
    },
  },
};
