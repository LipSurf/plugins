/// <reference path="../@types/plugin-interface.d.ts"/>

namespace WanikaniPlugin {
    declare const PluginBase: IPluginBase;
    declare const wanakana: {
        toKana: (romaji: string) => string,
    };

    interface RadicalItem extends WKBaseItem {

    }

    interface VocabItem extends WKBaseItem {
        // audio
        aud: string;
        voc: string;
        kana: string[];
    }

    interface KanjiItem extends WKBaseItem {
        kan: string;
        // onyomi
        on: string[];
        // kunyomi
        kun: string[];
        emph: "kunyomi"|"onyomi";
        nanori: string[];
    }

    interface RadicalItem extends WKBaseItem {
        custom_font_name: string|null,
        rad: string,
    }

    interface WKBaseItem {
        en: string[];
        id: number;
        syn: string[];
        srs: number;
    }

    interface WKStorage {
        questionType: 'meaning'|'reading';
        currentItem: WKBaseItem;
    }

    interface IWanikaniPlugin extends IPlugin {
        // private vars
        origLang: LanguageCode; // which version of English is set
        curItem: WKBaseItem;
        curQType: 'reading'|'meaning';
        strikes: number;
        lastStrike: number;
        storageChangeTimeoutHandler: number;
        showHint: (text?: string) => void;
        lastStorageUpdate: number;
        storageChangeObserver: () => void;
        submitAnswer: (answer: string) => void;
        instanceOfKanji: (object: any) => object is KanjiItem;
        instanceOfVocab: (object: any) => object is VocabItem;
        instanceOfRadical: (object: any) => object is RadicalItem;
        getCorrect: () => string;
        resetLangChangers: () => void;
        fuzzyCorrect: (a: string, b: string) => boolean;
        getEditDistance: (a: string, b: string) => number;
    }

    export let Plugin: IWanikaniPlugin = Object.assign({}, PluginBase, {
        niceName: 'WaniKani',
        description: 'WaniKani lesson reviews',
        version: '1.0.0',
        apiVersion: '1',
        match: /^https?:\/\/(www\.)?wanikani\.com\/review/,
        pro: true,
        homophones: {
            "cracked": "correct",
            // a bit overarching -- this is currently affecting tag (TODO: fix to make it work only on WK)
            "text": "next",
            "morning county": "wanikani",
            "morning connie": "wanikani",
            "monterey county": "wanikani",
            "ankeny": "wanikani",
            "wanee county": "wanikani",
            "bonnie connie": "wanikani",
            "pawnee county": "wanikani",
            "funny connie": "wanikani",
            "honey": "wanikani",
            "winneconnie": "wanikani",
            "trafficator": "wanikani",
            "navigator": "wanikani",
            "white county": "wanikani",
            "white guy": "wanikani",
            "crocodile crap": "wanikani",
            "lonnie connie": "wanikani",
            "wanee connie": "wanikani",
            "winneconne": "wanikani",
            "ashton": "last 10",
            "1": "one",
            "2": "two",
            "3": "three",
            "4": "four",
            "5": "five",
            "6": "six",
            "7": "seven",
            "8": "eight",
            "9": "nine",
            "10": "ten",
            "11": "eleven",
            "12": "twelve",
            "13": "thirteen",
            "14": "fourteen",
            "16": "sixteen",
            "17": "seventeen",
            "18": "eighteen",
            "19": "nineteen",
            "20": "twenty",
            "42": "fourty two",
            "100": "one hundred",
            "one hundred": "hundred",
            "300": "three hundred",
            "200": "two hundred",
            "400": "four hundred",
            "500": "five hundred",
            "1000": "one thousand",
            "one thousand": "thousand",
            "4000": "four thousand",
            "10000": "ten thousand",
            "100000": "one hundred thousand",
            "20000": "twenty thousand",
            "one hundred thousand": "hundred thousand",
            // specific for wk vocab/kanji
            "cana": "kana",
        },
        authors: "Miko",

        // private vars
        instanceOfKanji: (object: any): object is KanjiItem => {
            return typeof object === 'object' && 'kan' in object;
        },

        instanceOfVocab: (object: any): object is VocabItem => {
            return typeof object === 'object' && 'voc' in object;
        },

        instanceOfRadical: (object: any): object is RadicalItem => {
            return typeof object === 'object' && 'rad' in object
        },

        curItem: undefined,
        curQType: undefined,
        origLang: undefined,
        storageChangeTimeoutHandler: undefined,
        strikes: 0,
        lastStrike: undefined,
        lastStorageUpdate: undefined,
        storageChangeObserver: undefined,
        submitAnswer: (answer) => {
            console.log(`setting answer to ${answer}`);
            // only do this if the answer form isn't already filled (using :enabled) to prevent late recognition coming in and hitting the next button
            // when the user did not explicitly say next
            let inputBox:HTMLInputElement = document.querySelector('#user-response:enabled');
            if (inputBox) {
                inputBox.value = answer;
                document.querySelector<HTMLButtonElement>('#answer-form form button').click();
            }
        },

        getCorrect: (): string => {
            if (Plugin.instanceOfVocab(Plugin.curItem)) {
                if (Plugin.curQType === 'meaning') {
                    return Plugin.curItem.en[0];
                } else {
                    return Plugin.curItem.kana[0];
                }
            } else if (Plugin.instanceOfKanji(Plugin.curItem)) {
                if (Plugin.curQType === 'meaning') {
                    return Plugin.curItem.en[0];
                } else if (Plugin.curItem.emph === "kunyomi") {
                    return Plugin.curItem.kun[0];
                } else if (Plugin.instanceOfKanji(Plugin.curItem) && Plugin.curItem.emph === "onyomi") {
                    return Plugin.curItem.on[0];
                }
            } else if (Plugin.instanceOfRadical(Plugin.curItem)) {
                return Plugin.curItem.en[0];
            }
        },

        /* Copyright (c) 2011 Andrei Mackenzie
            Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
            The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
            THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
        */
        // Compute the edit distance between the two given strings
        getEditDistance: (a:string, b:string): number => {
            if(a.length == 0) return b.length;
            if(b.length == 0) return a.length;

            var matrix = [];

            // increment along the first column of each row
            var i;
            for(i = 0; i <= b.length; i++){
            matrix[i] = [i];
            }

            // increment each column in the first row
            var j;
            for(j = 0; j <= a.length; j++){
            matrix[0][j] = j;
            }

            // Fill in the rest of the matrix
            for(i = 1; i <= b.length; i++){
            for(j = 1; j <= a.length; j++){
                if(b.charAt(i-1) == a.charAt(j-1)){
                matrix[i][j] = matrix[i-1][j-1];
                } else {
                matrix[i][j] = Math.min(matrix[i-1][j-1] + 1, // substitution
                                        Math.min(matrix[i][j-1] + 1, // insertion
                                                matrix[i-1][j] + 1)); // deletion
                }
            }
            }

            return matrix[b.length][a.length];
        },

        // returns true for levenshtein distance less than
        // factor that depends on length of longer string
        fuzzyCorrect: (a: string, b: string): boolean => {
            let longer = a.length > b.length ? a : b;
            let maxDist = Math.min(Math.floor(longer.length / 4), 5);
            return Plugin.getEditDistance(a, b) <= maxDist;
        },

        showHint: (text:string = '') => {
            let inputBox:HTMLInputElement = document.querySelector('#user-response');
            inputBox.placeholder = text;
        },

        init: () => {
            if (document.location.href.startsWith('https://www.wanikani.com/review/session')) {
                // we need the wanakana library to do manual spelling out of short utterances
                // for kanji -- because currently the japanese speech recognizer isn't good
                // at this
                $.get("https://unpkg.com/wanakana", eval);

                console.log('wk init ');

                // when the user leaves this session (finishes it) switch back to eng
                window.onbeforeunload = () => {
                    Plugin.resetLangChangers();
                };

                let times = 0;
                PluginBase.util.getLanguage().then(selectedLang => {
                    Plugin.origLang = selectedLang;
                    // not ideal if user had some dialect setting other than en-US but
                    // went on WK with Japanese on
                    if (!Plugin.origLang.startsWith('en')) {
                        Plugin.origLang = 'en-US';
                    }
                    // HACK: observing with jStorage.listenKeyChange and window.addEventListener("storage") does not
                    // work. Perhaps because we are on a different window context than the page
                    // check whether to change the language based on whether we're doing a reading or writing
                    Plugin.storageChangeObserver = async () => {
                        let update = +window.localStorage.getItem('jStorage_update');
                        if (update !== Plugin.lastStorageUpdate) {
                            let parsedStorage:WKStorage = JSON.parse(window.localStorage.getItem('jStorage'));
                            // check if the id or q type changed, otherwise we get an "update" here when the question is marked as right or wrong
                            if (parsedStorage) {
                                if (parsedStorage.currentItem && (Plugin.curItem == null || (parsedStorage.currentItem.id !== Plugin.curItem.id || parsedStorage.questionType !== Plugin.curQType))) {
                                    Plugin.curItem = parsedStorage.currentItem;
                                    Plugin.strikes = 0;
                                    Plugin.lastStrike = null;
                                    console.log('Storage item updated!');
                                    console.dir(Plugin.curItem);
                                    Plugin.curQType = parsedStorage.questionType;

                                    let curLang = await PluginBase.util.getLanguage();
                                    let shouldBeLang = Plugin.curQType === 'reading' ? 'ja' : Plugin.origLang;
                                    if (curLang !== shouldBeLang) {
                                        console.log(`setting lang to ${shouldBeLang}`);
                                        PluginBase.util.setLanguage(shouldBeLang);
                                    }
                                }
                                Plugin.lastStorageUpdate = update;
                            } else {
                                times += 1;
                                if (times <= 100) {
                                    window.setTimeout(Plugin.storageChangeObserver, 50);
                                    throw "Could not get WK parsed storage";
                                }
                            }
                        }
                        Plugin.storageChangeTimeoutHandler = window.setTimeout(Plugin.storageChangeObserver, 50);
                    };
                    Plugin.storageChangeObserver();
                });
            }
        },

        resetLangChangers: () => {
            // stop running the language changing logic
            window.clearTimeout(Plugin.storageChangeTimeoutHandler);

            // switch back to main language if we've changed the lang
            if (Plugin.origLang) {
                PluginBase.util.setLanguage(Plugin.origLang);
            }
            // so the storageChangeObserver executes
            Plugin.lastStorageUpdate = null;
            Plugin.curItem = null;
        },

        destroy: () => {
            console.log('wk destroy');
            Plugin.resetLangChangers();
        },

        commands: [
            {
                name: 'Go to WaniKani Reviews',
                description: "Goes to https://www.wanikani.com/review/session",
                global: true,
                match: ["crocodile crab", "wk", "wanikani"],
                pageFn: async () => {
                    window.location.href = "https://www.wanikani.com/review/session";
                }
            },
            {
                name: 'Answer',
                match: {
                    fn: (transcript:string) => {
                        // are we answering a kana question in English?
                        if (Plugin.curQType === 'reading') {
                            let ans = wanakana.toKana(transcript.replace(/\s*/g, ''));
                            console.log(`answering a reading q in English ${transcript} -> ${ans}`);
                            let properAns;
                            if (Plugin.instanceOfKanji(Plugin.curItem)) {
                                properAns = Plugin.curItem.kun.concat(Plugin.curItem.on);
                            } else if (Plugin.instanceOfVocab(Plugin.curItem)) {
                                properAns = Plugin.curItem.kana;
                            }

                            if (properAns) {
                                if (~properAns.indexOf(ans)) {
                                    return [ans];
                                } else {
                                    // if there's a partial match -- return false so we can delay executing of another matching command
                                    // to prevent issues like spelling "t-o-d-o-k-e-r-u" going to reddit.com/r/you
                                    for (let properAn of properAns) {
                                        if (properAn.indexOf(ans) === 0) {
                                            return false;
                                        }
                                    }
                                }
                            }
                        } else {
                            // try matching the words starting from the first word, then slide the part of the transcript that we are checking
                            // for over towards the end word-by-word in case the user made a correction and it's included in the same transcript.
                            // eg. transcript: "experience experiment" and the answer is experiment
                            let tsParts = transcript.split(' ');
                            let noSpacesTs = tsParts.join('');
                            let origAns = Plugin.curItem.en.concat(Plugin.curItem.syn);
                            let concatted = origAns.map(x => x.toLowerCase().replace(/ /g, '').replace(/\'|-/g, ''));
                            for (let tsI = 0; tsI < tsParts.length; tsI++) {
                                // ignore spacing
                                let tsSeparated = tsParts.slice(tsI, tsParts.length);
                                let ts = tsSeparated.join('');
                                console.log(`ts: ${ts} whole trans: ${transcript} ans:${concatted.join(',')}`);
                                for (let i = 0; i < concatted.length; i++) {
                                    if (Plugin.fuzzyCorrect(concatted[i], ts)) {
                                        // don't use the user input because if it's a spelled out word (eg. t a i l) then it will fail on WK
                                        // concatted is no bueno because it has spaces removed -- so rebuild the original ans array
                                        return [origAns[i].toLowerCase()];
                                    }
                                }
                            }
                            // for example "help wanted"　求人 should not open help
                            for (let properAn of concatted) {
                                if (properAn.indexOf(noSpacesTs) === 0) {
                                    // a partial match, we return false to inform the recg. so it can judge whether to add delay
                                    // to any other matching commands
                                    return false;
                                }
                            }
                        }

                        // seems to have gotten the answer wrong
                        // HACK: we can't tell when we're checking a partial transcript answer or a "final" answer from the user -- so we use a timer
                        // to guesstimate
                        let now = + new Date();
                        if (!Plugin.lastStrike || now > Plugin.lastStrike + 1500) {
                            Plugin.strikes += 1;
                            if (Plugin.strikes == 3) {
                                // redundant to check whether kanji or vocab (it has to be for the reading type)
                                // but we need this for typescript checks
                                if (Plugin.curQType === 'reading' && (Plugin.instanceOfKanji(Plugin.curItem) || Plugin.instanceOfVocab(Plugin.curItem))) {
                                    Plugin.showHint(Plugin.instanceOfKanji(Plugin.curItem) ? (Plugin.curItem.emph === "kunyomi" ? Plugin.curItem.kun.join(', ') : Plugin.curItem.on.join(', ')) : Plugin.curItem.kana.join(', '));
                                } else {
                                    Plugin.showHint(Plugin.curItem.en.concat(Plugin.curItem.syn).join(', '));
                                }
                            } else {
                                Plugin.lastStrike = now;
                            }
                        }
                    },
                    description: "Only fills in answers when you say the correct meaning/reading. To mark as wrong, you must use the \"wrong\" command!",
                },
                description: "Only accepts a correct answer to prevent misheard answers by the speech recognizer.",
                pageFn: async (transcript:string, query:string) => {
                    console.log("Before submitting answer");
                    // TODO: only press button if it's still on the right item, otherwise sometimes we submit the same answer twice (skips next answer -- potentially gets wrong answer when lightning mode is on?)
                    Plugin.submitAnswer(query);
                    // wait for the next to load so chaining can happen
                    return await PluginBase.util.sleep(500);
                }
            },
            {
                name: 'Skip',
                description: "Marks the current item as correct. In case you know the item, but the speech recognizer picks it up incorrectly, you can use this command to mark it as correct.",
                match: ['skip', 'correct'],
                delay: [1000, 0],
                pageFn: async () => {
                    Plugin.submitAnswer(Plugin.getCorrect());
                }
            },
            {
                name: 'Wrong',
                description: "Saying a wrong answer will not auto-fantasically get marked as wrong because sometimes the speech recognizer is really silly. But in case *you* are the silly one, be honest and say \"wrong\" so you can learn, silly.",
                match: ['wrong'],
                pageFn: async () => {
                    if (Plugin.curQType === 'meaning') {
                        Plugin.submitAnswer('I am so silly');
                    } else {
                        Plugin.submitAnswer('あああ');
                    }
                }
            },
            {
                name: "Next",
                description: "Go to the next review item (only works after answering).",
                match: 'next',
                // "external apperance" would trigger next
                delay: 200,
                pageFn: async () => {
                    document.querySelector<HTMLButtonElement>('#answer-form form button').click();
                }
            },
            {
                name: 'Info',
                description: "Open the info for the entry",
                match: ['show info', 'info', 'information'],
                pageFn: async () => {
                    document.querySelector<HTMLButtonElement>('#option-item-info').click();
                }
            },
            {
                name: 'Show All Info',
                description: "Open all the info for the current entry",
                match: ['more info', 'show all info', 'show all information'],
                pageFn: async () => {
                    document.querySelector<HTMLButtonElement>('#all-info').click();
                }
            },
            {
                name: 'Wrap Up',
                description: "Do only 10 more items in WK.",
                match: ['wrap up', 'finish up', 'last 10'],
                pageFn: async () => {
                    document.querySelector<HTMLButtonElement>('#option-wrap-up').click();
                }
            },
            {
                name: 'Back',
                description: "Override back navigation so it doesn't happen by mistake in WaniKani",
                match: ['back'],
                delay: 500,
                nice: 'Say "Go back" if you really meant to leave this WaniKani review session.',
            },
        ],
    }
    );
}
