// lipsurf-plugins/src/HelloWorld/HelloWorld.ts
/// <reference types="lipsurf-plugin-types"/>
declare const PluginBase: IPluginBase;

export default <IPluginBase & IPlugin> {...PluginBase, ...{
    niceName: 'Hello World',
    description: 'A "hello world" plugin that works on the lipsurf.com domain.',
    // a RegEx that must match against the current tab's url for the plugin to be active (all of it's commands minus global commands)
    match: /.*\.lipsurf.com/,
    version: '1.0.0',

    commands: [{
        name: 'Respond',
        description: 'Respond with something incredibly insightful to the user.',
        // what the user actually has to say to run this command
        match: 'hello world',
        // the js that's run on the page
        pageFn: function() {
            alert('Hello, Developer!');
        }
    }]
}};
