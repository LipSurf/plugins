/*
 * LipSurf plugin for creating a new empty tab
 */
/// <reference path="../@types/plugin-interface.d.ts"/>

namespace NewTabPlugin {
  declare const PluginBase: IPlugin;

  interface INewTabPlugin extends IPlugin {

  }

  export let Plugin = Object.assign({}, PluginBase, {
    niceName: 'New tab',
    description: 'Create a new empty tab.',
    version: '1.0.0',
    apiVersion: '1',
    match: /.*/,
    homophones: {
      'open tab': 'new tab',
    },
    authors: "Aparajita",

    commands: [{
      name: 'New tab',
      description: "Create a new empty tab.",
      global: true,
      match: 'new tab',
      fn: async () => {
        chrome.tabs.create({
          active: true,
        });
      }
    }
    ],
  });
}
