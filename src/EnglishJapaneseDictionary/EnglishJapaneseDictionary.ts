/// <reference types="lipsurf-types/extension"/>
declare const PluginBase: IPluginBase;

export default <IPluginBase & IPlugin>{
  ...PluginBase,
  ...{
    niceName: "Dictionary for Japanese Language Learners",
    description: "Quickly lookup words in a English ⬌ Japanese dictionary.",
    version: "3.10.0",
    match: /https?:\/\/\.jisho\.org/,
    authors: "Miko",

    commands: [
      {
        name: "Japanese Word Lookup",
        description:
          "Lookup an English word in an English ⬌ Japanese dictionary.",
        global: true,
        match: "japanese dictionary *",
        pageFn: async (transcript: string, query: string) => {
          window.location.href = `https://jisho.org/search/${query}`;
        },
      },
    ],
  },
};
