/*
 * LipSurf plugin for DuckDuckGo search
 */
/// <reference path="../@types/plugin-interface.d.ts"/>
import { PluginBase } from '../PluginBase';

export module DuckDuckGoPlugin {
  export let Plugin = Object.assign({}, PluginBase, {
    niceName: 'DuckDuckGo',
    description: 'The duckduckgo search engine.',
    version: '1.0.1',
    apiVersion: '1',
    match: /.*/,
    homophones: {
      'search': 'duck',
    },
    authors: 'Aparajita Fishman',

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
