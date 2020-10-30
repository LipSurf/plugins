/// <reference types="lipsurf-types/extension"/>
import CopyCutPaste from "./CopyCutPaste";

CopyCutPaste.languages!.ja = {
    niceName: 'コピー, 切り取り, 貼り付け',
    description: "このプラグインの使用前にマウスで権限を与える必要があります。",
    authors: "Hiroki Yamazaki, Miko",
    commands: {
        'Copy': {
            name: 'コピー',
            description: '選択されたテキストをクリップボードにコピーします。',
            match: 'こぴー',
        },
        'Cut': {
            name: '切り取り',
            description: "選択されたテキストをクリップボードに切り取ります。",
            match: ['かっと', 'きりとり']
        },
        'Paste': {
            name: '貼り付け',
            description: 'クリップボードの内容を貼り付けます。',
            match: ['はりつけ', 'ぺーすと']
        }
    },
};