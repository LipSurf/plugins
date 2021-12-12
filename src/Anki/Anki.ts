/// <reference types="@lipsurf/types/extension"/>
declare const PluginBase: IPluginBase;

export default <IPluginBase & IPlugin>{
  ...PluginBase,
  ...{
    niceName: "Anki",
    description: "Anki web flashcard functionality.",
    version: "4.2.4-alpha.0",
    apiVersion: 2,
    match: [/^https:\/\/ankiweb\.net/, /^https:\/\/ankiuser\.net/],
    homophones: {
      "and key": "anki",
      "show insta": "show answer",
      "show enter": "show answer",
      "show cancer": "show answer",
      "should i answer": "show answer",
      "show me answer": "show answer",
    },
    authors: "Miko",

    commands: [
      {
        name: "Anki",
        description: "Go to ankiweb decks page.",
        match: "anki",
        global: true,
        pageFn: async () => {
          window.location.href = "https://ankiweb.net/decks/";
        },
      },
      {
        name: "Select Answer Difficulty",
        description: "Select the ease level after seeing the answer.",
        // only works with the default ease levels...
        match: ["again", "hard", "good", "easy"],
        pageFn: async ({ preTs, normTs }) => {
          let capitalized = normTs.charAt(0).toUpperCase() + normTs.slice(1);
          (<HTMLElement>(
            document.evaluate(
              `//*[@id='easebuts']//button[contains(text(), "${capitalized}")]`,
              document,
              null,
              XPathResult.FIRST_ORDERED_NODE_TYPE
            ).singleNodeValue
          ))!.click();
        },
      },
      {
        name: "Show Answer",
        description: "Show the other side of the flash card.",
        match: "show answer",
        pageFn: async () => {
          document.querySelector<HTMLElement>("#ansbuta")!.click();
        },
      },
    ],
  },
};
