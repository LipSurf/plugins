/*
* LipSurf plugin for DuckDuckGo search
*/
/// <reference types="lipsurf-plugin-types"/>
declare const PluginBase: IPluginBase;

export default <IPluginBase & IPlugin> {...PluginBase, ...{
    niceName: 'DuckDuckGo',
    description: 'The duckduckgo search engine.',
    version: '2.8.0',
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
}
};
