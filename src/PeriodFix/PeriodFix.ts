/// <reference types="lipsurf-plugin-types"/>
import { PluginBase } from '../PluginBase';

export module PeriodFixPlugin {
  export let Plugin: IPlugin & IPluginBase = Object.assign<{}, IPluginBase, IPlugin>({}, PluginBase, {
    niceName: 'Period Fix',
    description: 'Some recognizers do not put a period but literally write "period" (something to do with region or Chrome OS perhaps). This is a workaround for that.',
    version: '1.0.0',
    apiVersion: '1',
    match: /.*/,
    authors: 'Miko Borys',
    replacements: [
        {
            pattern: / ?period/,
            replacement: '.',
            context: 'Dictate',
        },
    ],
    commands: []
  });
}
