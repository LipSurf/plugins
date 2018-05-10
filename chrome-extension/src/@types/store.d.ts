declare interface IOptions extends IGeneralOptions {
    plugins: IPluginConfig[]
}

// combined local and sync settings in a form that's
// easily digestable by the consumers: options page, PM, Recg
interface IPluginConfig extends IDisableable, IToggleableHomophones {
    id: string,
    friendlyName: string,
    expanded: boolean,
	showMore: boolean,
    version: string,
    match: RegExp[],
    cs: string,
    commands: IPluginConfigCommand[],
    description?: string,
    // custom settings that the plugin can set within it's commands (eg. browser annotate)
    settings: object,
}

interface IPluginConfigCommand extends ICommonCommand, IDisableable {

}

declare interface IToggleableHomophones {
    homophones?: {
        enabled: boolean,
        source: string,
        destination: string,
    }[],
}

declare type IndexedPlugins = {
    // generally the name of the plugin that's installed, no spaces or hyphens( class RedditPlugin -> id: Reddit)
    [id: string]: ISyncPluginData,
}
// this is what's saved in chrome.syncdata
// all the user preferences for a plugin
// (we don't store the entire plugin code as there's a limit to the chrome syncdata space)
declare interface ISyncData extends IGeneralOptions {
    // installed plugins
    plugins: IndexedPlugins,
}

declare interface IGeneralOptions {
    showLiveText: boolean,
    noHeadphonesMode: boolean,
    inactivityAutoOffMins: number,
    tutorialMode: number,
}

declare interface ISyncPluginData extends IDisableable {
    // semantically versioned
    version: string,
    expanded: boolean,
	showMore: boolean,
    // the names of the commands
    disabledCommands: string[],
    // the source of the homophones
    disabledHomophones: string[],
    // private plugin settings for now eg. annotate on setting
    settings: {},
}

declare interface ILocalData {
    // is the plugin "on"
    activated: boolean,
    pluginData: {
        [id: string]: ILocalPluginData,
    }
}

declare interface ISerializedLocalData {
    activated: boolean,
    tutorialMode: boolean,
    pluginData: {
        [id: string]: ISerializedLocalPluginData,
    }
}

// not *exactly* how it is stored, because the JSON
// needs to be converted/evald for regex, and fn types
// only needs to be updated when plugin version
// is updated?
declare interface ILocalPluginData extends _ILocalPluginDataCommon {
    match: RegExp[],
    commands: ICommonCommand[],
}

declare interface ISerializedLocalPluginData extends _ILocalPluginDataCommon {
    match: string[],
    commands: ISerializedCommand[],
}

declare interface _ILocalPluginDataCommon extends ICommonHomophones {
    // the version is stored in both local and sync storage because
    // sync storage can be updated on a different machine, and all
    // machines would need to update their local plugin versions
    version: string,
    friendlyName: string,
    // combined init, cmds run
    cs: string,
    description?: string,
}

declare interface ISerializedCommand extends _ICommonCommand {
    // non-array string stores stringified function
    match: string[] | string,
    nice?: string,
    run?: string,
}

declare interface ICommonCommand extends _ICommonCommand {
    match: string[] | IDynamicMatch,
    nice?: (match: string) => string,
    run?: (() => any) | ((tabIndex: number) => any),
}

declare interface _ICommonCommand {
    name: string,
    global?: boolean,
    delay?: number[],
    description?: string,
}

declare interface ICommonHomophones {
    homophones?: {
        // input: output (output is usually the command)
        [source: string]: string,
    },
}
