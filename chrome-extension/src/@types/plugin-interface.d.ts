declare interface IPlugin {
    name: string,
    version: string,
    description: string,
    match: RegExp | RegExp[],
    homophones: { [s: string]: string },
    commands: ICommand[],
}

interface ICommand {
    name: string,
    match: string | string[] | ((transcript: string) => boolean),
    description?: string,
    test?: () => any,
    run?: (() => any) | ((tabIndex: number) => any),
    runOnPage?: (() => any) | ((number) => any),
    nice?: (match: string) => string,
    delay?: number | number[],
}

declare namespace PluginUtil {
    function queryAllFrames(tagName: string, attrs: string[]): Promise<any[]>;
    function postToAllFrames(id, fnNames: string | string[], selector?):  undefined;
    // TODO: deprecate in favor of generic postToAllFrames?
    // currently used for fullscreen?
    function sendMsgToBeacon(object): Promise<any>;
    function toggleHelpBox(boolean): undefined;
    function getScrollDistance(): number;
    function scrollToAnimated(HTMLElement): undefined;
    function isInView(HTMLElement): boolean;
}

declare namespace ExtensionUtil {
    function queryActiveTab(tab: object): any;
}
