/*
 * LipSurf plugin for Wikipedia search
 */
/// <reference types="@lipsurf/types/extension"/>
declare const PluginBase: IPluginBase;

export default <IPluginBase & IPlugin>{
  ...PluginBase,
  ...{
    niceName: "Wikipedia",
    description: "The Wikipedia search engine.",
    version: "4.5.0-alpha.0",
    apiVersion: 2,
    match: /.*/,
    homophones: {
      wiki: "wikipedia",
    },
    authors: "Aparajita Fishman",

    commands: [
      {
        name: "Wikipedia",
        description: "Do a wikipedia search.",
        global: true,
        match: "wikipedia *",
        fn: async (transcript, searchQuery: TsData) => {
          chrome.tabs.create({
            url: `https://wikipedia.org/w/index.php?search=${encodeURIComponent(
              searchQuery.preTs
            ).replace(/%20/g, "+")}`,
            active: true,
          });
        },
      },
    ],
  },
};
