/*
 * LipSurf plugin for creating a new empty tab
 */
/// <reference types="lipsurf-plugin-types"/>
declare const PluginBase: IPluginBase;

export default <IPluginBase & IPlugin> {...PluginBase, ...{
  niceName: 'New tab',
  description: 'Create a new empty tab.',
  version: '2.10.0',
  match: /.*/,
  homophones: {
    'open tab': 'new tab',
  },
  authors: 'Aparajita Fishman',

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
}};
