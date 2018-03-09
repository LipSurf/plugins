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

interface ICommand {
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
