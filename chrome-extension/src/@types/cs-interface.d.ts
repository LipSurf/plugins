declare type IBackgroundParcel = ICmdParcel | ILiveTextParcel | IToggleParcel | ITranscriptParcel;

// incoming transcript that we need to check match for
declare interface ITranscriptParcel {
    processedInput: string,
    cmdName: string,
    cmdPluginId: string,
}

declare interface ICmdParcel {
    cmdName: string,
    cmdPluginId: string,
    cmdArgs: undefined | any[],
}

declare interface ILiveText {
    text: string,
    isFinal?: boolean,
    isSuccess?: boolean,
}

declare interface ILiveTextParcel {
    liveText: ILiveText[],
    hold?: boolean,
}

declare interface ICmdLiveTextParcel extends ILiveTextParcel, ICmdParcel {}

declare interface IToggleParcel {
    toggleActivated: boolean,
}
