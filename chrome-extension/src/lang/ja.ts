// character ranges
const HIRAGANA_CHARS = [0x3040, 0x309f];
const KATAKANA_CHARS = [0x30a0, 0x30ff];
const KANJI_CHARS = [0x4e00, 0x9faf];


function isCharInRange(char = '', start:number, end:number):boolean {
    if (char === '') return false;
    let code = char.charCodeAt(0);
    console.log(`char: ${char} code: ${code.toString(16)}`);
    return start <= code && code <= end;
}

/*
 *
 */
export function convertToHiragana(input:string): string {
    let ret = [];
    for (let c of input) {
        if (isCharInRange(c, HIRAGANA_CHARS[0], HIRAGANA_CHARS[1])) {
            ret.push(c);
        } else if (isCharInRange(c, KATAKANA_CHARS[0], KATAKANA_CHARS[1])) {
            ret.push(String.fromCodePoint(c.charCodeAt(0) - 96));
        }
    }
    return ret.join('');
}
