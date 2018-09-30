/// <reference path="./options.d.ts" />

declare interface IDisableable {
    enabled: boolean,
}

// BCP-47
declare type LanguageCode = 'af'|'sq'|'am'|'ar'|'ar-DZ'|'ar-BH'|'ar-EG'|'ar-IQ'|'ar-JO'|'ar-KW'|'ar-LB'|'ar-LY'|'ar-MA'|'ar-OM'|'ar-QA'|'ar-SA'|'ar-SY'|'ar-TN'|'ar-AE'|'ar-YE'|'hy'|'as'|'az'|'eu'|'be'|'bn'|'bs'|'bg'|'my'|'ca'|'zh-CN'|'zh-HK'|'zh-MO'|'zh-SG'|'zh-TW'|'hr'|'cs'|'da'|'nl-BE'|'nl-NL'|'en'|'en-AU'|'en-BZ'|'en-CA'|'en-CB'|'en-GB'|'en-IN'|'en-IE'|'en-JM'|'en-NZ'|'en-PH'|'en-ZA'|'en-TT'|'en-US'|'et'|'mk'|'fo'|'fa'|'fi'|'fr-BE'|'fr-CA'|'fr-FR'|'fr-LU'|'fr-CH'|'gd-IE'|'gd'|'de-AT'|'de-DE'|'de-LI'|'de-LU'|'de-CH'|'el'|'gn'|'gu'|'he'|'hi'|'hu'|'is'|'id'|'it-IT'|'it-CH'|'ja'|'kn'|'ks'|'kk'|'km'|'ko'|'lo'|'la'|'lv'|'lt'|'ms-BN'|'ms-MY'|'ml'|'mt'|'mi'|'mr'|'mn'|'ne'|'no-NO'|'or'|'pl'|'pt-BR'|'pt-PT'|'pa'|'rm'|'ro-MO'|'ro'|'ru'|'ru-RU'|'ru-MO'|'sa'|'sr-SP'|'tn'|'sd'|'si'|'sk'|'sl'|'so'|'sb'|'es-AR'|'es-BO'|'es-CL'|'es-CO'|'es-CR'|'es-DO'|'es-EC'|'es-SV'|'es-GT'|'es-HN'|'es-MX'|'es-NI'|'es-PA'|'es-PY'|'es-PE'|'es-PR'|'es-ES'|'es-UY'|'es-VE'|'sw'|'sv-FI'|'sv-SE'|'tg'|'ta'|'tt'|'te'|'th'|'bo'|'ts'|'tr'|'tk'|'uk'|'ur'|'uz-UZ'|'vi'|'cy'|'xh'|'yi'|'zu';

type StoreSerialized<T> = {
    [K in keyof T]: T[K] extends RegExp ? string :
                    T[K] extends RegExp[] ? string[] :
                    T[K] extends Function ? string :
                    T[K] extends IDynamicMatch ? string :
                    T[K] extends Object ? StoreSerialized<T[K]> :
                    T[K];
}

declare interface IPlugin extends IPluginBase {
    niceName: string;
    description?: string;
    version?: string;
    apiVersion?: string;
    match: RegExp | RegExp[];
    authors?: string;

    commands: ICommand[];
    homophones?: ISimpleHomophones;
    // called anytime the page is re-shown. Must be safe to re-run
    // while lipsurf is activated. Or when lipsurf is first activated.
    init?: () => void;
    // called when plugin is deactivated (speech recg. paused)
    // in page context
    destroy?: () => void;
    languages?: {[L in LanguageCode]?: IPluginTranslation};
}

declare interface IPluginTranslation {
    niceName: string;
    authors?: string;
    description?: string;
    homophones?: ISimpleHomophones;
    commands: {[key: string]: ILocalizedCommand};
}

declare interface IPluginBase {
    // should not be overridden by plugins
    getPluginOption: (name: string) => Promise<any>;
    setPluginOption: (name: string, val: any) => Promise<void>;

    util: IPluginUtil;
}

// for 3rd party plugins definitions
declare interface ISimpleHomophones {
    [s: string]: string;
}

// array of args to pass over to pageFn
//     -or-
// `false` if there is a partial match -- so we should delay other cmds that 
// have a full match -- because the user might be in the process of saying this longer
// command where the partial match is a subset but also a matching command "ie. Help Wanted" 
// executing a different command from "Help"
declare type MatchResult = boolean|any[];

declare interface IDynamicMatch {
    fn: (transcript: string) => MatchResult|undefined;
    description: string;
}

declare interface ICommand extends ILocalizedCommand, IGlobalCommand, IFnCommand {
    test?: () => any;
    pageFn?: (() => Promise<any>) | ((number) => Promise<any>) | ((string) => Promise<any>);
}

declare interface ILocalizedCommand extends INiceCommand {
    // the original name to match this command against
    name: string;
    description?: string;
    // strings should not have any punctuation in them as puncutation
    // is converted into it's spelled out form eg. "." -> "dot"
    match: string | string[] | IDynamicMatch;
    // returns the complete liveText that should be shown.
    // raw input would be eg. "go to are meal time video"
    // matchOutput is the array returned from the match function (if there's a match fn)
    delay?: number | number[];
}

declare interface IOptions {
    plugins: IPluginConfig[];
    language: LanguageCode;
    showLiveText: boolean;
    noHeadphonesMode: boolean;
    tutorialMode: number;
    inactivityAutoOffMins: number;
}

declare interface IPluginUtil {
    // meta
    shutdown: () => void; // shutdown LipSurf
    start: () => void; // startup LipSurf programmatically
    getOptions: () => Promise<IOptions>;
    getLanguage: () => Promise<LanguageCode>;
    setLanguage: (lang: LanguageCode) => void;

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

declare interface IGlobalCommand {
    // let command match on any page (not restricted by plugin level match regex)
    global?: boolean;
}

declare interface IFnCommand {
    fn?: (() => any) | ((tabIndex: number) => any);
}

declare interface INiceCommand {
    nice?: string | ((rawInput: string, matchOutput: any[]) => string);
}
