/// <reference types="@lipsurf/types/extension"/>
declare const PluginBase: IPluginBase;

export default <IPluginBase & IPlugin>{
  ...PluginBase,
  ...{
    niceName: "Anti-procrastination",
    description: "Helpers for overcoming procrastination.",
    match: /.*/,
    version: "1.0.0",
    apiVersion: 2,
    commands: [
      {
        name: "Self Destructing Tab",
        description:
          "Open a new tab with x website for y minutes. Useful for limiting the time-sucking power of sites like facebook, reddit, twitter etc.",
        global: true,
        match: "open * for # minutes",
        pageFn: (transcript, siteStr: TsData, minutes: number) => {
          console.log(`site: ${siteStr}, minutes: ${minutes}`);
        },
      },
    ],
  },
};
