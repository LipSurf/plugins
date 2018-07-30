declare interface ILanguageRecg {
    init?: () => void;
    // less common -> common
    // global homophones that all plugins share
    // mis-hearings kept in homophones so they can be easily tracked for removal
    // as voice recognition improves
    homophones?: {
        [source: string]: string,
    };
    // A function to transform the key side of the homophones (eg. for english we add \b word boundaries to either side of the RegExp)
    homophoneProcessor?(homophone:string):RegExp;
    ordinalOrNumberToDigit: (input: string) => number;
    wordSplitter: (phrase: string) => string[];
    wordJoiner: (words: string[]) => string;
    getExtraData?: () => Promise<void>;
    // before homonizing input -- what we do for kanji,katakana->hiragana conversion for Japanese, for example
    preprocess?: (phrase: string) => IterableIterator<string>;
}
