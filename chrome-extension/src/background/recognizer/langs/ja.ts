import { httpReq } from "../../../common/util";
import { storage } from "../../../common/browser-interface";
import { MissingLangPackError } from "../../../common/util";
import { resolve } from "url";

const JA_DICT_URL = 'https://www.lipsurf.com/assets/ja-dict.json';

// character ranges
const HIRAGANA_CHARS = [0x3040, 0x309f];
const KATAKANA_CHARS = [0x30a0, 0x30ff];
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
 * Generator -- kanji can have ambiguous/multiple readings
 * export so it can be separately tested
 */
export function* convertToHiragana(input:string, dictionary={}): IterableIterator<string> {
    let kananized = [];
    let ret = [];
    // first let's convert kanji to hiragana
    for (let windowStart = 0; windowStart < input.length; windowStart += 1) {
        let somethingFound = false;
        for (let windowEnd = Math.min(windowStart + MAX_DICT_ENTRY_LENGTH, input.length); windowEnd > windowStart; windowEnd -= 1) {
            let entry = dictionary[input.substring(windowStart, windowEnd)];
            if (entry) {
                kananized = kananized.concat(entry[0].split(''));
                windowStart = windowEnd - 1;
                somethingFound = true;
                break;
            }
        }
        if (!somethingFound)
            kananized.push(input[windowStart]);
    }

    // only let through hiragana and katakana -- don't even allow punctuation
    for (let c of kananized) {
        if (isCharInRange(c, KATAKANA_CHARS[0], KATAKANA_CHARS[1])) {
            ret.push(String.fromCodePoint(c.charCodeAt(0) - 96));
        } else if (isCharInRange(c, HIRAGANA_CHARS[0], HIRAGANA_CHARS[1])) {
            ret.push(c);
        }
    }
    console.log(`kananized: ${ret}`);

    yield ret.join('');
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
            this.dictionary = stored.langData['ja']; 
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

