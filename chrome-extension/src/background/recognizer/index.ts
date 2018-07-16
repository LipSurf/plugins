import {
    ORDINAL_CMD_DELAY, CONFIDENCE_THRESHOLD,
} from "../../common/constants";
import { Store, StoreSynced, } from "../store";
import { find, pick, identity } from "lodash";
import { ResettableTimeout, instanceOfDynamicMatch, MissingLangPackError } from "../../common/util";

import * as LANGS from './langs';


interface IRecgCommand extends IGlobalCommand, INiceCommand {
    // computed property that describes if match strings have ordinal
    // placeholders and we should wait a bit of extra time to let
    // them get captured before executing
    name: string;
    // undefined for dynamic match because those are injected into page
    match: string[] | undefined;
    ordinalMatch: boolean;
    delay?: number[];
}

// transformations of the plugin store go here
interface IPluginRecgStore {
    id: string;
    commands: IRecgCommand[];
    match: RegExp[];
    synKeys: RegExp[];
    synVals: string[];
}

interface IMatchCommand {
    cmdName: string;
    cmdPluginId: string;
    // what the match function returns -- if anything
    matchOutput: any[];
    // the actual delay being used (after matching, so not an array)
    delay: number;
    niceTranscript: string;
}

export type IRecognizedCallback = ILiveTextParcel | ICmdParcel;


export class Recognizer extends StoreSynced {
    private recognition;
    private recognizerKilled: boolean = false;
    private cmdRecognizedCb: (cb: IRecognizedCallback) => Promise<void>;
    private matchedCmdsForIndex = [];
    private lastFinalIndex: number;
    // we index by transcript resultIndex in case a delayed cmd is pending and new voice
    // recg comes in
    private delayCmds: { [id: number]: ResettableTimeout[] } = {};
    private pluginsRecgStore: IPluginRecgStore[];
    private curActiveTabUrl: string;
    // for global homonyms
    private synKeys: RegExp[];
    private synVals: string[];
    private lang: LanguageCode;
    private langRecg: ILanguageRecg;

    constructor(store: Store,
        onUrlUpdate: ((cb: ((url: string) => void)) => void),
        private queryActiveTab: () => Promise<chrome.tabs.Tab>,
        private sendMsgToTab: (tabId: number, object) => Promise<string[]>,
        private speechRecognizer,
    ) {
        super(store);
        onUrlUpdate((url) => {
            this.curActiveTabUrl = url;
        });
    }

    protected async storeUpdated(newOptions: IOptions) {
        // language-specific recognizer functionality
        this.langRecg = new LANGS[newOptions.language.substr(0, 2)]();
        try {
            await this.langRecg.init();
        } catch(e) {
            if (e instanceof MissingLangPackError) {
                if (!newOptions.missingLangPack) {
                    this.store.save({missingLangPack: true, problem: true});
                } else if (newOptions.confirmLangPack && !newOptions.busyDownloading) {
                    this.store.save({busyDownloading: true});
                    await this.langRecg.getExtraData();
                    this.store.save({busyDownloading: false, confirmLangPack: null, missingLangPack: false, problem: false});
                } 
            }
        }
        let homoKeys = Object.keys(this.langRecg.homophones).sort((a, b) => a.length > b.length ? -1 : 1);
        this.synKeys = homoKeys.map((key) => new RegExp(`\\b${key}\\b`));
        this.synVals = homoKeys.map((key) => this.langRecg.homophones[key]);

        this.pluginsRecgStore = newOptions.plugins
            .filter(plugin => plugin.enabled)
            .map(plugin => {
                let localized = plugin.localized[newOptions.language] || plugin.localized[<LanguageCode>newOptions.language.substr(0, 2)];
                if (localized) {
                    let enabledHomophones = localized.homophones.filter((homo) => homo.enabled).sort((a, b) => a.source.length > b.source.length ? -1 : 1);
                    let matchers = localized.matchers;
                    return {
                        synKeys: enabledHomophones.map((homo) => new RegExp(`\\b${homo.source}\\b`)),
                        synVals: enabledHomophones.map((homo) => homo.destination),
                        commands: Object.keys(plugin.commands)
                            .filter(cmdName => plugin.commands[cmdName].enabled)
                            // only those which we have a localized version of
                            .filter(cmdName => matchers[cmdName] !== undefined)
                            .map(cmdName => ({
                                name: cmdName,
                                global: plugin.commands[cmdName].global,
                                ordinalMatch: instanceOfDynamicMatch(matchers[cmdName].match) ? false : !!find(matchers[cmdName].match, (matchStr: string) => !!~matchStr.indexOf('#')),
                                // if it's a dynamic match, the fn is defined in the context of the CS
                                match: instanceOfDynamicMatch(matchers[cmdName].match) ? undefined : <string[]>matchers[cmdName].match,
                                ...pick(matchers[cmdName], ['delay', 'nice',]),
                            })),
                        ...pick(plugin, ['id', 'match'])
                    }
                }
            })
            .filter(identity);
        if (this.lang && this.lang != newOptions.language) {
            // new language
            this.lang = newOptions.language;

            if (newOptions.activated) {
                // restart the recognizer with the new language
                this.shutdown();
                this.start(this.cmdRecognizedCb);
            }
        } else {
            this.lang = newOptions.language;
        }
    }

    async start(cmdRecognizedCb: ((IRecognizedCallback) => Promise<void>)) {
        // kill it to prevent dupes
        try {
            this.recognition.stop();
        } catch (e) { }

        // call this promise if starting the recognizer fails
        // we do this asynchronously because we don't know it failed
        // until we get a `onerror` event.
        this.cmdRecognizedCb = cmdRecognizedCb;
        this.recognition = new this.speechRecognizer();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        console.log(`starting recognizer with ${this.lang}`);
        this.recognition.lang = this.lang;
        this.recognition.maxAlternatives = 1;

        // grammar not supported yet in chrome (as of v64)

        this.recognition.start();

        this.recognition.onresult = (event) => {
            // slice doesn't exist on the special event.results object, so we need to do a for loop
            let recs = [];
            for (let i = event.resultIndex; i < event.results.length; i++) {
                recs.push(event.results[i][0])
            }
            console.dir(event);
            if (event.resultIndex !== this.lastFinalIndex) {
                this.matchedCmdsForIndex = [];
                this.delayCmds[this.lastFinalIndex] = [];
                this.lastFinalIndex = event.resultIndex;
            }
            this.handleTranscript(
                recs.map(rec => rec.transcript).join(' ').trim().toLowerCase().replace(/-/g, '').replace(/\s+/g, ' '),
                <number>recs.reduce((memo, rec) => memo + rec.confidence, 0) / recs.length,
                <boolean>event.results[event.results.length - 1].isFinal,
                <number>event.resultIndex,
            );
            this.recognizerKilled = false;
        };

        // Error types:
        //    "no-speech",
        //    "aborted",
        //    "audio-capture",
        //    "network",
        //    "not-allowed",
        //    "service-not-allowed",
        //    "bad-grammar",
        //    "language-not-supported"
        this.recognition.onerror = (event) => {
            if (event.error === 'not-allowed') {
                // TODO: throw an exception that stops the
                // add-on
                // throw "This should never happen";
                this.recognizerKilled = true;
            } else if (event.error == 'network') {
                // TODO: special error message
            } else if (event.error == 'audio-capture') {
                // no mic
            } else if (event.error !== 'no-speech') {
                console.error(`unhandled error: ${event.error}`);
            }
        };

        this.recognition.onnomatch = (event) => {
            console.error(`No match! ${event}`);
        };

        this.recognition.onend = () => {
            // don't restart in an infinite loop
            this.matchedCmdsForIndex = [];
            this.delayCmds = {};
            if (!this.recognizerKilled) {
                console.log("Ended. Restarting.");
                this.recognition.start();
            }
        };

        // these are working and will be useful later
        //this.recognition.onsoundstart = () => {
        //console.log("sound start detected");
        //};

        //this.recognition.onsoundend = () => {
        //console.log("sound end detected");
        //};

    }

    shutdown() {
        try {
            this.recognition.stop();
        } catch (e) { }
        try {
            this.recognition.onresult = null;
            this.recognition.onerror = null;
            this.recognition.onend = null;
        } catch (e) { }
        this.recognition = null;
    }

    private findLongestMatchStr(s: string[]) {
        return s.reduce((memo, x) => x.length > memo ? x.length : memo, 0);
    }

    /*
     * The plugin store already has filtered out disabled commands
     * Splits up the input text and finds all the commands within the string.
     * Accounts for greedy matching commands, multiple commands, repeated commands.
     *
     * Returns an array in order of the cmds found in the input (for chaining).
     */
    async getCmdsForUserInput(input: string, url: string, useHomos: boolean = true): Promise<IMatchCommand[]> {
        let startTime = +new Date();
        let homophoneIterator: IterableIterator<string>;
        // TODO: flatten matchstr lists so it's really sorted by decreasing length, and not just by max
        // length of all matchStrs
        // commands are sorted by decreasing longest match string
        // plugins are sorted first by matching plugins, then plugins with globals, then browser plugin
        // [sortedIndex, pluginId, IRecgCommand[]]
        let sortedCmds: [number, string, IRecgCommand[]][] = this.pluginsRecgStore.map(plugin => {
            let urlMatchesForPlugin = !!find(plugin.match, regx => regx.test(url));
            return <[number, string, IRecgCommand[]]>[plugin.id.toLowerCase() === 'browser' ? 0 : urlMatchesForPlugin ? 2 : 1, plugin.id, [...(urlMatchesForPlugin ? plugin.commands.filter(cmd => !cmd.global) : []), ...plugin.commands.filter(cmd => cmd.global)].sort((a, b) => {
                if (a.match && !b.match)
                    return -1;
                else if (!a.match && b.match)
                    return 1;
                else if (!a.match && !b.match)
                    return 0
                else {
                    return this.findLongestMatchStr(<string[]>a.match) > this.findLongestMatchStr(<string[]>b.match) ? -1 : 1;
                }
            })];
        })
        .sort((a, b) => {
            if (a[1] < b[1]) return 1;
            if (a[1] > b[1]) return -1;
            return 0;
        });
        let currActiveTabProm = this.queryActiveTab();
        let inputParts = await this.langRecg.wordSplitter(input);
        let inputPartStart = 0;
        let inputPartEnd = inputParts.length;
        let origInputPartEnd = inputPartEnd;
        let retCmds: IMatchCommand[] = [];

        while (inputPartStart < inputPartEnd) {
            let inputPart = this.langRecg.wordJoiner(inputParts.slice(inputPartStart, inputPartEnd));

            // do pre-process here
            if (useHomos) {
                homophoneIterator = this.generateHomophones(inputPart, url);
            } else {
                homophoneIterator = [inputPart][Symbol.iterator]();
            }

            cmdsByPluginLoop:
            for (let homonizedInput = homophoneIterator.next().value; homonizedInput; homonizedInput = homophoneIterator.next().value) {
                for (let pluginTup of sortedCmds) {
                    let pluginId = pluginTup[1];
                    let cmdsToTest = pluginTup[2];

                    for (let f = 0; f < cmdsToTest.length; f++) {
                        let curCmd = cmdsToTest[f];
                        let runOnPageArgs: string[];
                        let matchPatterns;
                        let matchPatternIndex;
                        if (typeof curCmd.match === 'undefined') {
                            // TODO: not a big fan of how this works
                            let tab = await currActiveTabProm;
                            runOnPageArgs = await this.sendMsgToTab(tab.id, <ITranscriptParcel>{ cmdPluginId: pluginId, cmdName: curCmd.name, text: homonizedInput, lang: this.lang });
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
                                let inputSlice = homonizedInput;
                                for (; n < tokens.length || nextIsOrdinal; n++) {
                                    let token = tokens[n];
                                    if (token == '#') {
                                        nextIsOrdinal = true;
                                    } else {
                                        let matchPos = token ? inputSlice.indexOf(token) : inputSlice.length;
                                        if ((matchPos !== 0 && !nextIsOrdinal) || (matchPos === -1 && nextIsOrdinal)) {
                                            break;
                                        } else if (nextIsOrdinal) {
                                            let ord = this.langRecg.ordinalOrNumberToDigit(inputSlice.substring(0, matchPos));
                                            nextIsOrdinal = false;
                                            if (typeof ord === 'undefined')
                                                break;
                                            else
                                                ords.push(ord);
                                        }
                                        inputSlice = inputSlice.substring(matchPos + (token ? token.length : 0), inputSlice.length);
                                    }
                                }

                                if (inputSlice.trim() === '') {
                                    // we have a match
                                    runOnPageArgs = ords;
                                    break;
                                }

                            }
                        }
                        if (runOnPageArgs) {
                            let delay: number = null;
                            if (curCmd.ordinalMatch) {
                                delay = ORDINAL_CMD_DELAY;
                            } else if (curCmd.delay) {
                                delay = matchPatternIndex ? curCmd.delay[matchPatternIndex] : curCmd.delay[0];
                            }
                            console.log(`Recg. timer: ${+new Date() - startTime}`);
                            retCmds.push({
                                cmdName: curCmd.name,
                                cmdPluginId: pluginId,
                                matchOutput: runOnPageArgs,
                                niceTranscript: curCmd.nice ? (typeof curCmd.nice === 'string' ? curCmd.nice : curCmd.nice(homonizedInput, runOnPageArgs)) : homonizedInput,
                                delay,
                            });
                            inputPartStart = inputPartEnd;
                            inputPartEnd = origInputPartEnd + 1;
                            break cmdsByPluginLoop;
                        }
                    }
                }
            }
            inputPartEnd -= 1;
        }
        console.log(`Recg. timer: ${+new Date() - startTime}`);
        return retCmds;
    }


    async handleTranscript(text: string, confidence: Number, isFinal: boolean, resultIndex: number) {
        if (typeof this.delayCmds[resultIndex] !== 'undefined') {
            for (let v = 0; v < this.delayCmds[resultIndex].length; v++) {
                console.log(`Reset [${resultIndex}][${v}]`);
                this.delayCmds[resultIndex][v].reset();
            }
        }

        if (confidence > CONFIDENCE_THRESHOLD) {
            let recgCmds = await this.getCmdsForUserInput(text, this.curActiveTabUrl);

            // check if the same commands
            if (recgCmds.length > 0) {
                for (let i = 0; i < recgCmds.length; i++) {
                    let { cmdName, cmdPluginId, matchOutput, delay, niceTranscript } = recgCmds[i];
                    console.log(`delay: ${delay}, input: ${text}, matchOutput: ${matchOutput}, cmdName: ${cmdName}`);
                    if (this.matchedCmdsForIndex.length > i && cmdName !== this.matchedCmdsForIndex[i]
                            && this.delayCmds[resultIndex] && this.delayCmds[resultIndex][i] && this.delayCmds[resultIndex][i].hasRan) {
                        // cancel/undo the old command?
                        console.error(`We're changing our mind about a command that already ran!
                        Before: ${this.matchedCmdsForIndex[i]} After: ${cmdName}
                        `);
                    } else {
                        // prevent dupe commands when cmd is said once, but finalized much later by speech recg.
                        if (!this.delayCmds[resultIndex])
                            this.delayCmds[resultIndex] = [];

                        if (!this.delayCmds[resultIndex][i] || !this.delayCmds[resultIndex][i].hasRan) {
                            this.matchedCmdsForIndex[i] = cmdName;

                            if (this.delayCmds[resultIndex][i]) {
                                console.log(`clearing [${resultIndex}][${i}]`);
                                this.delayCmds[resultIndex][i].clear();
                            }

                            // short-circuit delay if the command is said to be final from speechRecognizer
                            if (isFinal)
                                delay = 0;

                            console.log(`cmdName: ${cmdName}. Setting [${resultIndex}][${i}] to ${delay}`);
                            console.dir(recgCmds);

                            this.delayCmds[resultIndex][i] = new ResettableTimeout(async () => {
                                console.log(`running command ${cmdName}`);
                                await this.cmdRecognizedCb({
                                    text: niceTranscript,
                                    isSuccess: true,
                                    cmdArgs: matchOutput,
                                    cmdName,
                                    cmdPluginId,
                                });
                            }, delay);
                            await this.cmdRecognizedCb(<ILiveTextParcel>{
                                text: niceTranscript,
                                isSuccess: true,
                                hold: true,
                                isFinal,
                            });
                        }
                    }
                }
            } else {
                this.cmdRecognizedCb({
                    text: text,
                    isFinal,
                });
            }
        } else if (isFinal && confidence <= CONFIDENCE_THRESHOLD) {
            return this.cmdRecognizedCb({
                text,
                isFinal,
            });
        }
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


    /*
     * Assumes synKeys are sorted by length.
     *
     * TODO: to truly generate each permutation, need to
     * do n * m here (since this only generates in one order after
     * going through the homophones linearly currently)
     */
    private *generateHomophones(beforeInput: string, url: string): IterableIterator<string> {
        let afterInput;
        // first yield the original
        yield beforeInput;
        // go through global homophones
        for (let q = 0; q < this.synKeys.length; q++) {
            afterInput = beforeInput.replace(this.synKeys[q], this.synVals[q]);
            if (afterInput !== beforeInput) {
                beforeInput = afterInput;
                yield afterInput;
            }
        }
        // already has filtered out disabled commands and plugins
        for (let x = 0; x < this.pluginsRecgStore.length; x++) {
            let plugin = this.pluginsRecgStore[x];
            if (find(plugin.match, regx => regx.test(url))) {
                for (let i = 0; i < plugin.synKeys.length; i++) {
                    afterInput = beforeInput.replace(plugin.synKeys[i], plugin.synVals[i]);
                    if (afterInput !== beforeInput) {
                        beforeInput = afterInput;
                        yield afterInput;
                    }
                }
            }
        }
    }



}
