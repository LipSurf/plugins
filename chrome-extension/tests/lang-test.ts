import test from 'ava';
import * as sinon from 'sinon';
import {ExecutionContext} from 'ava';
import { storage } from "../src/common/browser-interface";
import Japanese from '../src/background/recognizer/langs/ja';
import { isEmpty, xor, } from 'lodash';

const DICT = {
    'お召し': ['おめし'],
    '上がり': ['あがり'],
    '引き取る': ['ひきとる'],
    '富士': ['ふんじ', 'ふじ'],
    '今日': ['ほんじつ', 'きょう', 'こんにち'],
    '明日': ['あした', 'みょうにち', 'あす'],
    '型': ['けい', 'がた'],
    '階': ['かい'],
};

test.before(async(t:ExecutionContext<{langRecg: ILanguageRecg}>) => {
    let localStoreLoad = sinon.stub(storage.local, 'load');
    localStoreLoad.resolves({
        langData: {
            ja: {
                ...DICT
            }
        }
    });
    t.context.langRecg = new Japanese();
    t.context.langRecg.init();
});

test('to hiragana conversion', (t:ExecutionContext<{langRecg: ILanguageRecg}>) => {
    let cases = {
        'こんに': ['こんに'],
        'こんにちは': ['こんにちは'],
        'さようならすっか': ['さようならすっか'],
        'カタカナ': ['かたかな'],
        'カタカナこんにちは': ['かたかなこんにちは'],
        'お召し上がりこんにち': ['おめしあがりこんにち'],
        '今日': ['ほんじつ', 'きょう', 'こんにち'],
        '今日引き取る': ['きょうひきとる', 'ほんじつひきとる', 'こんにちひきとる'],
        '富士': ['ふじ', 'ふんじ'],
        // // doesn't do de-inflection yet
        // // '今日は引き取りましたか': ['きょうはひきとりましたか'],
        '今日お召し': ['ほんじつおめし', 'きょうおめし', 'こんにちおめし'],
        '今日明日': ['ほんじつあした', 'きょうあした', 'こんにちあした',
                    'ほんじつみょうにち', 'きょうみょうにち', 'こんにちみょうにち',
                    'ほんじつあす', 'きょうあす', 'こんにちあす'],
        'ハート型': ['はーとがた', 'はーとけい'],
        'こんにちはこん': ['こんにちはこん'],
        'こんにちはこんにち': ['こんにちはこんにち'],
        'こんにちはこんにちはこ': ['こんにちはこんにちはこ'],
        'こんにちはこんにちはこんにちはいっとな': ['こんにちはこんにちはこんにちはいっとな'],
        'こんにちはこんにちはこんにちはいっとなこんにちはな': ['こんにちはこんにちはこんにちはいっとなこんにちはな'],
        '42': ['42'],
        '4階': ['4かい'],
        '42階': ['42かい'],
        '階42': ['かい42'],
        '42階42': ['42かい42'],
        '42階42階': ['42かい42かい'],
        // let romaji pass so homophones can be used
        'skip': ['skip'],
    };
    for (let _case in cases) {
        console.time(`hiraganize ${_case}`);
        let hiraganized = Array.from(t.context.langRecg.preprocess(_case));
        console.log(`hiraginized ${hiraganized}`);
        console.timeEnd(`hiraganize ${_case}`);
        t.truthy(hiraganized.length === cases[_case].length && isEmpty(xor(hiraganized, cases[_case])), `case: ${_case} hiraganized: ${hiraganized}`);
    }
});
