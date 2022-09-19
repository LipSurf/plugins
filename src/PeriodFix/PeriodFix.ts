/// <reference types="@lipsurf/types/extension"/>
declare const PluginBase: IPluginBase;

export default <IPluginBase & IPlugin>{
  ...PluginBase,
  ...{
    niceName: "Period Fix",
    description:
      'Some recognizers do not put a period but literally write "period" (something to do with region or Chrome OS perhaps). This is a workaround for that.',
    version: "4.8.0-alpha.0",
    apiVersion: 2,
    match: /.*/,
    authors: "Miko Borys",
    replacements: [
      {
        pattern: / ?period/,
        replacement: ".",
        context: "Dictate",
      },
    ],
    commands: [],
  },
};
