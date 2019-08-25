/*
 * LipSurf plugin for Wikipedia search
 */
/// <reference types="lipsurf-plugin-types"/>
declare const PluginBase: IPluginBase;

export default <IPluginBase & IPlugin> {...PluginBase, ...{
    niceName: 'Wikipedia',
    description: 'The Wikipedia search engine.',
    version: '2.5.1',
    match: /.*/,
    homophones: {
      'wiki': 'wikipedia',
    },
    authors: 'Aparajita Fishman',

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
  }
};
