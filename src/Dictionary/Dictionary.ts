/// <reference types="lipsurf-types/extension"/>
declare const PluginBase: IPluginBase;

export default <IPluginBase & IPlugin> {...PluginBase, ...{
    niceName: 'Dictionary',
    description: 'Quickly lookup words in an English dictionary. Switch to another language to lookup words in the language\'s respective dictionary.',
    version: '3.7.0',
    match: [/https?:\/\/www\.merriam-webster\.com/, /https?:\/\/www\.weblio\.jp/],
    authors: "Miko",

    commands: [{
        name: 'Lookup Word',
        description: "Lookup a word in the dictionary.",
        global: true,
        match: 'dictionary *',
        pageFn: async (transcript: string, query: string) => {
            let selectedLang = PluginBase.util.getLanguage();
            if (selectedLang.startsWith('en')) {
                window.location.href = `https://www.merriam-webster.com/dictionary/${query}`;
            } else {
                window.location.href = `https://www.weblio.jp/content/${query}`;
            }
        }
    },
    ],
}};
