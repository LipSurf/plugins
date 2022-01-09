// lipsurf-plugin-helloworld/src/HelloWorld/HelloWorld.ts
/// <reference types="@lipsurf/types/extension"/>
declare const PluginBase: IPluginBase;

export default <IPluginBase & IPlugin>{
  ...PluginBase,
  ...{
    niceName: "Hello World",
    description: 'A "hello world" plugin.',
    // a RegEx that must match against the current tab's url for the plugin to be active (all of it's commands minus global commands)
    match: /.*/,
    version: "1.0.0",
    apiVersion: 2,
    commands: [
      {
        name: "Respond",
        description:
          "Respond with something incredibly insightful to the user.",
        // what the user actually has to say to run this command
        match: "hello world",
        // the js that's run on the page
        pageFn: function () {
          alert("Hello, Developer!");
        },
      },
    ],
  },
};
