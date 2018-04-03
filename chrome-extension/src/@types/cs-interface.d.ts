declare type IBackgroundParcel = ICmdParcel | ILiveTextParcel | IToggleParcel | ITranscriptParcel;

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
    isSuccess: boolean,
}

declare interface ILiveTextParcel {
    liveText: ILiveText,
}

declare interface IToggleParcel {
    toggleActivated: boolean,
}
