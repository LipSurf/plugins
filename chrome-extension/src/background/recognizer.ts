import * as CT from "../common/constants";
import { store } from "./store";
import * as _ from "lodash";
export interface IWindow extends Window {
    webkitSpeechRecognition: any;
}
const {webkitSpeechRecognition} : IWindow = <IWindow>window;

interface ICommand {
    cmdName: string,
    cmdPluginName: string,
    // what the match function returns -- if anything
    matchOutput,
    delay,
    niceTranscript,
    fn,
}

export class Recognizer {
    private recognition;
    private recognizerKilled: boolean = false;
    private cmdRecognizedCb;
    private lastFinalTime: number = 0;
    private lastNonFinalCmdExecutedTime: number = 0;
    private lastNonFinalCmdExecuted = null;
    private _syn_keys: RegExp[] = [];
    private _syn_vals: string[] = [];
    private delayCmd: number;

    constructor() {
        // outside functionality can update the commands list at any time
        store.subscribe((updatedStore) => {
            // TODO: currently flattens all the plugins homophones together -> do we want to
            let homophones = _.flatten(updatedStore.map((plugin) => plugin.homophones.filter((homo) => homo.enabled)));
            this._syn_keys = homophones.map((homo) => new RegExp(`\\b${homo.source}\\b`));
            this._syn_vals = homophones.map((homo) => homo.destination);
        });
    }

    start(cmdRecognizedCb: ((any) => void)) {
        // call this promise if starting the recognizer fails
        // we do this asynchronously because we don't know it failed
        // until we get a `onerror` event.
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
                this.handleTranscript(
                    lastE[0].transcript.trim().toLowerCase(),
                    lastE.isFinal,
                    lastE[0].confidence,
                );
                this.recognizerKilled = false;
            };

            // Error types:
            //  'no-speech'
            //  'network'
            //  'not-allowed
            this.recognition.onerror = (event) => {
                if (event.error === 'not-allowed') {
                    // TODO: throw an exception that stops the
                    // add-on
                    // throw "This should never happen";
                    this.recognizerKilled = true;
                } else if (event.error == 'network') {
                    // TODO: special error message
                } else if (event.error !== 'no-speech') {
                    console.error(`unhandled error: ${event.error}`);
                }
            };

            this.recognition.onnomatch = (event) => {
                console.error(`No match! ${event}`);
            };

            this.recognition.onend = () => {
                // don't restart in an infinite loop
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
        } catch (e) {}
        try {
            this.recognition.onresult = null;
            this.recognition.onerror = null;
            this.recognition.onend = null;
        } catch (e) {}
        this.recognition = null;
    }

    /* Return {
     *  matchOutput: the arguments to pass back to the command
     *}
     */
    private getCmdForUserInput(input): ICommand {
        // processedInput = dedupe(processedInput);
        let homophoneIterator = this.generateHomophones(input)
        for (let processedInput = homophoneIterator.next().value; processedInput; processedInput = homophoneIterator.next().value) {
            for (let g = 0; g < store.plugins.length; g++) {
                for (let f = 0; f < store.plugins[g].commands.length; f++) {
                    let curCmd = store.plugins[g].commands[f];
                    let out;
                    let matchPatterns;
                    let matchPatternIndex;
                    if (typeof curCmd.match === 'function') {
                        out = curCmd.match(processedInput);
                    } else {
                        if (typeof curCmd.match === 'string') {
                            matchPatterns = [curCmd.match];
                        } else {
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
                                } else {
                                    let matchPos = token ? inputSlice.indexOf(token) : inputSlice.length;
                                    if (matchPos == -1) {
                                        break;
                                    } else if (nextIsOrdinal) {
                                        nextIsOrdinal = false;
                                        try {
                                            ords.push(this.ordinalOrNumberToDigit(inputSlice.substring(0, matchPos)));
                                        } catch (e) {
                                            // not an ordinal
                                            break;
                                        }
                                    }
                                    inputSlice = inputSlice.substring(matchPos + (token ? token.length : 0), inputSlice.length);
                                }
                            }

                            if (inputSlice.trim() === '') {
                                // we have a match
                                out = ords;
                                break;
                            }

                        }
                    }
                    if (out) {
                        let delay:number = null;
                        if (curCmd._ordinalMatch) {
                            delay = CT.ORDINAL_CMD_DELAY;
                        } else if (curCmd.delay) {
                            delay = matchPatternIndex ? curCmd.delay[matchPatternIndex]: curCmd.delay[0];
                        }
                        return {
                            cmdName: curCmd.name,
                            cmdPluginName: store.plugins[g].name,
                            matchOutput: out,
                            niceTranscript: curCmd.nice ? (typeof curCmd.nice === 'string' ? curCmd.nice : curCmd.nice(processedInput)) : processedInput,
                            fn: curCmd.runOnPage,
                            delay,
                        };
                    }
                }
            }
        }
        return <ICommand>{};
    }


    //
    // > tokenizeMatchPattern('# hello')
    // ['#', ' hello']
    //
    // > tokenizeMatchPattern('hello #')
    // ['hello ', '#']
    //
    // > tokenizeMatchPattern('hello # there')
    // ['hello ', '#', ' there']
    //
    // > tokenizeMatchPattern('hello # there # my friend')
    // ['hello ', '#', ' there ', '#', ' my friend']
    //
    private tokenizeMatchPattern(matchStr) {
        let ret = [];
        for (let i = 0; i < matchStr.length; i++) {
            if (matchStr[i] === '#') {
                ret.push('#');
                if (i != matchStr.length - 1) {
                    ret.push('');
                }
            } else {
                if (ret.length === 0) {
                    ret.push('');
                }
                ret[ret.length - 1] += matchStr[i];
            }
        }
        return ret;
    }

    // Maybe we want to execute each command seperately? Like "down down" should
    // be two downs. If the user chains commands like "down up" then
    // maybe we should split and match the first valid part of the command?
    // Needs thought...
    private dedupe(input) {
        let existingWords = {};
        let processed = [];
        for (let word of input.split(' ')) {
            if (typeof existingWords[word] === 'undefined') {
                processed.push(word);
            }
        }
        return processed.join(' ');
    }


    private *generateHomophones(beforeInput) {
        let afterInput;
        // first yield the original
        yield beforeInput;
        for (let i = 0; i < this._syn_keys.length; i++) {
            afterInput = beforeInput.replace(this._syn_keys[i], this._syn_vals[i]);
            if (afterInput !== beforeInput)
                beforeInput = afterInput;
                yield afterInput;
        }
    }


    // prefix or suffix match
    private ordinalOrNumberToDigit(ordinal) {
        try {
            return CT.ORDINALS_TO_DIGITS[ordinal] || CT.NUMBERS_TO_DIGITS[ordinal];
        } catch (e) {
            console.debug(`Could not convert to number ${e}`);
        }
    }


    handleTranscript(transcript: string, isFinal: boolean, confidence: Number) {
        let elapsedTime = +new Date() - this.lastNonFinalCmdExecutedTime;
        console.log(`elapsed time ${elapsedTime} ${CT.COOLDOWN_TIME} ${CT.CONFIDENCE_THRESHOLD}`);
        if (elapsedTime > CT.COOLDOWN_TIME) {
            if (confidence > CT.CONFIDENCE_THRESHOLD) {
                // console.log(`start time ${+new Date()}`);
                var { cmdName, cmdPluginName, matchOutput, delay, niceTranscript, fn } = this.getCmdForUserInput(transcript);
                var niceOutput = null;

                console.log(`delay: ${delay}, input: ${transcript}, matchOutput: ${matchOutput}, cmdName: ${cmdName}`);
                // console.log(`end time ${+new Date()}`);
                if (cmdName) {
                    // prevent dupe commands when cmd is said once, but finalized much later by speech recg.
                    console.log(`isFinal: ${isFinal} lastNonFinalCmdExecuted: ${this.lastNonFinalCmdExecuted} cmdName: ${cmdName} lastFinalTime: ${this.lastFinalTime} `);
                    if (isFinal && this.lastNonFinalCmdExecuted && this.lastNonFinalCmdExecuted === cmdName && (+new Date() - this.lastFinalTime) > CT.FINAL_COOLDOWN_TIME) {
                        console.log("Junked dupe.");
                        return;
                    }
                    window.clearTimeout(this.delayCmd);

                    this.delayCmd = window.setTimeout(() => {
                        console.log(`running command ${cmdName} isFinal:${isFinal}`);
                        if (isFinal) {
                            this.lastFinalTime = +new Date();
                        } else {
                            this.lastNonFinalCmdExecuted = cmdName;
                            this.lastNonFinalCmdExecutedTime = +new Date();
                        }

                        console.log(`transcript in closure ${transcript}`);
                        return this.cmdRecognizedCb({
                            cmdName: cmdName,
                            cmdPluginName: cmdPluginName,
                            cmdArgs: matchOutput,
                            text: niceTranscript,
                            isSuccess: true,
                        });
                    }, delay);
                    return this.cmdRecognizedCb({
                        text: transcript,
                        hold: true,
                    });
                } else {
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
