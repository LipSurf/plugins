/// <reference types="@lipsurf/types/extension"/>
import Dictionary from "./Dictionary";

Dictionary.languages!.ja = {
  niceName: "辞書",
  description: "辞書で言葉をひいてごらん",
  authors: "Miko",
  homophones: {},
  commands: {
    "Lookup Word": {
      name: "言葉を検索します",
      description: "「言葉」をひいて",
      // TODO: need to handle inflections for Japanese
      match: "*をひく",
    },
  },
};
