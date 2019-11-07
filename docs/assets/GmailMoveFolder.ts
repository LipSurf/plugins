/// <reference types="lipsurf-plugin-types"/>
declare const PluginBase: IPluginBase;

export default <IPluginBase & IPlugin> {...PluginBase, ...{
    niceName: 'Gmail',
    match: /^https:\/\/mail\.google\.com/,
    commands: [{
        name: 'Move to Folder',
        description: 'Move already selected emails to a spoken folder',
        match: {
            description: 'Say "move to [folder name]"',
            fn: (transcript: string) => {
                // exercise left to the reader...
            },
        },
        pageFn: () => {
            // exercise left to the reader...
        }
    }],
}};
