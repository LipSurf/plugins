/// <reference types="lipsurf-types/extension"/>
import ScrollPlugin from "./Scroll";

ScrollPlugin.languages!.ja = {
    niceName: "スクロール",
    description: "ページのスクロール管理できます.",
    homophones: {
        "しーた": "した",
    },
    authors: "Miko",
    commands: {
        "Scroll Bottom": {
            name: "ページの終端へ移動する",
            match: ["しゅうたんへいどうして"],
        },
        "Scroll Top": {
            name: "ページの先頭へ移動する",
            match: "とっぷ",
        },
        "Scroll Down": {
            name: "下へスクロールする",
            match: ["した", "したへすくろーる"],
        },
        "Scroll Up": {
            name: "上へスクロールする",
            match: ["うえ", "うっぷ", "うえへすくろーる"],
        },
        "Scroll Right": {
            name: "右へスクロールする",
            match: ["みぎへすくろーる"],
        },
        "Scroll Left": {
            name: "左へスクロールする",
            match: ["ひだりへすくろーる"],
        },
        "Scroll Up a Little": {
            name: "ちょっと上へスクロールする",
            match: ["ちょっとうえ", "ちょっとうえへすくろーる", "ちょっとうっぷ"],
        },
        "Scroll Down a Little": {
            name: "ちょっと下へスクロールする",
            match: ["ちょっとしたへすくろーる", "ちょっとしたへ"],
        },
        "Auto Scroll": {
            name: "自動スクロール",
            match: "じどうすくろーる",
        },
        "Faster": {
            name: "もっと早く",
            match: "もっとはやく",
        }, 
        "Slower": {
            name: "もっとゆっくり",
            match: "もっとゆっくり",
        },
        "Scroll Help Down": {
            name: "へるぷ下に",
            match: "へるぷしたに",
        },
        "Scroll Help Up": {
            name: "へるぷ上に",
            match: "へるぷうえに",
        },
    },
};
