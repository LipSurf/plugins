/// <reference types="lipsurf-types/extension"/>
declare const PluginBase: IPluginBase;

export default <IPluginBase & IPlugin> {...PluginBase, ...{
        niceName: 'Dictation Auto On',
        description: 'Automatically go into dictation mode when LipSurf is turned on.',
        version: '3.3.1',
        match: /.*/,
        authors: "Miko",

        init: () => {
            PluginBase.util.enterContext(['Dictate']);
        },

        commands: [],
}};
