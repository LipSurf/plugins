/*
 * LipSurf plugin for DuckDuckGo search
 */
/// <reference path="../@types/plugin-interface.d.ts"/>

namespace DuckDuckGoPlugin {
  declare const PluginBase: IPlugin;

  interface IDuckDuckGoPlugin extends IPlugin {

  }

  export let Plugin = Object.assign({}, PluginBase, {
    niceName: 'DuckDuckGo',
    description: 'The duckduckgo search engine.',
    version: '1.0.0',
    apiVersion: '1',
    match: /.*/,
    homophones: {
      'search': 'duck',
    },
    authors: "Aparajita",

    commands: [{
      name: 'Search',
      description: "Do a duckduckgo search.",
      global: true,
      match: 'duck *',
      fn: async (transcript: string, searchQuery: string) => {
        chrome.tabs.create({
          url: `https://duckduckgo.com/?q=${searchQuery}`,
          active: true
        });
      }
    }
    ],
  });
}
