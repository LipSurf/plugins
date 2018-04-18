import { ORDINAL_CMD_DELAY, ORDINALS_TO_DIGITS, NUMBERS_TO_DIGITS, COOLDOWN_TIME,
        CONFIDENCE_THRESHOLD, FINAL_COOLDOWN_TIME, HOMOPHONES } from "../common/constants";
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
    private lastFinalTime: number = 0;
    private lastNonFinalCmdExecutedTime: number = 0;
    private lastNonFinalCmdExecuted = null;
    private delayCmd: ResettableTimeout;
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
        let homoKeys = Object.keys(HOMOPHONES);
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
                let enabledHomophones = plugin.homophones.filter((homo) => homo.enabled);
                return {
                    synKeys: enabledHomophones.map((homo) => new RegExp(`\\b${homo.source}\\b`)),
                    synVals: enabledHomophones.map((homo) => homo.destination),
                    commands: plugin.commands
                        .filter(cmd => cmd.enabled)
                        .map((cmd) => ({
                            ordinalMatch: !instanceOfDynamicMatch(cmd.match)? !! find(flatten(cmd.match), (matchStr) => ~matchStr.indexOf('#')) : false,
                            // if it's a dynamic match, the fn is defined in the context of the CS
                            match: instanceOfDynamicMatch(cmd.match) ? undefined : cmd.match,
                            ... pick(cmd, ['name', 'delay', 'global', 'nice', ])
                        })),
                    ... pick(plugin, ['id', 'match'])
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
        this.recognition.start();

        this.recognition.onresult = (event) => {
            let res = [];
            for (let i = event.resultIndex; i < event.results.length; i++) {
                let rec = event.results[i][0];
                res.push({
                    text: rec.transcript.trim().toLowerCase().replace(/-/g, ''),
                    confidence: rec.confidence,
                    isFinal: event.results[i].isFinal
                }) ;
            }
            console.dir(event);
            this.handleTranscript(res);
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
            if (!this.recognizerKilled) {
                console.log("ended. Restarting: ");
                this.recognition.start();
            }
        };
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
     *
     *  Return {
     *  matchOutput: the arguments to pass back to the command
     * }
     */
    async getCmdForUserInput(input: string, url: string): Promise<IMatchCommand> {
        // processedInput = dedupe(processedInput);
        let startTime = +new Date();
        let homophoneIterator = this.generateHomophones(input, url);
        for (let processedInput = homophoneIterator.next().value; processedInput; processedInput = homophoneIterator.next().value) {
            for (let g = 0; g < this.pluginsRecgStore.length; g++) {
                let plugin = this.pluginsRecgStore[g];
                // get all global commands
                let cmdsToTest = [...(find(plugin.match, regx => regx.test(url)) ? plugin.commands.filter(cmd => !cmd.global) : []), ...plugin.commands.filter(cmd => cmd.global)];
                for (let f = 0; f < cmdsToTest.length; f++) {
                    let curCmd = cmdsToTest[f];
                    // an array of args to pass to runOnPage
                    let out: string[];
                    let matchPatterns;
                    let matchPatternIndex;
                    if (typeof curCmd.match === 'undefined') {
                        // TODO: not a big fan of how this works
                        let tab = await this.queryActiveTab();
                        out = await this.sendMsgToTab(tab.id, <ITranscriptParcel>{cmdPluginId: plugin.id, cmdName: curCmd.name, processedInput});
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
                                out = ords;
                                break;
                            }

                        }
                    }
                    if (out) {
                        let delay: number = null;
                        if (curCmd.ordinalMatch) {
                            delay = ORDINAL_CMD_DELAY;
                        } else if (curCmd.delay) {
                            delay = matchPatternIndex ? curCmd.delay[matchPatternIndex] : curCmd.delay[0];
                        }
                        console.log(`Recg. timer: ${+new Date() - startTime}`);
                        return {
                            cmdName: curCmd.name,
                            cmdPluginId: plugin.id,
                            matchOutput: out,
                            niceTranscript: curCmd.nice ? (typeof curCmd.nice === 'string' ? curCmd.nice : curCmd.nice(processedInput, out)) : processedInput,
                            delay,
                        };
                    }
                }

            }
        }
        console.log(`Recg. timer: ${+new Date() - startTime}`);
        return <IMatchCommand>{};
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

    // TODO:
    // Maybe we want to execute each command seperately? Like "down down" should
    // be two downs. If the user chains commands like "down up" then
    // maybe we should split and match the first valid part of the command?
    // Needs thought...
    //private dedupe(input) {
    //let existingWords = {};
    //let processed = [];
    //for (let word of input.split(' ')) {
    //if (typeof existingWords[word] === 'undefined') {
    //processed.push(word);
    //}
    //}
    //return processed.join(' ');
    //}


    /*
     * TODO: to truly generate each permutation, need to
     * do nxm here (since this only generates in one order after
     * going through the homophones linearly currently)
     */
    private *generateHomophones(beforeInput: string, url: string) {
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


    async handleTranscript(transcripts: {text: string, isFinal: boolean, confidence: Number}[]) {
        let elapsedTime = +new Date() - this.lastNonFinalCmdExecutedTime;
        console.log(`elapsed time ${elapsedTime} ${COOLDOWN_TIME} ${CONFIDENCE_THRESHOLD}`);
        if (this.delayCmd)
            this.delayCmd.reset();
        if (elapsedTime > COOLDOWN_TIME) {
            if (transcripts[0].confidence > CONFIDENCE_THRESHOLD) {
                // TODO: for perf. benefit join the transcripts and see if there is a match across transcripts? eg. ["new", "tab"]
                let joinedTrans = transcripts.map(x => x.text).join(' ');
                let { cmdName, cmdPluginId, matchOutput, delay, niceTranscript } = await this.getCmdForUserInput(joinedTrans, this.curActiveTabUrl);
                let liveText = transcripts.map(x => ({
                    isSuccess: niceTranscript ? !!~niceTranscript.indexOf(x.text): false,
                    ...pick(x, 'text', 'isFinal'),
                }));

                console.log(`delay: ${delay}, input: ${'transcript'}, matchOutput: ${matchOutput}, cmdName: ${cmdName}`);
                if (cmdName) {
                    // prevent dupe commands when cmd is said once, but finalized much later by speech recg.
                    console.log(`isFinal: ${'isFinal'} lastNonFinalCmdExecuted: ${this.lastNonFinalCmdExecuted} cmdName: ${cmdName} lastFinalTime: ${this.lastFinalTime} `);
                    if (!'isFinal' && this.lastNonFinalCmdExecuted && this.lastNonFinalCmdExecuted === cmdName && (+new Date() - this.lastFinalTime) > FINAL_COOLDOWN_TIME) {
                        console.log("Junked dupe.");
                        return;
                    }

                    if (this.delayCmd)
                        this.delayCmd.clear();
                    // it ambiguous so the tests can work in node
                    // @ts-ignore: setTimeout === window.setTimeout but we keep
                    this.delayCmd = new ResettableTimeout(() => {
                        console.log(`running command ${cmdName} isFinal:${'isFinal'}`);
                        if (!'isFinal') {
                            this.lastFinalTime = +new Date();
                        } else {
                            this.lastNonFinalCmdExecuted = cmdName;
                            this.lastNonFinalCmdExecutedTime = +new Date();
                        }

                        return this.cmdRecognizedCb({
                            liveText: [
                                {text: niceTranscript, isSuccess: true}
                            ],
                            cmdArgs: matchOutput,
                            cmdName,
                            cmdPluginId,
                        });
                    }, delay);
                    return this.cmdRecognizedCb(<ILiveTextParcel>{
                        liveText: liveText,
                        hold: true,
                    });
                } else {
                    return this.cmdRecognizedCb({liveText});
                }
            } else if ('isFinal' && transcripts[0].confidence <= CONFIDENCE_THRESHOLD) {
                return this.cmdRecognizedCb({
                    liveText: transcripts.map(x => ({
                        isFinal: true,
                        text: x.text,
                    })),
                    hold: false,
                });
            }
        }
    }
}
