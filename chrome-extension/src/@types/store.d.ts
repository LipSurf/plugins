/*
 * Serialized versions of plugins are stored. Mirrors what's in IOptions (basically the global store), but serializes.
 */
/// <reference path="../../plugins/src/@types/plugin-interface.d.ts"/>

// this is what's saved in chrome.syncdata
// all the user preferences for a plugin
// (we don't store the entire plugin code as there's a limit to the chrome syncdata space)
declare interface ISyncData extends IGeneralOptions {
    // installed plugins
    plugins: IndexedPlugins;
}

declare type IndexedPlugins = {
    // generally the name of the plugin that's installed, no spaces or hyphens( class RedditPlugin -> id: Reddit)
    [id: string]: ISyncPluginData;
}

declare interface ISyncPluginData extends IDisableable {
    // semantically versioned
    version: string;
    expanded: boolean;
	showMore: boolean;
    // the names of the commands
    disabledCommands: string[];
    // the source of the homophones
    disabledHomophones: string[];
    // private plugin settings for now eg. annotate on setting
    settings: {};
}

declare interface ILocalData {
    // is the plugin "on"
    activated: boolean;
    pluginData: {
        [id: string]: ILocalPluginData;
    }
}

// See IPluginConfig for details about the properties
declare interface ILocalPluginData  {
    commands: {[cmdName: string]: ILocalPluginCommand};
    cs: string;
    localized: {
        [L in LanguageCode]?: ILocalizedPluginData & {homophones?: ISimpleHomophones}
    };
    match: RegExp[];
    // the version is stored in both local and sync storage because
    // sync storage can be updated on a different machine, and all
    // machines would need to update their local plugin versions
    version: string;
}

declare interface ILocalPluginCommand extends StoreSerialized<IRunCommand>, IGlobalCommand { }
