declare abstract class PluginBase {
    static niceName: string;
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

declare abstract class PluginTranslationBase {
    static niceName: string;
    static description: string;
    static homophones: IPluginDefHomophones;
    static commands: {[name_key: string]: ITranslatedCommand};
}

declare interface IDisableable {
    enabled: boolean,
}

// BCP-47
declare type LanguageCode = 'af'|'sq'|'am'|'ar'|'ar-DZ'|'ar-BH'|'ar-EG'|'ar-IQ'|'ar-JO'|'ar-KW'|'ar-LB'|'ar-LY'|'ar-MA'|'ar-OM'|'ar-QA'|'ar-SA'|'ar-SY'|'ar-TN'|'ar-AE'|'ar-YE'|'hy'|'as'|'az'|'eu'|'be'|'bn'|'bs'|'bg'|'my'|'ca'|'zh-CN'|'zh-HK'|'zh-MO'|'zh-SG'|'zh-TW'|'hr'|'cs'|'da'|'nl-BE'|'nl-NL'|'en'|'en-AU'|'en-BZ'|'en-CA'|'en-CB'|'en-GB'|'en-IN'|'en-IE'|'en-JM'|'en-NZ'|'en-PH'|'en-ZA'|'en-TT'|'en-US'|'et'|'mk'|'fo'|'fa'|'fi'|'fr-BE'|'fr-CA'|'fr-FR'|'fr-LU'|'fr-CH'|'gd-IE'|'gd'|'de-AT'|'de-DE'|'de-LI'|'de-LU'|'de-CH'|'el'|'gn'|'gu'|'he'|'hi'|'hu'|'is'|'id'|'it-IT'|'it-CH'|'ja'|'kn'|'ks'|'kk'|'km'|'ko'|'lo'|'la'|'lv'|'lt'|'ms-BN'|'ms-MY'|'ml'|'mt'|'mi'|'mr'|'mn'|'ne'|'no-NO'|'or'|'pl'|'pt-BR'|'pt-PT'|'pa'|'rm'|'ro-MO'|'ro'|'ru'|'ru-MO'|'sa'|'sr-SP'|'tn'|'sd'|'si'|'sk'|'sl'|'so'|'sb'|'es-AR'|'es-BO'|'es-CL'|'es-CO'|'es-CR'|'es-DO'|'es-EC'|'es-SV'|'es-GT'|'es-HN'|'es-MX'|'es-NI'|'es-PA'|'es-PY'|'es-PE'|'es-PR'|'es-ES'|'es-UY'|'es-VE'|'sw'|'sv-FI'|'sv-SE'|'tg'|'ta'|'tt'|'te'|'th'|'bo'|'ts'|'tr'|'tk'|'uk'|'ur'|'uz-UZ'|'vi'|'cy'|'xh'|'yi'|'zu';

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
    readonly name: string,
    readonly description?: string,
    readonly match: string | string[] | IDynamicMatch,
    readonly nice?: (rawInput: string, matchOutput: any[]) => string,
    readonly delay?: number | number[],
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
    readonly id: string,
    readonly niceName: string,
    readonly version: string,
    expanded: boolean,
	showMore: boolean,
    // the languages the plugin supports
    readonly languages: LanguageCode[],
    readonly match: RegExp[],
    cs: string,
    commands: IPluginConfigCommand[],
    readonly description?: string,
    // custom settings that the plugin can set within it's commands (eg. browser annotate)
    settings: object,
}

declare interface IToggleableHomophones {
    homophones?: {
        enabled: boolean,
        readonly source: string,
        readonly destination: string,
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

