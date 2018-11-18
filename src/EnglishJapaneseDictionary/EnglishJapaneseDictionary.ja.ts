/// <reference path="../@types/plugin-interface.d.ts"/>
import { EnglishJapaneseDictionaryPlugin } from './EnglishJapaneseDictionary';


EnglishJapaneseDictionaryPlugin.Plugin.languages.ja = {
    niceName: '英語＜ー＞日本語の辞書',
    description: '英語と日本語の言葉を辞書でひいてごらん。',
    authors: 'Miko',
    commands: {
        "Japanese Word Lookup": {
            name: "日本語の言葉を検索する",
            match: "じしょ*",
        }
    }
}
