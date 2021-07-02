// dist/tmp/PeriodFix/PeriodFix.js
var PeriodFix_default = { ...PluginBase, languages: {}, niceName: "Period Fix", description: 'Some recognizers do not put a period but literally write "period" (something to do with region or Chrome OS perhaps). This is a workaround for that.', version: "4.0.2", apiVersion: 2, match: /.*/, authors: "Miko Borys", replacements: [{ pattern: / ?period/, replacement: ".", context: "Dictate" }], commands: [] }, dumby_default = PeriodFix_default;
export {
  dumby_default as default
};
LS-SPLITLS-SPLIT