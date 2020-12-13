/// <reference types="lipsurf-types/extension"/>
import EnglishJapaneseDictionary from "./EnglishJapaneseDictionary";

EnglishJapaneseDictionary.languages!.ja = {
  niceName: "英語＜ー＞日本語の辞書",
  description: "英語と日本語の言葉を辞書でひいてごらん。",
  authors: "Miko",
  commands: {
    "Japanese Word Lookup": {
      name: "日本語の言葉を検索する",
      match: "じしょ*",
    },
  },
};
