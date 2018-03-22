
// this is what's saved in chrome.syncdata
// all the user preferences for a plugin
// (we don't store the entire plugin code as there's a limit to the chrome syncdata space)
declare interface ISyncData {
    showLiveText: boolean,
    installedPlugins: {
        // generally the name of the plugin that's installed, no spaces or hyphens( class RedditPlugin -> id: Reddit)
        [id: string]: ISyncPluginData,
    }
}

declare interface ISyncPluginData extends IDisableable {
    // semantically versioned
    version: string,
    expanded: boolean,
    // the names of the commands
    disabledCommands: string[],
    // the source of the homophones
    disabledHomophones: string[],
}

declare interface ILocalData {
    // is the plugin "on"
    activated: boolean,
    pluginData: {
        [id: string]: ILocalPluginData,
    }
}

// not *exactly* how it is stored, because the JSON
// needs to be converted/evald for regex, and fn types
// only needs to be updated when plugin version
// is updated?
declare interface ILocalPluginData extends ICommonHomophones {
    // the version is stored in both local and sync storage because
    // sync storage can be updated on a different machine, and all
    // machines would need to update their local plugin versions
    version: string,
    friendlyName: string,
    match: RegExp[],
    // combined init, cmds run
    cs: string,
    commands: ICommonCommand[],
    description?: string,
}

declare interface ICommonCommand {
    name: string,
    match: string[] | ((transcript: string) => any[]),
    delay?: number[],
    description?: string,
    nice?: (match: string) => string,
    run?: (() => any) | ((tabIndex: number) => any),
}

declare interface ICommonHomophones {
    homophones?: {
        // input: output (output is usually the command)
        [source: string]: string,
    },
}
