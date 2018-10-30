/*
 * LipSurf plugin for Wikipedia search
 */
/// <reference path="../@types/plugin-interface.d.ts"/>

namespace WikipediaPlugin {
  declare const PluginBase: IPlugin;

  interface IWikipediaPlugin extends IPlugin {

  }

  export let Plugin = Object.assign({}, PluginBase, {
    niceName: 'Wikipedia',
    description: 'The Wikipedia search engine.',
    version: '1.0.0',
    apiVersion: '1',
    match: /.*/,
    homophones: {
      'wiki': 'wikipedia',
    },
    authors: "Aparajita",

    commands: [{
      name: 'Wikipedia',
      description: "Do a wikipedia search.",
      global: true,
      match: 'wikipedia *',
      fn: async (transcript: string, searchQuery: string) => {
        chrome.tabs.create({
          url: `https://wikipedia.org/w/index.php?search=${encodeURIComponent(searchQuery).replace(/%20/g, '+')}`,
          active: true
        });
      }
    }
    ],
  });
}
