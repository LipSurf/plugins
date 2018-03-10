declare interface IPlugin {
    // common utilities for the commands
    common: object,
    plugin: {
        name: string,
        version: string,
        description: string,
        match: RegExp | RegExp[],
        homophones: { [s: string]: string },
        commands: ICommand[], // allows for a closure
        init?: () => object,
    }
}

declare interface ICommand {
    name: string,
    // rsturns processsed transcript result -- an array of args to
    // pass to runOnPage
    match: string | string[] | ((transcript: string) => any[]),
    description?: string,
    test?: () => any,
    run?: (() => any) | ((tabIndex: number) => any),
    runOnPage?: (() => any) | ((number) => any),
    nice?: (match: string) => string,
    delay?: number | number[],
}

declare interface IPluginUtil {
    queryAllFrames: (tagName: string, attrs: string[]) => Promise<any[]>;
    postToAllFrames: (id, fnNames: string | string[], selector?) =>  void;
    // TODO: deprecate in favor of generic postToAllFrames?
    // currently used for fullscreen?
    sendMsgToBeacon: (object) => Promise<any>;
    toggleHelpBox: (boolean) => void;
    getScrollDistance: () => number;
    scrollToAnimated: (HTMLElement) => void;
    isInView: (HTMLElement) => boolean;
}

declare namespace ExtensionUtil {
    function queryActiveTab(tab: object): any;
}

declare interface IPreferences {
    plugins: IPluginConfig[],
    showLiveText: boolean,
}

// this is what's saved in chrome.syncdata
// all the user preferences for a plugin
// (we don't store the entire plugin code as there's a limit to the chrome syncdata space)
declare interface IPluginConfig {
    name: string,    // the name of the plugin that's installed (used to find the plugin code on MealtimeBrowsing.com)
    version: string, // semantic versioning
    enabled: boolean,
    expanded: boolean,
    disabledCommands: string[],
    disabledHomophones: string[],  // the "less common" misheard part
}

declare interface IStoreHomophone {
    source: string,
    destination: string,
    enabled: boolean
}

// what's actually saved/loaded in chrome.storage.local
declare interface IStorePlugins {
    'store-plugin': IStorePlugin[],
}

// cached and computed plugin data (caches fetch, computes _ordinalMatch...)
declare interface IStorePlugin {
    name: string,
    match: RegExp[],
    commands: IStoreCommand[],
    homophones: IStoreHomophone[],
    cs: string, // only made into a function when it is eval'd on the page
    enabled: boolean,
}

declare interface IStoreCommand {
    name: string,
    // return processed string
    match: string[] | ((transcript: string) => any[]),
    description?: string,
    run?: (() => any) | ((tabIndex: number) => any),
    runOnPage?: string,
    nice?: (match: string) => string,
    delay?: number[],
    // computed property that describes if match strings have ordinal
    // placeholders and we should wait a bit of extra time to let
    // them get captured before executing
    _ordinalMatch: boolean,
    enabled: boolean,
}

declare interface IActivated {
    activated: boolean,
}
