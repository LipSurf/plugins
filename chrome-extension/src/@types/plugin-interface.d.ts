declare interface IDisableable {
    enabled: boolean,
}

// for 3rd party plugins definitions
declare interface IPluginDefHomophones { 
    [s: string]: string 
}

// for 3rd party plugins definitions
declare interface IPluginDefCommand {
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

declare interface IActivated {
    activated: boolean,
}
