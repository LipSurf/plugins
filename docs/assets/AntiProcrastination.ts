/// <reference types="lipsurf-plugin-types"/>
declare const PluginBase: IPluginBase;

export default <IPluginBase & IPlugin> {...PluginBase, ...{
    niceName: 'Anti-procrastination',
    description: 'Helpers for overcoming procrastination.',
    match: /.*/,
    commands: [{
        name: 'Self destructing tab',
        description: 'Open a new tab with x website for y minutes. Useful for limiting the time-sucking power of sites like facebook, reddit, twitter etc.',
        global: true,
        match: 'open * for # minutes',
        pageFn: (transcript: string, siteStr: string, minutes: number) => {
            console.log(`site: ${siteStr}, minutes: ${minutes}`);
        }
    }],
}};
