declare abstract class PluginBase {
    static friendlyName: string;
    static description: string;
    static version: string;
    static apiVersion: string;
    static match: RegExp | RegExp[];

    static commands: IPluginDefCommand[];
    static homophones: IPluginDefHomophones;
    static init?: () => void;
    static destroy?: () => void;

    // should not be overridden by plugins
    static getOption: (name: string) => Promise<any>;
    static setOption: (name: string, val: any) => Promise<void>;

    // don't allow non-static properties
    [propName: string]: never;
    // limit the static members to be functions (doesn't work yet)
    // https://github.com/Microsoft/TypeScript/issues/6480
    // static [propName: string]: null | () => any;

    static util: IPluginUtil;
}

declare interface IDisableable {
    enabled: boolean,
}

// for 3rd party plugins definitions
declare interface IPluginDefHomophones {
    [s: string]: string
}

declare interface IDynamicMatch {
    fn: ((transcript: string) => any[]),
    description: string,
}

// for 3rd party plugins definitions
declare interface IPluginDefCommand {
    name: string,
    // returns processsed transcript result -- an array of args to
    // pass to runOnPage
    // strings should not have any punctuation in them as puncutation
    // is converted into it's spelled out form eg. "." -> "dot"
    match: string | string[] | IDynamicMatch,
    description?: string,
    test?: () => any,
    // let command match on any page (not restricted by plugin level match regex)
    global?: boolean,
    run?: (() => any) | ((tabIndex: number) => any),
    runOnPage?: (() => Promise<any>) | ((number) => Promise<any>),
    // returns the complete liveText that should be shown.
    // raw input would be eg. "go to are meal time video"
    // matchOutput is the array returned form the match function (if there's a match fn)
    nice?: (rawInput: string, matchOutput: any[]) => string,
    delay?: number | number[],
}

declare interface IPluginUtil {
    // meta
    getOptions: () => Promise<IOptions>;

    addOverlay: (contents, extraCss?: {}, id?: string, domLoc?:HTMLElement, hold?: boolean) => HTMLIFrameElement;
    queryAllFrames: (tagName: string, attrs: string[]) => Promise<any[]>;
    postToAllFrames: (id, fnNames: string | string[], selector?) =>  void;
    // TODO: deprecate in favor of generic postToAllFrames?
    // currently used for fullscreen?
    sendMsgToBeacon: (msg: object) => Promise<any>;
    getScrollDistance: () => number;
    scrollToAnimated: (ele: JQuery<HTMLElement>) => void;
    isInView: (ele: JQuery<HTMLElement>) => boolean;
    getNoCollisionUniqueAttr: () => string;
    sleep: (number) => Promise<{}>;
    pick: (obj: object, ...string) => object;
}

declare namespace ExtensionUtil {
    function queryActiveTab(): Promise<chrome.tabs.Tab>;
}

declare interface IActivated {
    activated: boolean,
}
