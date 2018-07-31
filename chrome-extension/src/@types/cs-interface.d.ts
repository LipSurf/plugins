declare type IBackgroundParcel = ICmdParcel | ILiveTextParcel | ITranscriptParcel | ICodeParcel;

// incoming transcript that we need to check match for
declare interface ITranscriptParcel {
    text: string;
    lang: LanguageCode;
    cmdName: string;
    cmdPluginId: string;
}

declare interface ICodeParcel {
    code: string;
}

declare interface ICmdParcel {
    cmdName: string;
    cmdPluginId: string;
    cmdArgs: undefined | any[];
}

declare interface ILiveTextParcel {
    text: string;
    isSuccess?: boolean;
    // not final text is shown as lighter (less certainty)
    isFinal?: boolean;
    hold?: boolean;
}

declare interface ICmdLiveTextParcel extends ILiveTextParcel, ICmdParcel {}

declare interface IMsgForBg {
    type: 'loadPlugins'|'closeTutorial'|'setLanguage';
    payload?: any;
}
