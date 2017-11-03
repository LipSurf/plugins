exports.Recognizer = function({
    CT, // constants
    _,
    webkitSpeechRecognition,
} = {}) {
    var recognition;
    var pub = {};
    var needsPermissionCb;
    var _sendMsgToActiveTabCb;
    var lastNonFinalCmdExecutedTime = 0;
    var lastNonFinalCmdExecuted = null;
    var plugins;
    var _syn_keys = [];
    var _syn_vals = [];

    // let outside functionality update the commands list at any time
    pub.setPlugins = function(plgs, homos) {
        plugins = plgs;
        _syn_keys = homos.map((homo) => new RegExp(`\\b${homo.source}\\b`));
        _syn_vals = homos.map((homo) => homo.destination);
    };

    pub.start = function({
        needsPermissionCb,
        sendMsgToActiveTabCb,
    } = {}) {
        needsPermissionCb = needsPermissionCb;
        _sendMsgToActiveTabCb = sendMsgToActiveTabCb;
        recognition = new webkitSpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        recognition.maxAlternatives = 1;
        recognition.start();

        recognition.onresult = function(event) {
            var lastE = event.results[event.results.length - 1];
            console.dir(event);
            pub._handleTranscript({
                'isFinal': lastE.isFinal,
                'confidence': lastE[0].confidence,
                'transcript': lastE[0].transcript.trim().toLowerCase(),
            });
        };

        // Error types:
        //  'no-speech'
        //  'network'
        //  'not-allowed
        recognition.onerror = function(event) {
            if (event.error === 'not-allowed') {
                needsPermissionCb();
            } else if (event.error !== 'no-speech') {
                console.error(`unhandled error: ${event.error}`);
            }
        };

        recognition.onnomatch = function(event) {
            console.error(`No match! ${event}`);
        };

        recognition.onend = function() {
            console.log("ended. Restarting: ");
            recognition.start();
        };

    };

    pub.shutdown = function() {
        try {
            recognition.stop();
        } catch (e) {}
        try {
            recognition.onresult = null;
            recognition.onerror = null;
            recognition.onend = null;
        } catch (e) {}
        recognition = null;
    };

    /* Return {
     *  matchOutput: the arguments to pass back to the command
     *}
     */
    pub._getCmdForUserInput = function(input) {
        // simplifies the input into a more limited set of words
        let processedInput = expandSynonyms(input);
        // processedInput = dedupe(processedInput);
        for (let g = 0; g < plugins.length; g++) {
            for (let f = 0; f < plugins[g].commands.length; f++) {
                let curCmd = plugins[g].commands[f];
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
                        let tokens = tokenizeMatchPattern(matchPatterns[matchPatternIndex]);
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
                                        ords.push(ordinalOrNumberToDigit(inputSlice.substring(0, matchPos)));
                                    } catch (e) {
                                        // not an ordinal
                                        break;
                                    }
                                } else if (nextIsOrdinal != 0) {
                                    // not matching at the beginning of the segment
                                    break;
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
                    let delay = null;
                    if (curCmd.ordinalMatch) {
                        delay = CT.ORDINAL_CMD_DELAY;
                    } else if (curCmd.delay && typeof curCmd.delay === 'object') {
                        delay = curCmd.delay[matchPatternIndex];
                    } else if (typeof curCmd.delay !== 'undefined') {
                        delay = curCmd.delay;
                    }
                    return {
                        cmdName: curCmd.name,
                        cmdPluginName: plugins[g].name,
                        matchOutput: out,
                        delay: delay,
                        nice: curCmd.nice,
                        fn: curCmd.runOnPage
                    };
                }
            }
        }
        return {};
    };


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
    function tokenizeMatchPattern(matchStr) {
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
    function dedupe(input) {
        let existingWords = {};
        let processed = [];
        for (let word of input.split(' ')) {
            if (typeof existingWords[word] === 'undefined') {
                processed.push(word);
            }
        }
        return processed.join(' ');
    }


    function expandSynonyms(input) {
        for (let i = 0; i < _syn_keys.length; i++) {
            input = input.replace(_syn_keys[i], _syn_vals[i]);
        }
        return input;
    }


    // prefix or suffix match
    function ordinalOrNumberToDigit(input) {
        try {
            return CT.ORDINALS_TO_DIGITS[ordinal] || CT.NUMBERS_TO_DIGITS[ordinal];
        } catch (e) {
            console.debug(`Could not convert to number ${e}`);
        }
    }


    pub._handleTranscript = function({
        isFinal,
        transcript,
        confidence
    } = {}) {
        let elapsedTime = +new Date() - lastNonFinalCmdExecutedTime;
        console.log(`elapsed time ${elapsedTime} ${CT.COOLDOWN_TIME} ${CT.CONFIDENCE_THRESHOLD}`);
        if (elapsedTime > CT.COOLDOWN_TIME) {
            if (confidence > CT.CONFIDENCE_THRESHOLD) {
                // console.log(`start time ${+new Date()}`);
                var {
                    cmdName,
                    cmdPluginName,
                    matchOutput,
                    delay,
                    nice,
                    fn,
                } = pub._getCmdForUserInput(transcript);
                var niceOutput = null;
                console.log(`input: ${transcript}, matchOutput: ${matchOutput}, cmdName: ${cmdName}`);
                // console.log(`end time ${+new Date()}`);
                if (cmdName) {
                    // prevent dupe commands when cmd is said once, but finalized much later by speech recg.
                    if (isFinal && lastNonFinalCmdExecuted && lastNonFinalCmdExecuted === cmdName && (+new Date() - lastFinalTime) < CT.FINAL_COOLDOWN_TIME) {
                        console.log("Junked dupe.");
                        return;
                    } else if (typeof delayCmd !== 'undefined') {
                        clearTimeout(delayCmd);
                    }

                    delayCmd = setTimeout(() => {
                        if (typeof nice === 'string') {
                            niceOutput = nice;
                        } else if (typeof nice === 'function') {
                            niceOutput = nice(matchOutput);
                        }
                        console.log(`running command ${cmdName} isFinal:${isFinal}`);
                        lastNonFinalCmdExecuted = isFinal ? null : cmdName;
                        lastNonFinalCmdExecutedTime = isFinal ? 0 : +new Date();

                        _sendMsgToActiveTabCb({
                            cmdName: cmdName,
                            cmdPluginName: cmdPluginName,
                            cmdArgs: matchOutput,
                        });
                        console.log(`transcript in closure ${transcript}`);
                        return _sendMsgToActiveTabCb({
                            liveText: {
                                text: niceOutput ? niceOutput : transcript,
                                isSuccess: true,
                            }
                        });
                    }, delay);
                    return _sendMsgToActiveTabCb({
                        liveText: {
                            text: transcript,
                            hold: true,
                        }
                    });
                } else {
                    return _sendMsgToActiveTabCb({
                        liveText: {
                            text: niceOutput ? niceOutput : transcript
                        }
                    });
                }
            }
            if (isFinal) {
                lastFinalTime = +new Date();
                if (confidence <= CT.CONFIDENCE_THRESHOLD) {
                    return _sendMsgToActiveTabCb({
                        liveText: {
                            text: transcript,
                            isUnsure: true
                        }
                    });
                }
            }
        }
    };

    return pub;
};