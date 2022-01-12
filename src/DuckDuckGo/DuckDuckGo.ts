/*
 * LipSurf plugin for DuckDuckGo search
 */
/// <reference types="@lipsurf/types/extension"/>
declare const PluginBase: IPluginBase;

export default <IPluginBase & IPlugin>{
  ...PluginBase,
  ...{
    niceName: "DuckDuckGo",
    description: "The duckduckgo search engine.",
    version: "4.4.0",
    apiVersion: 2,
    match: /.*/,
    homophones: {
      search: "duck",
    },
    authors: "Aparajita Fishman",

    commands: [
      {
        name: "Search",
        description: "Do a duckduckgo search.",
        global: true,
        match: "duck *",
        fn: (transcript, { preTs, normTs }: TsData) => {
          chrome.tabs.create({
            url: `https://duckduckgo.com/?q=${preTs}`,
            active: true,
          });
        },
      },
    ],
  },
};
