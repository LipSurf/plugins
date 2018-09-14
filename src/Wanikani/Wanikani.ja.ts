/// <reference path="../@types/plugin-interface.d.ts"/>
/// <reference path="Wanikani.ts" />

namespace WanikaniPlugin {
    Plugin.languages.ja = {
        niceName: '鰐蟹',
        description: '鰐蟹の練習',
        authors: "Miko",
        homophones: {
            "わにがめ": "わにかに",
            "なにかね": "わにかに",
            "なにかに": "わにかに",
            "おわりかね": "わにかに",
            "まりかに": "わにかに",
            "おりがみ": "わにかに",
            "おにがみ": "わにかに",
            "もにたあに": "わにかに",
            "わにかれー": "わにかに",
            "えいが": "えいご",
            "おつり": "つぎ",
            "つり": "つぎ",
            "ちぇりい": "つぎ",
            "ちゅり": "つぎ",
            "c": "し",
            "k": "けい",
            "a": "えい",
            "n": "えん",
            "b":　"び",
            "g": "じ",
            "skip": "すきっぷ",
            "1": "いち",
            "2": "に",
            "3": "さん",
            "4": "よん",
            "し": "よん",
            "5": "ご",
            "6": "ろく",
            "7": "なな",
            "しち": "なな",
            "8": "はち",
            "9": "きゅう",
            "10": "じゅう",
            "12": "じゅんい",
            "42": "よんじゅうに",
            "100": "ひゃく",
            "300": "さんびゃく",

        },

        commands: {
            "Go to WaniKani Reviews": {
                name: "鰐蟹の復習",
                match: "わにかに"
            },
            "Answer": {
                name: "答え",
                match: {
                    fn: (transcript) => {
                        // try matching the words starting from the first word, then slide the part of the transcript that we are checking
                        // for over towards the end word-by-word in case the user made a correction and it's included in the same transcript.
                        // eg. transcript: "部署文章" and the answer is "文章"
                        if (Plugin.instanceOfVocab(Plugin.curItem) || Plugin.instanceOfKanji(Plugin.curItem)) {
                            let properAns;
                            if (Plugin.instanceOfVocab(Plugin.curItem))
                                properAns = Plugin.curItem.kana;
                            else {
                                if (Plugin.curItem.emph === "kunyomi") {
                                    console.log(`trans: ${transcript} ans:${Plugin.curItem.kun.join(',')}`);
                                } else {
                                    console.log(`trans: ${transcript} ans:${Plugin.curItem.on.join(',')}`);
                                }
                                // put in onyomi or kunyomi and submit it -- at least user will get feeback from the page about
                                // whether kun or on is sought for
                                properAns = Plugin.curItem.kun.concat(Plugin.curItem.on)
                            }

                            let tsParts = transcript.split('');
                            for (let tsI = 0; tsI < tsParts.length; tsI++) {
                                let ts = tsParts.slice(tsI, tsParts.length).join('');
                                if (~properAns.indexOf(ts)) {
                                    return [ts];
                                }
                            }

                            // if there's a partial match -- return false so we can delay executing of another matching command
                            // to prevent issues like spelling "t-o-d-o-k-e-r-u" going to reddit.com/r/you
                            for (let properAn of properAns) {
                                if (properAn.indexOf(transcript) === 0) {
                                    return false;
                                }
                            }

                            // seems to have gotten the answer wrong
                            // HACK: we can't tell when we're checking a partial answer or a "final" answer from the user -- so we use a timer
                            // to guesstimate
                            let now = + new Date();
                            if (!Plugin.lastStrike || now > Plugin.lastStrike + 1500) {
                                Plugin.strikes += 1;
                                if (Plugin.strikes == 3) {
                                    Plugin.showHint(Plugin.instanceOfKanji(Plugin.curItem) ? (Plugin.curItem.emph === "kunyomi" ? Plugin.curItem.kun.join(', ') : Plugin.curItem.on.join(', ')) : Plugin.curItem.kana.join(', '));
                                } else {
                                    Plugin.lastStrike = now;
                                }
                            }
                        }
                    },
                    description: "正解のみを受け入れる"
                },
            },
            "Info": {
                name: "情報",
                match: "じょうほう",
                nice: "情報",
            },
            "Wrong": {
                name: "ダメ",
                match: ["だめ", "ばつ"],
            },
            "Skip": {
                name: "スキップ",
                match: ["すきっぷ", "ただしい",],
                nice: (rawInput: string, matchOutput: any[]) => {
                    if (~rawInput.indexOf("ただしい")) {
                        return "正しい";
                    } else {
                        return "スキップ";
                    }
                },
            },
            "Next": {
                name: "次",
                match: ["つぎ", 'ねくすと'],
                nice: (rawInput: string, matchOutput: any[]) => {
                    if (~rawInput.indexOf("つぎ")) {
                        return "次";
                    } else {
                        return "ネクスト";
                    }
                },
            },
        },
    };
}
