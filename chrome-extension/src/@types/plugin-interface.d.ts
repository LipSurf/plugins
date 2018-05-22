declare abstract class PluginBase {
    static friendlyName: string;
    static description: string;
    static version: string;
    static apiVersion: string;
    static match: RegExp | RegExp[];
    static authors: string;

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

declare abstract class PluginTranslation {
    static friendlyName: string;
    static description: string;
    static homophones: IPluginDefHomophones;
    static commands: ITranslatedCommand[];
}

declare interface IDisableable {
    enabled: boolean,
}

declare type LanguageCode = 'af'|'sq'|'am'|'ar'|'ar-dz'|'ar-bh'|'ar-eg'|'ar-iq'|'ar-jo'|'ar-kw'|'ar-lb'|'ar-ly'|'ar-ma'|'ar-om'|'ar-qa'|'ar-sa'|'ar-sy'|'ar-tn'|'ar-ae'|'ar-ye'|'hy'|'as'|'az'|'eu'|'be'|'bn'|'bs'|'bg'|'my'|'ca'|'zh-cn'|'zh-hk'|'zh-mo'|'zh-sg'|'zh-tw'|'hr'|'cs'|'da'|'nl-be'|'nl-nl'|'en'|'en-au'|'en-bz'|'en-ca'|'en-cb'|'en-gb'|'en-in'|'en-ie'|'en-jm'|'en-nz'|'en-ph'|'en-za'|'en-tt'|'en-us'|'et'|'mk'|'fo'|'fa'|'fi'|'fr-be'|'fr-ca'|'fr-fr'|'fr-lu'|'fr-ch'|'gd-ie'|'gd'|'de-at'|'de-de'|'de-li'|'de-lu'|'de-ch'|'el'|'gn'|'gu'|'he'|'hi'|'hu'|'is'|'id'|'it-it'|'it-ch'|'ja'|'kn'|'ks'|'kk'|'km'|'ko'|'lo'|'la'|'lv'|'lt'|'ms-bn'|'ms-my'|'ml'|'mt'|'mi'|'mr'|'mn'|'ne'|'no-no'|'or'|'pl'|'pt-br'|'pt-pt'|'pa'|'rm'|'ro-mo'|'ro'|'ru'|'ru-mo'|'sa'|'sr-sp'|'tn'|'sd'|'si'|'sk'|'sl'|'so'|'sb'|'es-ar'|'es-bo'|'es-cl'|'es-co'|'es-cr'|'es-do'|'es-ec'|'es-sv'|'es-gt'|'es-hn'|'es-mx'|'es-ni'|'es-pa'|'es-py'|'es-pe'|'es-pr'|'es-es'|'es-uy'|'es-ve'|'sw'|'sv-fi'|'sv-se'|'tg'|'ta'|'tt'|'te'|'th'|'bo'|'ts'|'tr'|'tk'|'uk'|'ur'|'uz-uz'|'vi'|'cy'|'xh'|'yi'|'zu';

// for 3rd party plugins definitions
declare interface IPluginDefHomophones {
    [s: string]: string
}

declare interface IDynamicMatch {
    fn: ((transcript: string) => any[]),
    description: string,
}

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
    runOnPage?: (() => Promise<any>) | ((number) => Promise<any>) | ((string) => Promise<any>),
    // returns the complete liveText that should be shown.
    // raw input would be eg. "go to are meal time video"
    // matchOutput is the array returned form the match function (if there's a match fn)
    nice?: (rawInput: string, matchOutput: any[]) => string,
    delay?: number | number[],
}

declare interface ITranslatedCommand {
    // the original name to match this command against
    name_key: string,
    name: string,
    description?: string,
    match: string | string[] | IDynamicMatch,
    nice?: (rawInput: string, matchOutput: any[]) => string,
    delay?: number | number[],
}

declare interface IPluginUtil {
    // meta
    getOptions: () => Promise<IOptions>;

    addOverlay: (contents, id?: string, domLoc?:HTMLElement, hold?: boolean) => HTMLDivElement;
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
    function toggleActivated(_activated:boolean): Promise<void>;
}

declare interface IActivated {
    activated: boolean,
}

declare interface ITutorialMode {
    tutorialMode: number,
}

declare interface IOptions extends IGeneralOptions {
    plugins: IPluginConfig[]
}

declare interface IGeneralOptions {
    language: LanguageCode,
    showLiveText: boolean,
    noHeadphonesMode: boolean,
    inactivityAutoOffMins: number,
    tutorialMode: number,
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

declare interface IToggleableHomophones {
    homophones?: {
        enabled: boolean,
        source: string,
        destination: string,
    }[],
}

interface IPluginConfigCommand extends ICommonCommand, IDisableable {

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

