declare interface IOptions {
    pluginData: Record<string, ILocalPluginData>;
    pluginPreferences: Record<string, ISyncPluginData>;
    language: LanguageCode;
    showLiveText: boolean;
    noHeadphonesMode: boolean;
    tutorialMode: number;
    inactivityAutoOffMins: number;
    pushToTalkKey: string;
    activatedViaPushToTalk: boolean;
}

interface ICommandData extends IPlan, IGlobalCommand {
    order: number;
    fn?: string;
}

interface IMatcher {
    // the original name to match this command against
    name: string;
    description?: string;
    delay?: number[];
    match: string[] | Serialized<IDynamicMatch>;
}

interface ILocalPluginData extends IPlan {
    commands: {
        [cmdName: string]: ICommandData
    };
    localized: {
        [L in LanguageCode]?: {
            homophones?: ISimpleHomophones,
            matchers: {[cmdName: string]: IMatcher },
            description?: string,
            niceName: string
        }
    };
    match: RegExp[];
    // the version is stored in both local and sync storage because
    // sync storage can be updated on a different machine, and all
    // machines would need to update their local plugin versions
    version: string;
}

interface ISyncPluginData extends IDisableable {
    version: string;
    expanded: boolean;
	showMore: boolean;
    // the names of the commands
    disabledCommands: string[];
    // the source of the homophones
    disabledHomophones: string[];
    // private plugin settings for now eg. annotate on setting
    settings: {[key: string]: any}|undefined;
}
