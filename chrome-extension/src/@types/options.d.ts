/*
 *  Houses the shape of the options -- that is used internally and can be retrieved via plugin meta api
 */
declare interface IOptions extends IGeneralOptions {
    plugins: IPluginConfig[];
}

declare interface IGeneralOptions {
    language: LanguageCode;
    showLiveText: boolean;
    noHeadphonesMode: boolean;
    inactivityAutoOffMins: number;
    tutorialMode: number;
}

// combined local and sync settings in a form that's
// easily digestable by the consumers: options page, PM, Recg
// serves as a global store
interface IPluginConfig extends IDisableable {
    commands: {[cmdName: string]: IPluginConfigCommand};
    cs: string;
    expanded: boolean;
    id: string;
    // the content script code to inject into the page for this plugin
    localized: { [L in LanguageCode]?: ILocalizedPluginData  & {homophones?: IToggleableHomophone[]} };
    // what urls to match on
    match: RegExp[];
    settings: object;
    showMore: boolean;
    // custom settings that the plugin can set within it's commands (eg. browser annotate)
    version: string;
}

// Run is serialized because it is only eval'd in PluginSandbox
declare interface IPluginConfigCommand extends IDisableable, StoreSerialized<IRunCommand>, IGlobalCommand {}

declare interface IToggleableHomophone extends IDisableable {
    source: string;
    destination: string;
}

declare interface ILocalizedPluginData {
    matchers: {[cmdName: string]: IMatcher };
    description?: string;
    niceName: string;
}

// localized parameters for commands
// stricter then ITranslatedCommand (force into arrays)
declare interface IMatcher extends ILocalizedCommand {
    delay?: number[];
    match: string[] | IDynamicMatch;
}
