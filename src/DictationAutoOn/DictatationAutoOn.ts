import { PluginBase } from '../PluginBase';

export module DictationAutoOnPlugin {
    export let Plugin: IPlugin & IPluginBase = Object.assign<{}, IPluginBase, IPlugin>({}, PluginBase, {
        niceName: 'Dictation Auto On',
        description: 'Automatically go into dictation mode when LipSurf is turned on.',
        version: '1.0.0',
        match: /.*/,
        authors: "Miko",

        init: () => {
            Plugin.util.enterContext('Dictate');
        },

        commands: [],
    });
}
