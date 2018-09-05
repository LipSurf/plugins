import {
    ORDINAL_CMD_DELAY, CONFIDENCE_THRESHOLD, PARTIAL_MATCH_DELAY,
} from "../../common/constants";
import { Store, StoreSynced, } from "../store";
import { IOptions, SHARED_LOCAL_DATA, GENERAL_PREFERENCES, } from "../../common/store-lib";
import { find, pick, identity, omit, flatten, uniq, } from "lodash";
import { ResettableTimeout, instanceOfDynamicMatch, MissingLangPackError, objectAssignDeep, } from "../../common/util";

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

const recgStoreProps = {
    plugins: <{[lang in LanguageCode]?: IPluginRecgStore[]}> {},
    ...pick(SHARED_LOCAL_DATA, 'missingLangPack', 'busyDownloading', 'activated'),
    ...pick(GENERAL_PREFERENCES, 'language'),
}

type IRecgStore = typeof recgStoreProps;

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
    private running: boolean = false;
    private matchedCmdsForIndex = [];
    // so that we don't send repeat cmdRecognizedCb's when a new transcript comes in that either a) is the same text with a higher confidence/isFinal value
    // b) was for a command that was a success before (example WK dynamic matched answer) but no longer is
    private prevMatchedText: string[] = [];
    private lastFinalIndex: number;
    // used to quit processing old transcripts that have new-er more accurate recognition transcripts that have come in
    private lastRecgTime: number;
    // we index by transcript resultIndex in case a delayed cmd is pending and new voice
    // recg comes in
    private delayCmds: { [id: number]: ResettableTimeout[] } = {};
    private recgStore: IRecgStore = <IRecgStore>{};
    // for global homonyms
    private synKeys: RegExp[];
    private synVals: string[];
    private langRecg: ILanguageRecg;
    private langRecgs: {[lang in LanguageCode]?: ILanguageRecg} = {};
    private downloadingLangPack: boolean = false;

    constructor(store: Store,
        private queryActiveTab: () => Promise<chrome.tabs.Tab>,
        private sendMsgToTabs: (object, tabId?: number) => Promise<string[]>,
        private speechRecognizer,
        private cmdRecognizedCb: ((cb: IRecognizedCallback) => Promise<void>),
    ) {
        super(store);
    }

    protected async storeUpdated(newOptions: IOptions) {
        let newLang = false;
        console.log(`recg storeUpdated activated: ${newOptions.activated} previously: ${this.recgStore.activated}`);

        Object.assign(this.recgStore, pick(newOptions, 'missingLangPack', 'busyDownloading', ));
        this.langRecg = this.getLangRecg(newOptions.language);

        await this.downloadLangPackIfNeeded(this.langRecg);
        [this.synKeys, this.synVals] = this.getGlobalHomoKV(this.langRecg);

        let enabledPlugins = newOptions.plugins.filter(plugin => plugin.enabled);
        let allLangs = uniq(flatten(enabledPlugins.map(plugin => Object.keys(plugin.localized))));

        this.recgStore.plugins = allLangs.reduce((memo, lang) => Object.assign(memo, {[lang]: enabledPlugins.map(plugin => {
            let localized = plugin.localized[newOptions.language] || plugin.localized[<LanguageCode>newOptions.language.substr(0, 2)];
            if (localized) {
                let enabledHomophones = localized.homophones.filter((homo) => homo.enabled).sort((a, b) => a.source.length > b.source.length ? -1 : 1);
                let matchers = localized.matchers;
                return {
                    synKeys: enabledHomophones.map((homo) => this.langRecg.homophoneProcessor ? this.langRecg.homophoneProcessor(homo.source) : new RegExp(homo.source)),
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
        })}), {});

        if (this.recgStore.language && this.recgStore.language != newOptions.language) {
            // new language
            newLang = true;
        } 
        this.recgStore.language = newOptions.language;

        if (newOptions.activated && (!this.recgStore.activated || newLang)) {
            this.start(this.cmdRecognizedCb);
        } else if (!newOptions.activated && this.recgStore.activated) {
            this.shutdown();
        }
        this.recgStore.activated = newOptions.activated;
    }

    private async downloadLangPackIfNeeded(langRecg: ILanguageRecg) {
        if (!this.downloadingLangPack) {
            // check for missing lang packs
            try {
                if (langRecg.init) {
                    await langRecg.init();
                }
                if (this.recgStore.missingLangPack) {
                    this.recgStore.missingLangPack = false;
                    this.save({missingLangPack: false});
                }
            } catch(e) {
                if (e instanceof MissingLangPackError) {
                    this.downloadingLangPack = true;
                    this.recgStore.busyDownloading = true;
                    this.recgStore.missingLangPack = true;
                    this.save({missingLangPack: true, busyDownloading: true});
                    langRecg.getExtraData().then(() => {
                        this.recgStore.busyDownloading = false;
                        this.recgStore.missingLangPack = false;
                        this.store.save({busyDownloading: false, missingLangPack: false});
                        this.downloadingLangPack = false;
                    })
                } else {
                    // just missingLangPack: true can go here (if it's not busy downloading)
                    throw e;
                }
            }
        }
    }

    private getLangRecg(language: LanguageCode): ILanguageRecg {
        let lang = language.substr(0, 2);
        if (!(lang in this.langRecgs)) {
            Object.assign(this.langRecgs, {[lang]: new LANGS[lang]()});
        }
        return this.langRecgs[lang];
    }

    private getGlobalHomoKV(langRecg: ILanguageRecg): [RegExp[], string[]] {
        let homoKeys = Object.keys(langRecg.homophones).sort((a, b) => a.length > b.length ? -1 : 1);
        let synKeys = homoKeys.map((key) => langRecg.homophoneProcessor ? langRecg.homophoneProcessor(key) : new RegExp(key));
        let synVals = homoKeys.map((key) => langRecg.homophones[key]);
        return [synKeys, synVals];
    }

    // we used to set language by reacting to a storage change but that was too slow
    async setLanguage(language:LanguageCode) {
        console.log(`in recg.setLanguage recgStore.activated: ${this.recgStore.activated} `);
        this.recgStore.language = language;
        this.langRecg = this.getLangRecg(language);
        await this.downloadLangPackIfNeeded(this.langRecg);
        [this.synKeys, this.synVals] = this.getGlobalHomoKV(this.langRecg);

        if (this.recgStore.activated) {
            this.start(this.cmdRecognizedCb);
        }
        // intentionally won't come back to our own storeUpdated because author id 
        this.save({language});
    }

    async start(cmdRecognizedCb: ((IRecognizedCallback) => Promise<void>)) {
        // kill it to prevent dupes
        try {
            this.shutdown();
        } catch (e) { }

        // call this promise if starting the recognizer fails
        // we do this asynchronously because we don't know it failed
        // until we get a `onerror` event.
        this.running = true;
        this.cmdRecognizedCb = cmdRecognizedCb;
        this.recognition = new this.speechRecognizer();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        console.log(`starting recognizer with ${this.recgStore.language}`);
        this.recognition.lang = this.recgStore.language;
        this.recognition.maxAlternatives = 1;

        // grammar not supported yet in chrome (as of v64)

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
            this.lastRecgTime = +new Date();
            this.handleTranscript(
                recs.map(rec => rec.transcript).join(' ').trim().toLowerCase().replace(/-/g, '').replace(/\s+/g, ' '),
                <number>recs.reduce((memo, rec) => memo + rec.confidence, 0) / recs.length,
                <boolean>event.results[event.results.length - 1].isFinal,
                <number>event.resultIndex,
                this.lastRecgTime,
            );
            this.running = true;
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
            console.log(`recg error: ${event.error}`);
            if (event.error === 'not-allowed') {
                // TODO: throw an exception that stops the
                // add-on
                // throw "This should never happen";
                this.running = false;
            } else if (event.error == 'network') {
                // TODO: special error message
                // this.running = false;
            } else if (event.error == 'audio-capture') {
                // no mic
                // TODO: special error message
                this.running = false;
            } else if (event.error !== 'no-speech') {
                console.error(`unhandled error: ${event.error}`);
                this.running = false;
            }

        };

        this.recognition.onnomatch = (event) => {
            console.error(`No match! ${event}`);
        };

        this.recognition.onend = () => {
            this.matchedCmdsForIndex = [];
            this.prevMatchedText = [];
            this.delayCmds = {};
            // don't restart in an infinite loop
            if (this.running) {
                console.log("Ended. Restarting.");
                this.recognition.start();
            } else {
                console.log("Ended. Not restarting");
            }
        };

        // these are working and will be useful later
        //this.recognition.onsoundstart = () => {
        //console.log("sound start detected");
        //};

        //this.recognition.onsoundend = () => {
        //console.log("sound end detected");
        //};

        this.recognition.start();
    }

    shutdown() {
        console.log(`shutting down recg.`);
        this.running = false;
        if (this.recognition) {
            this.recognition.onend();
            try {
                this.recognition.stop();
            } catch (e) { }
        }
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
    async getCmdsForUserInput(input: string, url: string, askTabIfDynMatch: (cmdPluginId: string, cmdName: string, text: string) => Promise<MatchResult>, useHomos: boolean = true): Promise<IMatchCommand[]> {
        let startTime = +new Date();
        let homophoneIterator: IterableIterator<string>;
        // TODO: flatten matchstr lists so it's really sorted by decreasing length, and not just by max
        // length of all matchStrs
        // commands are sorted by decreasing longest match string, with dynamic matches first
        // plugins are sorted first by matching plugins, then plugins with globals, then browser plugin
        // [sortedIndex, pluginId, IRecgCommand[]]
        let sortedCmds: [number, string, IRecgCommand[]][] = this.recgStore.plugins[this.recgStore.language.substr(0, 2)].map(plugin => {
            let urlMatchesForPlugin = !!find(plugin.match, regx => regx.test(url));
            return <[number, string, IRecgCommand[]]>[plugin.id.toLowerCase() === 'browser' ? 0 : urlMatchesForPlugin ? 2 : 1, plugin.id, [...(urlMatchesForPlugin ? plugin.commands.filter(cmd => !cmd.global) : []), ...plugin.commands.filter(cmd => cmd.global)].sort((a, b) => {
                // if match prop is undefined -- then it's a dynamic match command
                if (a.match && !b.match)
                    return 1;
                else if (!a.match && b.match)
                    return -1;
                else if (!a.match && !b.match)
                    return 0
                else {
                    return this.findLongestMatchStr(<string[]>a.match) > this.findLongestMatchStr(<string[]>b.match) ? -1 : 1;
                }
            })];
        })
        .sort((a, b) => {
            if (a[0] < b[0]) return 1;
            if (a[0] > b[0]) return -1;
            return 0;
        });
        let inputParts = await this.langRecg.wordSplitter(input);
        let inputPartStart = 0;
        let inputPartEnd = inputParts.length;
        let origInputPartEnd = inputPartEnd;
        let retCmds: IMatchCommand[] = [];
        let preprocessIterator: IterableIterator<string>;
        let delayForOtherPartialMatch = false;

        while (inputPartStart < inputPartEnd) {
            let inputPart = this.langRecg.wordJoiner(inputParts.slice(inputPartStart, inputPartEnd));

            if (this.langRecg.preprocess) {
                preprocessIterator = this.langRecg.preprocess(inputPart);
            } else {
                preprocessIterator = [inputPart][Symbol.iterator]();
            }

            cmdsByPluginLoop:
            for (let postProcessInputPart = preprocessIterator.next().value; postProcessInputPart; postProcessInputPart = preprocessIterator.next().value) {

                console.log(`preprocess output: ${postProcessInputPart}`);

                if (useHomos) {
                    homophoneIterator = this.generateHomophones(postProcessInputPart, url);
                } else {
                    homophoneIterator = [postProcessInputPart][Symbol.iterator]();
                }

                for (let homonizedInput = homophoneIterator.next().value; homonizedInput; homonizedInput = homophoneIterator.next().value) {
                    for (let pluginTup of sortedCmds) {
                        let pluginId = pluginTup[1];
                        let cmdsToTest = pluginTup[2];

                        for (let f = 0; f < cmdsToTest.length; f++) {
                            let curCmd = cmdsToTest[f];
                            let matchResult: MatchResult;
                            let matchPatternIndex;
                            if (typeof curCmd.match === 'undefined') {
                                matchResult = await askTabIfDynMatch(pluginId, curCmd.name, homonizedInput);

                                if (matchResult === false) {
                                    // partial match
                                    delayForOtherPartialMatch = true;
                                }
                            } else {
                                for (matchPatternIndex = 0; matchPatternIndex < curCmd.match.length; matchPatternIndex++) {
                                    let tokens = this.tokenizeMatchPattern(curCmd.match[matchPatternIndex]);
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
                                        matchResult = ords;
                                        break;
                                    }

                                }
                            }
                            if (matchResult) {
                                let delay: number = 0;
                                let pageFnArgs = <string[]>matchResult;
                                if (curCmd.ordinalMatch) {
                                    delay = ORDINAL_CMD_DELAY;
                                } else if (curCmd.delay) {
                                    delay = matchPatternIndex ? curCmd.delay[matchPatternIndex] : curCmd.delay[0];
                                }

                                if (delayForOtherPartialMatch) {
                                    delay += PARTIAL_MATCH_DELAY;
                                }
                                if (delay == 0) 
                                    delay = null

                                console.log(`Recg. timer: ${+new Date() - startTime}`);
                                retCmds.push({
                                    cmdName: curCmd.name,
                                    cmdPluginId: pluginId,
                                    matchOutput: pageFnArgs,
                                    niceTranscript: curCmd.nice ? (typeof curCmd.nice === 'string' ? curCmd.nice : curCmd.nice(homonizedInput, pageFnArgs)) : homonizedInput,
                                    delay,
                                });
                                inputPartStart = inputPartEnd;
                                inputPartEnd = origInputPartEnd + 1;
                                break cmdsByPluginLoop;
                            }
                        }
                    }
                }
            }
            inputPartEnd -= 1;
        }
        console.log(`Recg. timer: ${+new Date() - startTime}`);
        return retCmds;
    }


    async handleTranscript(text: string, confidence: Number, isFinal: boolean, resultIndex: number, recgTime: number) {
        if (typeof this.delayCmds[resultIndex] !== 'undefined') {
            for (let v = 0; v < this.delayCmds[resultIndex].length; v++) {
                console.log(`Reset [${resultIndex}][${v}]`);
                this.delayCmds[resultIndex][v].reset();
            }
        }

        if (confidence > CONFIDENCE_THRESHOLD) {
            // short-circuit if we've already processed this text as a success
            // currently only uses successful commands and disgregards homophones
            if (this.prevMatchedText.length > resultIndex && this.prevMatchedText[resultIndex] === text) {
                console.log(`abandoning ${text} because it's the same as prevMatchedText. So we've already ran the command for it.`);
                return;
            }

            let curActiveTab = await this.queryActiveTab();
            let recgCmds = await this.getCmdsForUserInput(text, curActiveTab.url, async (cmdPluginId: string, cmdName: string, text:string): Promise<MatchResult> => {
                return this.sendMsgToTabs(<ITranscriptParcel>{cmdPluginId, cmdName, text, lang: this.recgStore.language}, curActiveTab.id);
            });

            // short-circuit if something newer came along
            if (this.lastRecgTime !== recgTime) {
                console.log(`abandoning ${text} because something newer came along`);
                return;
            }

            // check if the same commands
            if (recgCmds.length > 0) {
                this.prevMatchedText[resultIndex] = text;
                for (let i = 0; i < recgCmds.length; i++) {
                    let { cmdName, cmdPluginId, matchOutput, delay, niceTranscript } = recgCmds[i];
                    console.log(`delay: ${delay}, input: ${text}, matchOutput: ${matchOutput}, cmdName: ${cmdName}`);
                    if (this.matchedCmdsForIndex.length > i && cmdName !== this.matchedCmdsForIndex[i]
                            && this.delayCmds[resultIndex] && this.delayCmds[resultIndex][i] && this.delayCmds[resultIndex][i].hasRan) {
                        // cancel/undo the old command?
                        console.error(`We're changing our mind about a command that already ran!
                        Before: ${this.matchedCmdsForIndex[i]} After: ${cmdName}
                        `);
                        // no longer counts as previously matching
                        this.prevMatchedText[resultIndex] = null;
                    } else {
                        // prevent dupe commands when cmd is said once, but finalized later by speech recg.
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

                            this.cmdRecognizedCb(<ILiveTextParcel>{
                                text: niceTranscript,
                                isSuccess: true,
                                hold: delay ? true : false,
                                isFinal,
                            });
                            this.delayCmds[resultIndex][i] = new ResettableTimeout(async () => {
                                console.log(`running command ${cmdName}`);
                                this.cmdRecognizedCb({
                                    text: niceTranscript,
                                    isSuccess: true,
                                    cmdArgs: matchOutput,
                                    cmdName,
                                    cmdPluginId,
                                });
                                // restart after every successful command
                                this.start(this.cmdRecognizedCb);
                            }, delay);
                        }
                    }
                }
            } else {
                return this.cmdRecognizedCb({
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
        let lang = this.recgStore.language.substr(0, 2);
        for (let x = 0; x < this.recgStore.plugins[lang].length; x++) {
            let plugin = this.recgStore.plugins[lang][x];
            // no longer testing URL as homophones should work for global commands too (so we keep things simple and just always process enabled homophones regardless of url)
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
