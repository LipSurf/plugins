declare interface ILanguageRecg {
    init?: () => void;
    // less common -> common
    // global homophones that all plugins share
    // mis-hearings kept in homophones so they can be easily tracked for removal
    // as voice recognition improves
    homophones?: {
        [source: string]: string,
    };
    ordinalOrNumberToDigit: (input: string) => number;
    wordSplitter: (phrase: string) => Promise<string[]>;
    wordJoiner: (words: string[]) => string;
    getExtraData?: () => void;
}
