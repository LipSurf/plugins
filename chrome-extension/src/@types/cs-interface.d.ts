declare interface ILiveText {
    text: string,
    isSuccess: boolean,
}

declare type IBackgroundParcel = ICmdParcel | ILiveTextParcel | IToggleParcel;

declare interface ICmdParcel {
    cmdName: string,
    cmdPluginId: string,
    cmdArgs: undefined | any[],
}

declare interface ILiveTextParcel {
    liveText: ILiveText,
}

declare interface IToggleParcel {
    toggleActivated: boolean,
}
