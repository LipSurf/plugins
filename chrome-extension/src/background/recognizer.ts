import {
    ORDINAL_CMD_DELAY, ORDINALS_TO_DIGITS, NUMBERS_TO_DIGITS,
    CONFIDENCE_THRESHOLD, HOMOPHONES
} from "../common/constants";
import { Store, StoreSynced, } from "./store";
import { find, flatten, pick, map } from "lodash";
import { promisify, ResettableTimeout, instanceOfDynamicMatch } from "../common/util";


interface IRecgCommand {
    // computed property that describes if match strings have ordinal
    // placeholders and we should wait a bit of extra time to let
    // them get captured before executing
    name: string,
    match: string[] | ((transcript: string) => any[]),
    ordinalMatch: boolean,
    global?: boolean,
    nice?: (rawInput: string, matchOutput: any[]) => string,
    delay?: number[],
}

// transformations of the plugin store go here
interface IPluginRecgStore extends IToggleableHomophones {
    id: string,
    commands: IRecgCommand[],
    match: RegExp[],
    synKeys: RegExp[],
    synVals: string[],
}

interface IMatchCommand {
    cmdName: string,
    cmdPluginId: string,
    // what the match function returns -- if anything
    matchOutput: any[],
    // the actual delay being used (after matching, so not an array)
    delay: number,
    niceTranscript: string,
}

export type IRecognizedCallback = ILiveTextParcel | ICmdParcel;


export class Recognizer extends StoreSynced {
    private recognition;
    private recognizerKilled: boolean = false;
    private cmdRecognizedCb: (cb: IRecognizedCallback) => void;
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

    constructor(store: Store,
        onUrlUpdate: ((cb: ((url: string) => void)) => void),
        private queryActiveTab: () => Promise<chrome.tabs.Tab>,
        private sendMsgToTab: (tabId: number, object) => Promise<string[]>,
        private speechRecognizer,
    ) {
        super(store);
        let homoKeys = Object.keys(HOMOPHONES).sort((a, b) => a.length > b.length ? -1 : 1);
        this.synKeys = homoKeys.map((key) => new RegExp(`\\b${key}\\b`));
        this.synVals = homoKeys.map((key) => HOMOPHONES[key]);
        onUrlUpdate((url) => {
            this.curActiveTabUrl = url;
        });
    }

    protected storeUpdated(newOptions: IOptions) {
        this.pluginsRecgStore = newOptions.plugins
            .filter(plugin => plugin.enabled)
            .map(plugin => {
                let enabledHomophones = plugin.homophones.filter((homo) => homo.enabled).sort((a, b) => a.source.length > b.source.length ? -1 : 1);
                return {
                    synKeys: enabledHomophones.map((homo) => new RegExp(`\\b${homo.source}\\b`)),
                    synVals: enabledHomophones.map((homo) => homo.destination),
                    commands: plugin.commands
                        .filter(cmd => cmd.enabled)
                        .map((cmd) => ({
                            ordinalMatch: !instanceOfDynamicMatch(cmd.match) ? !!find(flatten(cmd.match), (matchStr) => ~matchStr.indexOf('#')) : false,
                            // if it's a dynamic match, the fn is defined in the context of the CS
                            match: instanceOfDynamicMatch(cmd.match) ? undefined : cmd.match,
                            ...pick(cmd, ['name', 'delay', 'global', 'nice',])
                        })),
                    ...pick(plugin, ['id', 'match'])
                }
            });
    }

    async start(cmdRecognizedCb: ((IRecognizedCallback) => void)) {
        // call this promise if starting the recognizer fails
        // we do this asynchronously because we don't know it failed
        // until we get a `onerror` event.
        this.cmdRecognizedCb = cmdRecognizedCb;
        this.recognition = new this.speechRecognizer();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        //this.recognition.lang = 'ja';
        this.recognition.lang = 'en-US';
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
                console.log("ended. Restarting: ");
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

    /*
     * The plugin store already has filtered out disabled commands
     * Splits up the input text and finds all the commands within the string. 
     * Accounts for greedy matching commands, multiple commands, repeated commands.
     * 
     * Returns an array in order of the cmds found in the input.
     */
    async getCmdsForUserInput(input: string, url: string, useHomos: boolean = true): Promise<IMatchCommand[]> {
        let startTime = +new Date();
        let homophoneIterator: IterableIterator<string>;
        let cmdsByPlugin: { [pluginId: string]: IRecgCommand[] } = this.pluginsRecgStore.reduce((memo, plugin) => {
            memo[plugin.id] = [...(find(plugin.match, regx => regx.test(url)) ? plugin.commands.filter(cmd => !cmd.global) : []), ...plugin.commands.filter(cmd => cmd.global)];
            return memo;
        }, {});
        let currActiveTabProm = this.queryActiveTab();
        let inputParts = input.split(' ');
        let inputPartStart = 0;
        let inputPartEnd = inputParts.length;
        let origInputPartEnd = inputPartEnd;
        let retCmds: IMatchCommand[] = [];

        while (inputPartStart < inputPartEnd) {
            let inputPart = inputParts.slice(inputPartStart, inputPartEnd).join(' ');

            cmdsByPluginLoop:
            for (let pluginId in cmdsByPlugin) {
                let cmdsToTest = cmdsByPlugin[pluginId];

                if (useHomos) {
                    homophoneIterator = this.generateHomophones(inputPart, url);
                } else {
                    homophoneIterator = [inputPart][Symbol.iterator]();
                }

                for (let homonizedInput = homophoneIterator.next().value; homonizedInput; homonizedInput = homophoneIterator.next().value) {
                    for (let f = 0; f < cmdsToTest.length; f++) {
                        let curCmd = cmdsToTest[f];
                        let runOnPageArgs: string[];
                        let matchPatterns;
                        let matchPatternIndex;
                        if (typeof curCmd.match === 'undefined') {
                            // TODO: not a big fan of how this works
                            let tab = await currActiveTabProm;
                            runOnPageArgs = await this.sendMsgToTab(tab.id, <ITranscriptParcel>{ cmdPluginId: pluginId, cmdName: curCmd.name, text: homonizedInput });
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

                            this.delayCmds[resultIndex][i] = new ResettableTimeout(() => {
                                console.log(`running command ${cmdName}`);
                                this.cmdRecognizedCb({
                                    text: niceTranscript,
                                    isSuccess: true,
                                    cmdArgs: matchOutput,
                                    cmdName,
                                    cmdPluginId,
                                });
                            }, delay);
                            this.cmdRecognizedCb(<ILiveTextParcel>{
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


    // prefix or suffix match
    private ordinalOrNumberToDigit(ordinal) {
        try {
            return ORDINALS_TO_DIGITS[ordinal] || NUMBERS_TO_DIGITS[ordinal];
        } catch (e) {
            console.debug(`Could not convert to number ${e}`);
        }
    }


}
