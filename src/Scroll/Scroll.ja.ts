/// <reference types="lipsurf-types/extension"/>
import Scroll from "./Scroll";

Scroll.languages!.ja = {
    niceName: "スクロール",
    description: "ページのスクロールを管理できます。",
    homophones: {
        "しーた": "した",
        "ちーたー": "した",
    },
    authors: "Miko, Hiroki Yamazaki",
    commands: {
        "Scroll Bottom": {
            name: "ページの一番下に移動",
            match: ["いちばんした"],
        },
        "Scroll Top": {
            name: "ページの一番上に移動",
            match: ["いちばんうえ"],
        },
        "Scroll Down": {
            name: "下にスクロール",
            match: ["した", "したにすくろーる", "したへすくろーる", "だうん"],
        },
        "Scroll Up": {
            name: "上にスクロール",
            match: ["うえ", "うえにすくろーる", "うえへすくろーる", "あっぷ"],
        },
        "Scroll Right": {
            name: "右にスクロール",
            match: ["みぎ", "みぎにすくろーる", "みぎへすくろーる"],
        },
        "Scroll Left": {
            name: "左にスクロール",
            match: ["ひだり", "ひだりにすくろーる", "ひだりへすくろーる"],
        },
        "Scroll Up a Little": {
            name: "少し上にスクロール",
            match: ["すこしうえ", "すこしうえにすくろーる", "すこしうえへすくろーる"],
        },
        "Scroll Down a Little": {
            name: "少し下にスクロール",
            match: ["すこしした", "すこししたにすくろーる", "すこししたへすくろーる"],
        },
        "Auto Scroll": {
            name: "自動スクロール",
            match: "じどうすくろーる",
        },
        "Faster": {
            name: "もっと早くスクロール",
            match: "はやく",
        }, 
        "Slower": {
            name: "もっとゆっくりスクロール",
            match: "ゆっくり",
        },
        "Stop": {
            name: 'スクロールを止める',
            match: ['すとっぷ', 'ていし', 'とめる'],
        },
        "Scroll Help Down": {
            name: "ヘルプ下",
            match: "へるぷした",
        },
        "Scroll Help Up": {
            name: "ヘルプ上",
            match: "へるぷうえ",
        },
    },
};