import test from 'ava';
import { convertToHiragana } from '../src/background/recognizer/langs/ja';
import { isEmpty, xor, } from 'lodash';


test('hiragana stays hiragana', t => {
    let cases = {
        'こんにちは': ['こんにちは'],
        'さようなら、すっか': ['さようならすっか'],
        'カタカナ': ['かたかな'],
        'カタカナとひらがな': ['かたかなとひらがな'],
        'お召し上がりください': ['おめしあがりください'],
        '今日': ['きょう'],
        '今日引き取る': ['きょうひきとる'],
        // doesn't do de-inflection yet
        // '今日は引き取りましたか': ['きょうはひきとりましたか'],
    };
    let dict = {
        '今日': ['きょう'],
        'お召し': ['おめし'],
        '上がり': ['あがり'],
        '引き取る': ['ひきとる'],
    }
    for (let _case in cases) {
        let hiraganized = Array.from(convertToHiragana(_case, dict));
        t.truthy(isEmpty(xor(hiraganized, cases[_case])), `hiraganized: ${hiraganized}`);
    }
});
