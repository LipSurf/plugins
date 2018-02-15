define("constants", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DEBUG = true;
    exports.ON_ICON = "assets/icon-on-128.png";
    exports.OFF_ICON = "assets/icon-off-128.png";
    exports.ORDINAL_CMD_DELAY = 500;
    exports.COOLDOWN_TIME = 900;
    exports.FINAL_COOLDOWN_TIME = 2200;
    exports.CONFIDENCE_THRESHOLD = 0;
    exports.ORDINALS_TO_DIGITS = {
        "first": 1,
        "1st": 1,
        "i": 1,
        "second": 2,
        "2nd": 2,
        "ii": 2,
        "third": 3,
        "3rd": 3,
        "iii": 3,
        "fourth": 4,
        "forth": 4,
        "4th": 4,
        "iv": 4,
        "fifth": 5,
        "fit": 5,
        "5th": 5,
        "v": 5,
        "sixth": 6,
        "sex": 6,
        "6th": 6,
        "vi": 6,
        "seventh": 7,
        "7th": 7,
        "vii": 7,
        "eigth": 8,
        "8th": 8,
        "viii": 8,
        "ninth": 9,
        "9th": 9,
        "ix": 9,
        "tenth": 10,
        "10th": 10,
        "x": 10,
        "eleventh": 11,
        "11th": 11,
        "xi": 11,
        "twelfe": 12,
        "twelve": 12,
        "12th": 12,
        "xii": 12,
        "thirteenth": 13,
        "13th": 13,
        "xiii": 13,
        "fourteenth": 14,
        "14th": 14,
        "fourteen": 14,
        "xiv": 14,
        "fifteenth": 15,
        "15th": 15,
        "xv": 15,
        "sixteenth": 16,
        "16th": 16,
        "xvi": 16,
        "seventeenth": 17,
        "17th": 17,
        "xvii": 17,
        "eighteenth": 18,
        "18th": 18,
        "xviii": 18,
        "nineteenth": 19,
        "19th": 19,
        "xix": 19,
        "twentieth": 20,
        "20th": 20,
        "xx": 20,
        "twenty-first": 21,
        "21st": 21,
        "xxi": 21,
        "twenty-second": 22,
        "22nd": 22,
        "xxii": 22,
        "twenty-third": 23,
        "23rd": 23,
        "xxiii": 23,
        "twenty-fourth": 24,
        "24th": 24,
        "xxiv": 24,
        "twenty-fifth": 25,
        "25th": 25,
        "xxv": 25,
        "twenty-sixth": 26,
        "26th": 26,
        "xxvi": 26,
        "twenty-seventh": 27,
        "27th": 27,
        "xxvii": 27,
        "twenty-eighth": 28,
        "28th": 28,
        "xxviii": 28,
        "twenty-ninth": 29,
        "29th": 29,
        "xxix": 29,
        "thirtieth": 30,
        "30th": 30,
        "xxx": 30,
        "thirty-first": 31,
        "31st": 31,
        "xxxi": 31,
        "thirty-second": 32,
        "32nd": 32,
        "xxxii": 32,
        "thirty-third": 33,
        "33rd": 33,
        "xxxiii": 33,
        "thirty-fourth": 34,
        "34th": 34,
        "xxxiv": 34,
        "thirty-fifth": 35,
        "35th": 35,
        "xxxv": 35,
        "thirty-sixth": 36,
        "36th": 36,
        "xxxvi": 36,
        "thirty-seventh": 37,
        "37th": 37,
        "xxxvii": 37,
        "thirty-eighth": 38,
        "38th": 38,
        "xxxviii": 38,
        "thirty-ninth": 39,
        "39th": 39,
        "xxxix": 39,
        "fortieth": 40,
        "40th": 40,
        "xl": 40,
        "forty-first": 41,
        "41st": 41,
        "xli": 41,
        "forty-second": 42,
        "42nd": 42,
        "xlii": 42,
        "forty-third": 43,
        "43rd": 43,
        "xliii": 43,
        "forty-fourth": 44,
        "44th": 44,
        "xliv": 44,
        "forty-fifth": 45,
        "45th": 45,
        "xlv": 45,
        "forty-sixth": 46,
        "46th": 46,
        "xlvi": 46,
        "forty-seventh": 47,
        "47th": 47,
        "xlvii": 47,
        "forty-eighth": 48,
        "48th": 48,
        "xlviii": 48,
        "forty-ninth": 49,
        "49th": 49,
        "xlix": 49,
        "fiftieth": 50,
        "50th": 50,
        "l": 50,
        "fifty-first": 51,
        "51st": 51,
        "li": 51,
        "fifty-second": 52,
        "52nd": 52,
        "lii": 52,
        "fifty-third": 53,
        "53rd": 53,
        "liii": 53,
        "fifty-fourth": 54,
        "54th": 54,
        "liv": 54,
        "fifty-fifth": 55,
        "55th": 55,
        "lv": 55,
        "fifty-sixth": 56,
        "56th": 56,
        "lvi": 56,
        "fifty-seventh": 57,
        "57th": 57,
        "lvii": 57,
        "fifty-eighth": 58,
        "58th": 58,
        "lviii": 58,
        "fifty-ninth": 59,
        "59th": 59,
        "lix": 59,
        "sixtieth": 60,
        "60th": 60,
        "lx": 60,
        "sixty-first": 61,
        "61st": 61,
        "lxi": 61,
        "sixty-second": 62,
        "62nd": 62,
        "lxii": 62,
        "sixty-third": 63,
        "63rd": 63,
        "lxiii": 63,
        "sixty-fourth": 64,
        "64th": 64,
        "lxiv": 64,
        "sixty-fifth": 65,
        "65th": 65,
        "lxv": 65,
        "sixty-sixth": 66,
        "66th": 66,
        "lxvi": 66,
        "sixty-seventh": 67,
        "67th": 67,
        "lxvii": 67,
        "sixty-eighth": 68,
        "68th": 68,
        "lxviii": 68,
        "sixty-ninth": 69,
        "69th": 69,
        "lxix": 69,
        "seventieth": 70,
        "70th": 70,
        "lxx": 70,
        "seventy-first": 71,
        "71st": 71,
        "lxxi": 71,
        "seventy-second": 72,
        "72nd": 72,
        "lxxii": 72,
        "seventy-third": 73,
        "73rd": 73,
        "lxxiii": 73,
        "seventy-fourth": 74,
        "74th": 74,
        "lxxiv": 74,
        "seventy-fifth": 75,
        "75th": 75,
        "lxxv": 75,
        "seventy-sixth": 76,
        "76th": 76,
        "lxxvi": 76,
        "seventy-seventh": 77,
        "77th": 77,
        "lxxvii": 77,
        "seventy-eighth": 78,
        "78th": 78,
        "lxxviii": 78,
        "seventy-ninth": 79,
        "79th": 79,
        "lxxix": 79,
        "eightieth": 80,
        "80th": 80,
        "lxxx": 80,
        "eighty-first": 81,
        "81st": 81,
        "lxxxi": 81,
        "eighty-second": 82,
        "82nd": 82,
        "lxxxii": 82,
        "eighty-third": 83,
        "83rd": 83,
        "lxxxiii": 83,
        "eighty-fourth": 84,
        "84th": 84,
        "lxxxiv": 84,
        "eighty-fifth": 85,
        "85th": 85,
        "lxxxv": 85,
        "eighty-sixth": 86,
        "86th": 86,
        "lxxxvi": 86,
        "eighty-seventh": 87,
        "87th": 87,
        "lxxxvii": 87,
        "eighty-eighth": 88,
        "88th": 88,
        "lxxxviii": 88,
        "eighty-ninth": 89,
        "89th": 89,
        "lxxxix": 89,
        "ninetieth": 90,
        "90th": 90,
        "xc": 90,
        "ninety-first": 91,
        "91st": 91,
        "xci": 91,
        "ninety-second": 92,
        "92nd": 92,
        "xcii": 92,
        "ninety-third": 93,
        "93rd": 93,
        "xciii": 93,
        "ninety-fourth": 94,
        "94th": 94,
        "xciv": 94,
        "ninety-fifth": 95,
        "95th": 95,
        "xcv": 95,
        "ninety-sixth": 96,
        "96th": 96,
        "xcvi": 96,
        "ninety-seventh": 97,
        "97th": 97,
        "xcvii": 97,
        "ninety-eighth": 98,
        "98th": 98,
        "xcviii": 98,
        "ninety-ninth": 99,
        "99th": 99,
        "xcix": 99,
        "one hundredth": 100,
        "100th": 100,
    };
    exports.NUMBERS_TO_DIGITS = {
        "1": 1,
        "one": 1,
        "2": 2,
        "to": 2,
        "too": 2,
        "two": 2,
        "3": 3,
        "three": 3,
        "4": 4,
        "four": 4,
        "5": 5,
        "five": 5,
        "6": 6,
        "six": 6,
        "7": 7,
        "seven": 7,
        "8": 8,
        "eight": 8,
        "9": 9,
        "nine": 9,
        "10": 10,
        "ten": 10,
        "11": 11,
        "eleven": 11,
        "12": 12,
        "twelve": 12,
        "13": 13,
        "thirteen": 13,
        "14": 14,
        "fourteen": 14,
        "15": 15,
        "fifteen": 15,
        "16": 16,
        "sixteen": 16,
        "17": 17,
        "seventeen": 17,
        "18": 18,
        "eighteen": 18,
        "19": 19,
        "nineteen": 19,
        "20": 20,
        "twenty": 20,
        "21": 21,
        "twenty-one": 21,
        "22": 22,
        "twenty-two": 22,
        "23": 23,
        "twenty-three": 23,
        "24": 24,
        "twenty-four": 24,
        "25": 25,
        "twenty-five": 25,
        "26": 26,
        "twenty-six": 26,
        "27": 27,
        "twenty-seven": 27,
        "28": 28,
        "twenty-eight": 28,
        "29": 29,
        "twenty-nine": 29,
        "30": 30,
        "thirty": 30,
        "31": 31,
        "thirty-one": 31,
        "32": 32,
        "thirty-two": 32,
        "33": 33,
        "thirty-three": 33,
        "34": 34,
        "thirty-four": 34,
        "35": 35,
        "thirty-five": 35,
        "36": 36,
        "thirty-six": 36,
        "37": 37,
        "thirty-seven": 37,
        "38": 38,
        "thirty-eight": 38,
        "39": 39,
        "thirty-nine": 39,
        "40": 40,
        "forty": 40,
        "41": 41,
        "forty-one": 41,
        "42": 42,
        "forty-two": 42,
        "43": 43,
        "forty-three": 43,
        "44": 44,
        "forty-four": 44,
        "45": 45,
        "forty-five": 45,
        "46": 46,
        "forty-six": 46,
        "47": 47,
        "forty-seven": 47,
        "48": 48,
        "forty-eight": 48,
        "49": 49,
        "forty-nine": 49,
        "50": 50,
        "fifty": 50,
        "51": 51,
        "fifty-one": 51,
        "52": 52,
        "fifty-two": 52,
        "53": 53,
        "fifty-three": 53,
        "54": 54,
        "fifty-four": 54,
        "55": 55,
        "fifty-five": 55,
        "56": 56,
        "fifty-six": 56,
        "57": 57,
        "fifty-seven": 57,
        "58": 58,
        "fifty-eight": 58,
        "59": 59,
        "fifty-nine": 59,
        "60": 60,
        "sixty": 60,
        "61": 61,
        "sixty-one": 61,
        "62": 62,
        "sixty-two": 62,
        "63": 63,
        "sixty-three": 63,
        "64": 64,
        "sixty-four": 64,
        "65": 65,
        "sixty-five": 65,
        "66": 66,
        "sixty-six": 66,
        "67": 67,
        "sixty-seven": 67,
        "68": 68,
        "sixty-eight": 68,
        "69": 69,
        "sixty-nine": 69,
        "70": 70,
        "seventy": 70,
        "71": 71,
        "seventy-one": 71,
        "72": 72,
        "seventy-two": 72,
        "73": 73,
        "seventy-three": 73,
        "74": 74,
        "seventy-four": 74,
        "75": 75,
        "seventy-five": 75,
        "76": 76,
        "seventy-six": 76,
        "77": 77,
        "seventy-seven": 77,
        "78": 78,
        "seventy-eight": 78,
        "79": 79,
        "seventy-nine": 79,
        "80": 80,
        "eighty": 80,
        "81": 81,
        "eighty-one": 81,
        "82": 82,
        "eighty-two": 82,
        "83": 83,
        "eighty-three": 83,
        "84": 84,
        "eighty-four": 84,
        "85": 85,
        "eighty-five": 85,
        "86": 86,
        "eighty-six": 86,
        "87": 87,
        "eighty-seven": 87,
        "88": 88,
        "eighty-eight": 88,
        "89": 89,
        "eighty-nine": 89,
        "90": 90,
        "ninety": 90,
        "91": 91,
        "ninety-one": 91,
        "92": 92,
        "ninety-two": 92,
        "93": 93,
        "ninety-three": 93,
        "94": 94,
        "ninety-four": 94,
        "95": 95,
        "ninety-five": 95,
        "96": 96,
        "ninety-six": 96,
        "97": 97,
        "ninety-seven": 97,
        "98": 98,
        "ninety-eight": 98,
        "99": 99,
        "ninety-nine": 99,
        "100": 100,
        "one-hundred": 100,
        "hundred": 100,
        "one hundred": 100,
    };
    exports.HOMOPHONES = {
        'stirred': 'third',
        'for': 'four',
        'aladdin': 'eleven',
    };
});
define("util", ["require", "exports", "constants"], function (require, exports, CT) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Detector {
        constructor(sentinelFn, detectCb, interval, maxChecks) {
            this.checks = 0;
            this.maxChecks = maxChecks;
            this.sentinelFn = sentinelFn;
            this.detectCb = detectCb;
            this.check();
            this.intervalId = window.setInterval(() => {
                this.check();
            }, interval);
        }
        destroy() {
            clearInterval(this.intervalId);
        }
        check() {
            this.checks += 1;
            new Promise(this.sentinelFn).then((x) => {
                console.log(`calling check ${this.checks} ${new Date()}`);
                clearInterval(this.intervalId);
                this.detectCb(x);
            }, () => { });
            if (typeof (this.maxChecks) !== 'undefined' && this.checks > this.maxChecks) {
                clearInterval(this.intervalId);
            }
        }
    }
    exports.Detector = Detector;
    function _queryActiveTab(cb) {
        if (CT.DEBUG) {
            chrome.tabs.query({
                windowType: "normal"
            }, function (tabs) {
                let mostActive;
                for (let tab of tabs) {
                    if (tab.url.startsWith('http')) {
                        if (tab.active) {
                            return cb(tab);
                        }
                        mostActive = tab;
                    }
                }
                return cb(mostActive);
            });
        }
        else {
            chrome.tabs.query({
                active: true,
                currentWindow: true,
                windowType: "normal"
            }, function (tabs) {
                if (tabs.length > 0) {
                    return cb(tabs[0]);
                }
                else {
                }
            });
        }
    }
    function queryActiveTab(cb) {
        new Detector((resolve, reject) => {
            _queryActiveTab((tab) => {
                if (tab) {
                    console.log(`tabs ${tab}`);
                    resolve(tab);
                }
                else {
                    reject();
                }
            });
        }, cb, 200, 2);
    }
    exports.queryActiveTab = queryActiveTab;
    const customArgumentsToken = Symbol("__ES6-PROMISIFY--CUSTOM-ARGUMENTS__");
    function promisify(original, withError = false) {
        if (typeof original !== "function") {
            throw new TypeError("Argument to promisify must be a function");
        }
        const argumentNames = original[customArgumentsToken];
        if (typeof Promise !== "function") {
            throw new Error("No Promise implementation found; do you need a polyfill?");
        }
        return function (...args) {
            return new Promise((resolve, reject) => {
                args.push(function callback() {
                    let values = [];
                    for (var i = withError ? 1 : 0; i < arguments.length; i++) {
                        values.push(arguments[i]);
                    }
                    if (withError && arguments[0]) {
                        return reject(arguments[0]);
                    }
                    if (values.length === 1 || !argumentNames) {
                        return resolve(values[0]);
                    }
                    let o;
                    values.forEach((value, index) => {
                        const name = argumentNames[index];
                        if (name) {
                            o[name] = value;
                        }
                    });
                    resolve(o);
                });
                original.call(this, ...args);
            });
        };
    }
    exports.promisify = promisify;
});
define("store", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Store {
        constructor() {
            this.listeners = [];
        }
        get plugins() {
            return this._plugins;
        }
        set plugins(plugins) {
            this._plugins = plugins;
            this.listeners.forEach((fn) => fn(this._plugins));
        }
        subscribe(fn) {
            this.listeners.push(fn);
        }
    }
    exports.Store = Store;
    exports.store = new Store();
});
define("recognizer", ["require", "exports", "constants", "store", "lodash"], function (require, exports, CT, store_1, _) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const { webkitSpeechRecognition } = window;
    class Recognizer {
        constructor() {
            this.recognizerKilled = false;
            this.lastFinalTime = 0;
            this.lastNonFinalCmdExecutedTime = 0;
            this.lastNonFinalCmdExecuted = null;
            this._syn_keys = [];
            this._syn_vals = [];
            store_1.store.subscribe((updatedStore) => {
                let homophones = _.flatten(updatedStore.map((plugin) => plugin.homophones.filter((homo) => homo.enabled)));
                this._syn_keys = homophones.map((homo) => new RegExp(`\\b${homo.source}\\b`));
                this._syn_vals = homophones.map((homo) => homo.destination);
            });
        }
        start(cmdRecognizedCb) {
            return new Promise((resolve, reject) => {
                this.cmdRecognizedCb = cmdRecognizedCb;
                this.recognition = new webkitSpeechRecognition();
                this.recognition.continuous = true;
                this.recognition.interimResults = true;
                this.recognition.lang = 'en-US';
                this.recognition.maxAlternatives = 1;
                this.recognition.start();
                this.recognition.onresult = (event) => {
                    var lastE = event.results[event.results.length - 1];
                    console.dir(event);
                    this.handleTranscript(lastE[0].transcript.trim().toLowerCase(), lastE.isFinal, lastE[0].confidence);
                    this.recognizerKilled = false;
                };
                this.recognition.onerror = (event) => {
                    if (event.error === 'not-allowed') {
                        this.recognizerKilled = true;
                    }
                    else if (event.error == 'network') {
                    }
                    else if (event.error !== 'no-speech') {
                        console.error(`unhandled error: ${event.error}`);
                    }
                };
                this.recognition.onnomatch = (event) => {
                    console.error(`No match! ${event}`);
                };
                this.recognition.onend = () => {
                    if (!this.recognizerKilled) {
                        console.log("ended. Restarting: ");
                        this.recognition.start();
                    }
                };
            });
        }
        shutdown() {
            try {
                this.recognition.stop();
            }
            catch (e) { }
            try {
                this.recognition.onresult = null;
                this.recognition.onerror = null;
                this.recognition.onend = null;
            }
            catch (e) { }
            this.recognition = null;
        }
        getCmdForUserInput(input) {
            let processedInput = this.expandSynonyms(input);
            for (let g = 0; g < store_1.store.plugins.length; g++) {
                for (let f = 0; f < store_1.store.plugins[g].commands.length; f++) {
                    let curCmd = store_1.store.plugins[g].commands[f];
                    let out;
                    let matchPatterns;
                    let matchPatternIndex;
                    if (typeof curCmd.match === 'function') {
                        out = curCmd.match(processedInput);
                    }
                    else {
                        if (typeof curCmd.match === 'string') {
                            matchPatterns = [curCmd.match];
                        }
                        else {
                            matchPatterns = curCmd.match;
                        }
                        for (matchPatternIndex = 0; matchPatternIndex < matchPatterns.length; matchPatternIndex++) {
                            let tokens = this.tokenizeMatchPattern(matchPatterns[matchPatternIndex]);
                            let ords = [];
                            let n = 0;
                            let nextIsOrdinal = false;
                            let inputSlice = processedInput;
                            for (; n < tokens.length || nextIsOrdinal; n++) {
                                let token = tokens[n];
                                if (token == '#') {
                                    nextIsOrdinal = true;
                                }
                                else {
                                    let matchPos = token ? inputSlice.indexOf(token) : inputSlice.length;
                                    if (matchPos == -1) {
                                        break;
                                    }
                                    else if (nextIsOrdinal) {
                                        nextIsOrdinal = false;
                                        try {
                                            ords.push(this.ordinalOrNumberToDigit(inputSlice.substring(0, matchPos)));
                                        }
                                        catch (e) {
                                            break;
                                        }
                                    }
                                    inputSlice = inputSlice.substring(matchPos + (token ? token.length : 0), inputSlice.length);
                                }
                            }
                            if (inputSlice.trim() === '') {
                                out = ords;
                                break;
                            }
                        }
                    }
                    if (out) {
                        let delay = null;
                        if (curCmd._ordinalMatch) {
                            delay = CT.ORDINAL_CMD_DELAY;
                        }
                        else if (curCmd.delay && typeof curCmd.delay === 'object') {
                            delay = curCmd.delay[matchPatternIndex];
                        }
                        else if (typeof curCmd.delay !== 'undefined') {
                            delay = curCmd.delay;
                        }
                        return {
                            cmdName: curCmd.name,
                            cmdPluginName: store_1.store.plugins[g].name,
                            matchOutput: out,
                            delay: delay,
                            nice: curCmd.nice,
                            fn: curCmd.runOnPage
                        };
                    }
                }
            }
            return {};
        }
        tokenizeMatchPattern(matchStr) {
            let ret = [];
            for (let i = 0; i < matchStr.length; i++) {
                if (matchStr[i] === '#') {
                    ret.push('#');
                    if (i != matchStr.length - 1) {
                        ret.push('');
                    }
                }
                else {
                    if (ret.length === 0) {
                        ret.push('');
                    }
                    ret[ret.length - 1] += matchStr[i];
                }
            }
            return ret;
        }
        dedupe(input) {
            let existingWords = {};
            let processed = [];
            for (let word of input.split(' ')) {
                if (typeof existingWords[word] === 'undefined') {
                    processed.push(word);
                }
            }
            return processed.join(' ');
        }
        expandSynonyms(input) {
            for (let i = 0; i < this._syn_keys.length; i++) {
                input = input.replace(this._syn_keys[i], this._syn_vals[i]);
            }
            return input;
        }
        ordinalOrNumberToDigit(ordinal) {
            try {
                return CT.ORDINALS_TO_DIGITS[ordinal] || CT.NUMBERS_TO_DIGITS[ordinal];
            }
            catch (e) {
                console.debug(`Could not convert to number ${e}`);
            }
        }
        handleTranscript(transcript, isFinal, confidence) {
            let elapsedTime = +new Date() - this.lastNonFinalCmdExecutedTime;
            console.log(`elapsed time ${elapsedTime} ${CT.COOLDOWN_TIME} ${CT.CONFIDENCE_THRESHOLD}`);
            if (elapsedTime > CT.COOLDOWN_TIME) {
                if (confidence > CT.CONFIDENCE_THRESHOLD) {
                    var { cmdName, cmdPluginName, matchOutput, delay, nice, fn } = this.getCmdForUserInput(transcript);
                    var niceOutput = null;
                    let delayCmd;
                    console.log(`input: ${transcript}, matchOutput: ${matchOutput}, cmdName: ${cmdName}`);
                    if (cmdName) {
                        console.log(`isFinal: ${isFinal} lastNonFinalCmdExecuted: ${this.lastNonFinalCmdExecuted} cmdName: ${cmdName} lastFinalTime: ${this.lastFinalTime} `);
                        if (isFinal && this.lastNonFinalCmdExecuted && this.lastNonFinalCmdExecuted === cmdName && (+new Date() - this.lastFinalTime) > CT.FINAL_COOLDOWN_TIME) {
                            console.log("Junked dupe.");
                            return;
                        }
                        else if (typeof delayCmd !== 'undefined') {
                            clearTimeout(delayCmd);
                        }
                        delayCmd = window.setTimeout(() => {
                            if (typeof nice === 'string') {
                                niceOutput = nice;
                            }
                            else if (typeof nice === 'function') {
                                niceOutput = nice(matchOutput);
                            }
                            console.log(`running command ${cmdName} isFinal:${isFinal}`);
                            if (isFinal) {
                                this.lastFinalTime = +new Date();
                            }
                            else {
                                this.lastNonFinalCmdExecuted = cmdName;
                                this.lastNonFinalCmdExecutedTime = +new Date();
                            }
                            console.log(`transcript in closure ${transcript}`);
                            return this.cmdRecognizedCb({
                                cmdName: cmdName,
                                cmdPluginName: cmdPluginName,
                                cmdArgs: matchOutput,
                                text: niceOutput ? niceOutput : transcript,
                                isSuccess: true,
                            });
                        }, delay);
                        return this.cmdRecognizedCb({
                            text: transcript,
                            hold: true,
                        });
                    }
                    else {
                        return this.cmdRecognizedCb({
                            text: niceOutput ? niceOutput : transcript
                        });
                    }
                }
                if (isFinal && confidence <= CT.CONFIDENCE_THRESHOLD) {
                    return this.cmdRecognizedCb({
                        text: transcript,
                        isUnsure: true
                    });
                }
            }
        }
    }
    exports.Recognizer = Recognizer;
});
define("plugin-sandbox", ["require", "exports", "lodash"], function (require, exports, _) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class PluginSandbox {
        constructor() {
            this.privilegedCode = {};
        }
        addCommands(pluginName, commands) {
            this.privilegedCode[pluginName] = this.privilegedCode[pluginName] || {};
            this.privilegedCode = _.reduce(commands, (memo, runStr, name) => {
                memo[pluginName][name] = eval(runStr);
                return memo;
            }, this.privilegedCode);
        }
        run(cmdName, cmdPluginName, cmdArgs) {
            if (this.privilegedCode[cmdPluginName] && this.privilegedCode[cmdPluginName][cmdName]) {
                return this.privilegedCode[cmdPluginName][cmdName].apply(this, cmdArgs);
            }
        }
    }
    exports.PluginSandbox = PluginSandbox;
});
define("preferences", ["require", "exports", "util", "lodash"], function (require, exports, util_1, _) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const DEFAULT_PREFERENCES = {
        plugins: [
            {
                name: 'Browser',
                version: '1.0.0',
                enabled: true,
                expanded: true,
                disabledCommands: [],
                disabledHomophones: []
            },
            {
                name: 'Reddit',
                version: '1.0.0',
                enabled: true,
                expanded: true,
                disabledCommands: [],
                disabledHomophones: []
            },
        ],
        showLiveText: true
    };
    async function save(preferences) {
        return util_1.promisify(chrome.storage.sync.set)(preferences);
    }
    exports.save = save;
    async function load() {
        let loaded = await util_1.promisify(chrome.storage.sync.get)(null);
        if (!(_.get(loaded, 'plugins.length', 0) > 0)) {
            loaded = DEFAULT_PREFERENCES;
        }
        return loaded;
    }
    exports.load = load;
});
define("plugin-manager", ["require", "exports", "lodash", "store", "preferences", "util"], function (require, exports, _, store_2, Preferences, util_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class PluginManager {
        constructor(pluginSandbox) {
            this.pluginSandbox = pluginSandbox;
            this.loadPluginStoreFromSyncStorage().then((loadedStorePlugin) => store_2.store.plugins = loadedStorePlugin);
        }
        async loadCommandCodeIntoPage(tabId, url) {
            store_2.store.plugins.forEach((plugin) => {
                if (_.reduce(plugin.match, (memo, matchPattern) => matchPattern.test(url) || memo, true)) {
                    util_2.promisify(chrome.tabs.executeScript)(tabId, { code: plugin.cs, runAt: "document_start" });
                }
            });
        }
        fetchPluginCode(name) {
            return new Promise((resolve, reject) => {
                var cmdFn;
                var request = new XMLHttpRequest();
                request.open('GET', chrome.runtime.getURL(`plugins/${name.toLowerCase()}.js`), true);
                request.onload = function () {
                    if (request.status >= 200 && request.status < 400) {
                        let module = { exports: {} };
                        eval(`${request.responseText}`);
                        cmdFn = module.exports;
                    }
                    else {
                    }
                    resolve(cmdFn);
                };
                request.onerror = function () {
                };
                request.send();
            });
        }
        async loadPluginStoreFromSyncStorage() {
            let pluginPrefs = (await Preferences.load()).plugins;
            let pluginResolvers = pluginPrefs.map((plugin) => this.fetchPluginCode(plugin.name));
            let resolvedPlugins = await Promise.all(pluginResolvers);
            return resolvedPlugins.map((resolvedPlugin) => {
                return Object.assign({ enabled: true, commands: resolvedPlugin.commands.map((cmd) => {
                        return Object.assign({ delay: _.flatten([cmd.delay]), enabled: true, runOnPage: cmd.runOnPage ? cmd.runOnPage.toString() : '() => null', match: typeof cmd.match === 'function' ? cmd.match : _.flatten([cmd.match]), _ordinalMatch: false }, _.pick(cmd, 'name', 'description', 'run', 'nice'));
                    }), cs: `${resolvedPlugin.pageInit ? '(' + resolvedPlugin.pageInit.toString() + ')();' : ''}commands['${resolvedPlugin.name}'] = {}; ${resolvedPlugin.commands.map((c) => `commands['${resolvedPlugin.name}']['${c.name}'] = ${c.runOnPage};`).join(';')}`, homophones: Object.keys(resolvedPlugin.homophones).map((key, index) => {
                        return {
                            enabled: true,
                            source: key,
                            destination: resolvedPlugin.homophones[key],
                        };
                    }), match: _.flatten([resolvedPlugin.match]) }, _.pick(resolvedPlugin, 'name'));
            });
        }
    }
    exports.PluginManager = PluginManager;
});
define("main", ["require", "exports", "lodash", "constants", "util", "recognizer", "plugin-manager", "plugin-sandbox"], function (require, exports, _, CT, Util, recognizer_1, plugin_manager_1, plugin_sandbox_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var activated = false;
    var audible = false;
    var permissionDetector;
    var currentActiveTabId;
    var needsPermission = false;
    var delayCmd;
    var recg = new recognizer_1.Recognizer();
    var ps = new plugin_sandbox_1.PluginSandbox();
    var pm = new plugin_manager_1.PluginManager(ps);
    chrome.storage.local.set({ 'activated': false });
    function cmdRecognizedCb(request) {
        if (request.cmdName) {
            let cmdPart = _.pick(request, ['cmdName', 'cmdPluginName', 'cmdArgs']);
            ps.run(request.cmdName, request.cmdPluginName, request.cmdArgs);
            sendMsgToActiveTab(cmdPart);
            sendMsgToActiveTab({
                liveText: _.pick(request, ['text', 'isSuccess'])
            });
        }
        else {
            sendMsgToActiveTab({
                liveText: request
            });
        }
    }
    function sendMsgToActiveTab(request) {
        Util.queryActiveTab(function (tab) {
            chrome.tabs.sendMessage(tab.id, request);
        });
    }
    var InterferenceAudioDetector = (function () {
        let _timerId = null;
        function _destroy() {
            try {
                clearTimeout(_timerId);
            }
            catch (e) {
                console.error(`error clearing interference audio detector ${e}`);
            }
        }
        return {
            init: function () {
                _destroy();
                _timerId = setInterval(function () {
                    if (audible) {
                        chrome.tabs.query({
                            audible: true
                        }, function (tabs) {
                            if (!tabs || tabs.length === 0) {
                                audible = false;
                                console.warn(`audible ${audible}`);
                            }
                        });
                    }
                    else {
                        chrome.tabs.query({
                            audible: true
                        }, function (tabs) {
                            if (tabs && tabs.length > 0) {
                                audible = true;
                                console.warn(`audible ${audible}`);
                            }
                        });
                    }
                }, 3000);
            },
            destroy: () => {
                _destroy();
            }
        };
    })();
    function needsPermissionCb() {
        chrome.runtime.openOptionsPage();
    }
    function toggleActivated(_activated = true) {
        activated = _activated;
        chrome.storage.local.set({ 'activated': activated });
        chrome.browserAction.setIcon({
            path: activated ? CT.ON_ICON : CT.OFF_ICON
        });
        sendMsgToActiveTab({
            'toggleActivated': activated
        });
        if (activated) {
            recg.start(cmdRecognizedCb);
            InterferenceAudioDetector.init();
        }
        else {
            recg.shutdown();
            InterferenceAudioDetector.destroy();
        }
    }
    chrome.browserAction.setIcon({
        path: activated ? CT.ON_ICON : CT.OFF_ICON
    });
    chrome.browserAction.onClicked.addListener(function (tab) {
        if (activated) {
            toggleActivated(false);
        }
        else {
            navigator.mediaDevices.getUserMedia({ audio: true }).then(() => {
                console.log("easy on");
                toggleActivated();
            }, () => {
                needsPermissionCb();
                if (!permissionDetector) {
                    permissionDetector = new Util.Detector((resolve, reject) => navigator.mediaDevices.getUserMedia({ audio: true })
                        .then((stream) => {
                        console.log("yep1");
                        if (typeof (stream) !== 'undefined') {
                            console.log("yep2");
                            resolve();
                        }
                        else {
                            reject();
                        }
                    }, function () {
                        reject();
                    }).catch(() => { }), toggleActivated, 1500, 15);
                }
            });
        }
    });
    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        if (request.bubbleDown) {
            Util.queryActiveTab(function (tab) {
                if (typeof request.bubbleDown.fullScreen !== 'undefined') {
                    console.log(`1. full screen`);
                    chrome.windows.update(tab.windowId, {
                        state: "fullscreen"
                    }, function (windowUpdated) {
                        this.fullscreen = true;
                    });
                }
                else if (typeof request.bubbleDown.unFullScreen !== 'undefined') {
                    console.log(`2. unfull screen`);
                    chrome.windows.update(tab.windowId, {
                        state: "maximized"
                    }, function (windowUpdated) {
                    });
                }
                chrome.tabs.sendMessage(tab.id, request, function (response) {
                    sendResponse(response);
                });
            });
        }
        else if (request.bubbleUp) {
            Util.queryActiveTab((tab) => {
                chrome.tabs.connect(tab.id, { name: 'getVideos' });
            });
        }
        else if (request === 'loadPlugins') {
            Util.queryActiveTab((tab) => {
                pm.loadCommandCodeIntoPage(tab.id, tab.url);
            });
        }
    });
});
