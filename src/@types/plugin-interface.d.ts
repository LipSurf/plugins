declare type IndicesPair = [number, number];

declare interface IDisableable {
    enabled: boolean;
}

declare interface IPro {
    pro?: boolean;
}

// BCP-47
declare type LanguageCode = 'af'|'sq'|'am'|'ar'|'ar-DZ'|'ar-BH'|'ar-EG'|'ar-IQ'|'ar-JO'|'ar-KW'|'ar-LB'|'ar-LY'|'ar-MA'|'ar-OM'|'ar-QA'|'ar-SA'|'ar-SY'|'ar-TN'|'ar-AE'|'ar-YE'|'hy'|'as'|'az'|'eu'|'be'|'bn'|'bs'|'bg'|'my'|'ca'|'zh-CN'|'zh-HK'|'zh-MO'|'zh-SG'|'zh-TW'|'hr'|'cs'|'da'|'nl-BE'|'nl-NL'|'en'|'en-AU'|'en-BZ'|'en-CA'|'en-CB'|'en-GB'|'en-IN'|'en-IE'|'en-JM'|'en-NZ'|'en-PH'|'en-ZA'|'en-TT'|'en-US'|'et'|'mk'|'fo'|'fa'|'fi'|'fr-BE'|'fr-CA'|'fr-FR'|'fr-LU'|'fr-CH'|'gd-IE'|'gd'|'de-AT'|'de-DE'|'de-LI'|'de-LU'|'de-CH'|'el'|'gn'|'gu'|'he'|'hi'|'hu'|'is'|'id'|'it-IT'|'it-CH'|'ja'|'kn'|'ks'|'kk'|'km'|'ko'|'lo'|'la'|'lv'|'lt'|'ms-BN'|'ms-MY'|'ml'|'mt'|'mi'|'mr'|'mn'|'ne'|'no-NO'|'or'|'pl'|'pt-BR'|'pt-PT'|'pa'|'rm'|'ro-MO'|'ro'|'ru'|'ru-RU'|'ru-MO'|'sa'|'sr-SP'|'tn'|'sd'|'si'|'sk'|'sl'|'so'|'sb'|'es-AR'|'es-BO'|'es-CL'|'es-CO'|'es-CR'|'es-DO'|'es-EC'|'es-SV'|'es-GT'|'es-HN'|'es-MX'|'es-NI'|'es-PA'|'es-PY'|'es-PE'|'es-PR'|'es-ES'|'es-UY'|'es-VE'|'sw'|'sv-FI'|'sv-SE'|'tg'|'ta'|'tt'|'te'|'th'|'bo'|'ts'|'tr'|'tk'|'uk'|'ur'|'uz-UZ'|'vi'|'cy'|'xh'|'yi'|'zu';

type Serialized<T> = {
    [K in keyof T]: T[K] extends RegExp ? string :
                    T[K] extends RegExp[] ? string[] :
                    T[K] extends Function ? string :
                    T[K] extends Array<object> ? Serialized<T[K]> :
                    T[K] extends Object ? Serialized<T[K]> :
                    T[K];
}

// for 3rd party plugins definitions
declare interface ISimpleHomophones {
    [s: string]: string;
}

declare interface IDynamicMatch {
    // `false` if partial match -- if there's a partial match we should delay other cmds that 
    //                  have a full match; because the user might be in the process of saying this longer
    //                  command where the partial match is a subset but also a matching command "ie. Help Wanted" 
    //                  executing a different command from "Help"
    fn: (transcript: string) => any;
    description: string;
}

declare type INiceFn = ((transcript: string, ...matchOutput: any[]) => string);

declare interface INiceCommand {
    // matchOutput is the array returned from the match function (if there's a match fn) or 
    // the arguments from special match string (wildcard, numeral etc. type special params)
    nice?: string | INiceFn;
}

declare interface ILocalizedCommandBase extends INiceCommand {
    // the original name to match this command against
    name: string;
    description?: string;
}

declare interface IGlobalCommand {
    // let command match on any page (not restricted by plugin level match regex)
    global?: boolean;
}

declare interface IFnCommand {
    // matchOutput is the array returned from the match function (if there's a match fn) or 
    // the arguments from special match string (wildcard, numeral etc. type special params)
    fn?: (transcript: string, ...matchOutput: any[]) => Promise<void>;
}

declare interface ILocalizedCommand extends ILocalizedCommandBase {
    // strings should not have any punctuation in them as puncutation
    // is converted into it's spelled out form eg. "." -> "dot"
    match: string | string[] | IDynamicMatch;
    // returns the complete liveText that should be shown.
    // raw input would be eg. "go to are meal time video"
    delay?: number | number[];
}

interface IBaseSetting {
    name: string;
    type: any;
    default?: any;
}

interface IBooleanSetting extends IBaseSetting {
    type: 'boolean';
    default?: boolean;
}

interface IStringSetting extends IBaseSetting {
    type: 'url'|'text'|'string';
    default?: string;
}

declare type ISetting = IStringSetting | IBooleanSetting;

declare interface ICommand extends IPro, ILocalizedCommand, IGlobalCommand, IFnCommand {
    test?: () => any;
    // matchOutput is the array returned from the match function (if there's a match fn) or 
    // the arguments from special match string (wildcard, numeral etc. type special params)
    pageFn?: (transcript: string, ...matchOutput: any[]) => Promise<void>;
    context?: string;
    enterContext?: string;
    settings?: ISetting[];
}

declare interface IPluginUtil {
    // meta
    shutdown: () => void; // shutdown LipSurf
    start: () => void; // startup LipSurf programmatically
    getOptions: (key?: keyof IOptions) => IOptions; 
    getLanguage: () => LanguageCode;
    setLanguage: (lang: LanguageCode) => void;

    enterContext: (context: string) => void;
    addOverlay: (contents, id?: string, domLoc?:HTMLElement, hold?: boolean) => HTMLDivElement;
    ready: () => Promise<void>;
    queryAllFrames: (tagName: string, attrs: string[]) => Promise<any[]>;
    postToAllFrames: (id, fnNames: string | string[], selector?) =>  void;
    // TODO: deprecate in favor of generic postToAllFrames?
    // currently used for fullscreen?
    sendMsgToBeacon: (msg: object) => Promise<any>;
    scrollToAnimated: (ele: JQuery<HTMLElement>) => void;
    isInView: (ele: JQuery<HTMLElement>) => boolean;
    getNoCollisionUniqueAttr: () => string;
    sleep: (number) => Promise<void>;
    getHUDEle: () => [HTMLDivElement, boolean];
    pick: (obj: object, ...props: string[]) => object;
}

declare namespace ExtensionUtil {
    function queryActiveTab(): Promise<chrome.tabs.Tab>;
    function toggleActivated(_activated:boolean): Promise<void>;
}

declare interface IPluginTranslation {
    niceName: string;
    authors?: string;
    description?: string;
    homophones?: ISimpleHomophones;
    commands: {[cmdName: string]: ILocalizedCommand};
}

declare interface IContext {
    [name: string]: {
        // if a context extends another, all the commands in the context it extends can also be used 
        extends?: string,
        // false by default. If true, no trimming, lowercasing, hypen removal etc. is done on the
        // transcripts that come down to be checked by match commands
        raw?: boolean,
    }
}

declare interface IPluginBase {
    languages: {[L in LanguageCode]?: IPluginTranslation};
    // should not be overridden by plugins
    getPluginOption: (name: string) => any;
    setPluginOption: (name: string, val: any) => Promise<void>;

    util: IPluginUtil;
}

declare interface IPlugin {
    niceName: string;
    description?: string;
    version?: string;
    apiVersion?: string;
    match: RegExp | RegExp[];
    authors?: string;
    pro?: boolean;
    // svg string of an uncolored icon with no height or width
    icon?: string;

    commands: ICommand[];
    homophones?: ISimpleHomophones;
    contexts?: IContext;
    settings?: ISetting[];
    // always run the following regexs in this context, unlike homophones these don't look for a valid
    // command with the homophone...  they simply always replace text in the transcript. Can be used to
    // filter words, add shortcuts etc.
    replacements?: {
        pattern: RegExp,
        replacement: string,
        context?: string,
    }[],
    // called anytime the page is re-shown. Must be safe to re-run
    // while lipsurf is activated. Or when lipsurf is first activated.
    init?: (() => void) | (() => Promise<void>);
    // called when plugin is deactivated (speech recg. paused)
    // in page context
    destroy?: (() => void) | (() => Promise<void>);
    // called when LipSurf is turned off (after destroy)
    deactivatedHook?: () => void | (() => Promise<void>);
}
