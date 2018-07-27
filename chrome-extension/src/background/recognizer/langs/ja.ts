import { httpReq } from "../../../common/util";
import { storage } from "../../../common/browser-interface";
import { MissingLangPackError } from "../../../common/util";

const JA_DICT_URL = 'https://www.lipsurf.com/assets/ja-dict.json';

// character ranges
const HIRAGANA_CHARS = [0x3041, 0x309f];
const KATAKANA_CHARS = [0x30a1, 0x30fa];
const KANJI_CHARS = [0x4e00, 0x9faf];

// The longest dictionary entry is no more than 27 characters
const MAX_DICT_ENTRY_LENGTH = 27;

// TODO: doesn't handle deinflection yet
// taken from https://github.com/ashchan/japanese-coffee-kit/blob/master/lib/deinflect.js
// const DEINFLECTION_RULES;

function isCharInRange(char = '', start:number, end:number):boolean {
    if (char === '') return false;
    let code = char.charCodeAt(0);
    // console.log(`char: ${char} code: ${code.toString(16)}`);
    return start <= code && code <= end;
}

/*
 * Generator -- kanji can have ambiguous/multiple readings.
 * exported so it can be separately tested
 */
export function* convertToHiragana(input:string, dictionary={}, outputed=[]): IterableIterator<string> {
    let dictionaryEntries = dictionary[input];
    // console.log(`${input} dictEntries: ${dictionaryEntries}`);
    if (dictionaryEntries) {
        for (let entry of dictionaryEntries) {
            // console.log(`yielding ${entry}`)
            yield entry;
        }
    } else {
        let sp = input.length;
        while (sp > 1) {
            // console.log(`sp: ${sp} input: ${input}`);
            sp -= 1;
            let a = convertToHiragana(input.substring(0, sp), dictionary, outputed);
            for (let av = a.next().value; av; av = a.next().value) {
                // console.log(`a value: ${av}`);
                let b = convertToHiragana(input.substring(sp, input.length), dictionary, outputed)
                for (let bv = b.next().value; bv; bv = b.next().value) {
                    // console.log(`b value: ${bv}`);
                    let combined = `${av}${bv}`;
                    // prevent dupes
                    if (!~outputed.indexOf(combined)) {
                        outputed.push(combined);
                        yield combined;
                    }
                    // console.log(`sp: ${sp} input: ${input} yielded ${av}${bv}`);
                }
            }
        }
        // }
    }
    // console.log('end');
}


export default class Japanese implements ILanguageRecg {
    homophones = {};
    loaded: Promise<void> = new Promise(() => {});
    dictionary: {
        [key: string]: string[],
    };

    // must be safe to call multiple times
    // don't use standard constructor because that can't be async
    async init() {
        if (!this.dictionary) {
            let stored = await storage.local.load('langData');

            if (!stored.langData || !stored.langData['ja']) {
                throw new MissingLangPackError();
            }
            // add kana to dictionary
            let hiragana = String.fromCharCode(...[...Array(HIRAGANA_CHARS[1] - HIRAGANA_CHARS[0]).keys()].map(i => i + HIRAGANA_CHARS[0]))
                .split('')
                .reduce((memo, x) => Object.assign(memo, {[x]: x}), {});
            let katakana = String.fromCharCode(...[...Array(KATAKANA_CHARS[1] - KATAKANA_CHARS[0]).keys()].map(i => i + KATAKANA_CHARS[0]))
                .split('')
                .reduce((memo, x) => Object.assign(memo, {[x]: String.fromCharCode(x.charCodeAt(0) - 96)}), {});
            String.fromCharCode(...[...Array(KATAKANA_CHARS[0] - KATAKANA_CHARS[0])].map(i => i + KATAKANA_CHARS));
            this.dictionary = {
                ...stored.langData['ja'],
                ...hiragana,
                ...katakana,
                'ー': 'ー',
            }; 
        }
    }

    async getExtraData() {
        // download
        await storage.local.save({langData: {ja: JSON.parse(await httpReq(JA_DICT_URL))}});
    }

    ordinalOrNumberToDigit() {
        return 0;
    }

    wordSplitter(phrase:string):string[] {
        return phrase.split('');
    }

    wordJoiner(words:string[]):string {
        return words.join('');
    }

    // init needs to be called before this
    preprocess = x => convertToHiragana(x, this.dictionary);

};

