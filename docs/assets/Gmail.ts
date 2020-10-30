/// <reference types="lipsurf-types/extension"/>
declare const PluginBase: IPluginBase;

export default <IPluginBase & IPlugin> {...PluginBase, ...{
    niceName: 'Gmail',
    match: /^https:\/\/mail\.google\.com/,
    commands: [{
        name: 'Compose Mail',
        description: 'Open the new email composition form in Gmail.',
        global: true,
        match: ['compose mail', 'write new mail'],
        pageFn: function() {
            window.location.href = 'https://mail.google.com/mail/?view=cm&fs=1';
        }
    }],
}};
