declare abstract class PluginBase {
    static friendlyName: string;
    static description: string;
    static version: string;
    static match: RegExp | RegExp[];

    static commands: ICommand[];
    static homophones: IHomophones;
    static init?: () => void;

    static util: IPluginUtil;

    // don't allow non-static properties
    [propName: string]: never;
    // limit the static members to be functions (doesn't work yet)
    // https://github.com/Microsoft/TypeScript/issues/6480
    // static [propName: string]: null | () => any;
}


declare interface IHomophones { 
    [s: string]: string 
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
    getNoCollisionUniqueAttr: () => string;
}

declare namespace ExtensionUtil {
    function queryActiveTab(tab: object): any;
}

declare interface IUserPreferences {
    plugins: IPluginConfig[],
    showLiveText: boolean,
}

// this is what's saved in chrome.syncdata
// all the user preferences for a plugin
// (we don't store the entire plugin code as there's a limit to the chrome syncdata space)
declare interface IPluginConfig {
    id: string,    // generally the name of the plugin that's installed, no spaces or hyphens( class RedditPlugin -> id: Reddit)
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
    // basically name. But name is a reserved property for classes.
    // for RedditPlugin would be Reddit. 
    id: string,
    friendlyName: string,
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
