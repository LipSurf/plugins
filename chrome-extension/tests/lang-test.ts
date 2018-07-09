import test from 'ava';
import { convertToHiragana } from '../src/lang/ja';

test('hiragana stays hiragana', t => {
    let cases = {
        'こんにちは': ['こんにちは'],
        'さようなら、すっか': ['さようならすっか'],
        'カタカナ': ['かたかな'],
    };
    for (let _case in cases) {
        t.is(convertToHiragana(_case), cases[_case][0]);
    }
});
