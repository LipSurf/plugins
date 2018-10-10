
// combined local and sync settings in a form that's
// easily digestable by the consumers: options page, PM, Recg
// serves as a global store
interface IPluginConfig extends IDisableable {
    commands: {[cmdName: string]: IConfiguredCommand};
    privateMembers: string;
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
declare interface IConfiguredCommand extends IPro, IOrderable, IDisableable, StoreSerialized<IFnCommand>, IGlobalCommand {}

declare interface IOrderable {
    order: number;
}

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
