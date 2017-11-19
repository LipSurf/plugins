'use strict';
const assert = require('assert');
const jsdom = require('jsdom');
const fs = require('fs');
const _ = require('lodash');
const path = require('path');
const BASE_DIR = `${path.dirname(__dirname)}/chrome-extension/`;

const readFileSync = file_name => fs.readFileSync(file_name, { encoding: 'utf-8' });

const rnh_cs = readFileSync(`${BASE_DIR}src/rnh-cs.js`);
const jQuery = readFileSync(`${BASE_DIR}vendor/jquery-3.2.1.min.js`);
const { JSDOM } = jsdom;

const plugins_browser = readFileSync(`${BASE_DIR}plugins/browser.js`);
const plugins_reddit = readFileSync(`${BASE_DIR}plugins/reddit.js`);


function attachScript(dom, scriptContent) {
    var scriptEl = dom.window.document.createElement("script");
    scriptEl.textContent = scriptContent;
    dom.window.document.body.appendChild(scriptEl);
}


describe('Recognizer tests', function() {
    var recg;
    var _cmdRecognizedCb = () => null;
    var cmdRecognizedCb = (request) => { _cmdRecognizedCb(request); };

    let cmdToPossibleInput = {
        'collapse': ['shrink', 'shrink 1st', 'collapse 25', 'collapse'],
        'expand': ['expand 1st', 'first expand', 'preview twelfe', 'preview eight', 'expand', 'preview'],
        'go back': ['back', 'go back', 'navigate back', 'navigate backwards', 'backwards', 'backward', 'go backwards'],
        'go forward': ['forward', 'go forward', 'forwards'],
        'go to subreddit': ['go to our testing', 'are funny',
                'our world news', 'r worldnews'],
        'go to reddit': ['reddit', 'home'],
        'scroll top': ['top', 'scroll top', 'scrolltop'],
        'scroll bottom': ['bottom', 'scroll bottom'],
    }

    function testOutput(userInput, expectedCmd) {
        let selectedCmd = recg._getCmdForUserInput(userInput).cmdName;
        assert.equal(selectedCmd ? selectedCmd.toLowerCase() : selectedCmd, expectedCmd, selectedCmd);
    }

    function testNoOutput(userInput) {
        var cmdName = recg._getCmdForUserInput(userInput).cmdName;
        assert.ok(cmdName === undefined, `${userInput} -> ${cmdName}`);
    }

    // runs once (as opposed to beforeEach)
    before(function (done) {
        let wasError = false;
        var lodash = require(`${BASE_DIR}vendor/lodash.min.js`);
        var constants = require(`${BASE_DIR}src/constants.js`).CT;
        var chrome = {
            browserAction: {
                setIcon: () => null,
                onClicked: {
                    addListener: () => null,
                }
            },
            tabs: {
                onActivated: {
                    addListener: () => null,
                },
                query: () => null,
            },
            runtime: {
                onMessage: {
                    addListener: () => null,
                }
            },
            storage: {
                sync: {
                    get: function(key, cb) {
                        return cb({});
                    },
                    set: function(key, cb) {
                        cb();
                    }
                }
            }
        };
        var util = require(`${BASE_DIR}src/util.js`).Util({
            chrome: chrome,
            _: lodash,
            CT: constants
        });
        var plugin_sandbox = require(`${BASE_DIR}src/plugin-sandbox.js`).PS({
            chrome: chrome,
            _: lodash,
            Util: util
        });
        constants.COOLDOWN_TIME = 0;
        constants.FINAL_COOLDOWN_TIME = 0;
        var PM = require(`${BASE_DIR}src/plugin-manager.js`).PM({
            chrome: chrome,
            _: lodash,
            CT: constants,
            PS: plugin_sandbox,
        });
        PM._getPlugin = (pluginName) => new Promise((resolve) => resolve(eval(`(function() { ${eval(`plugins_${pluginName}`)} })()`)));
        recg = require(`${BASE_DIR}src/recognizer.js`).Recognizer({
            CT: constants,
            _: lodash,
            webkitSpeechRecognition: function() {return {start: () => null}},
        });

        PM.loadPlugins().then((res) => {
            var cmds = res[0];
            var homos = res[1];
            recg.setPlugins(cmds, homos);
            done();
        });

        recg.start({
            cmdRecognizedCb: cmdRecognizedCb,
        });
    });

    for (let expectedCmd in cmdToPossibleInput) {
        let possibleUserInputs = cmdToPossibleInput[expectedCmd];
        for (let userInput of possibleUserInputs) {
            it(`"${userInput}" should execute expected ${expectedCmd}`, function() {
                testOutput(userInput, expectedCmd);
            });
        }
    }


    it('should not activate a command', function() {
        for (let userInput of ['we are testing']) {
            testNoOutput(userInput);
        }
    });

    it('should parse subreddit names without spaces', function() {
        let userInput = 'go to r not the onion';
        var {cmdName, matchOutput, delay} = recg._getCmdForUserInput(userInput);
        assert.ok(matchOutput === 'nottheonion', `${userInput} -> ${matchOutput}`);
    });

    it('should parse ordinals', function() {
        let ordinalTests = {
            'upvote 1st': ['Upvote', '1'],
            'preview 3rd': ['Expand', '3'],
        };
        for (let input in ordinalTests) {
            let sel = recg._getCmdForUserInput(input);
            assert.equal(sel.cmdName, ordinalTests[input][0]);
            assert.equal(sel.matchOutput, ordinalTests[input][1]);
        }
    });

    it('should only execute last input', function(cb) {
        let seq = _(['click', '16', 'click', 'click 16']);
        _cmdRecognizedCb = function(request) {
            console.log('a command was called');
            if (request.cmdName) {
                cb();
            }
        };
        seq.each((val, i) => setTimeout(() => recg._handleTranscript({isFinal: i == 4, confidence: 0.2, transcript: val}), i * 100));
    });

});

describe('rnh tests', function() {
    var window;
    var bg;
    var recg;

    before(function (done) {
        let wasError = false;
        var lodash = require(`${BASE_DIR}vendor/lodash.min.js`);
        var constants = require(`${BASE_DIR}src/constants.js`).CT;
        var chrome = {
            browserAction: {
                setIcon: () => null,
                onClicked: {
                    addListener: () => null,
                }
            },
            tabs: {
                onActivated: {
                    addListener: () => null,
                },
                query: () => null,
            },
            runtime: {
                onMessage: {
                    addListener: () => null,
                }
            },
            storage: {
                sync: {
                    get: function(key, cb) {
                        return cb({cmdGroups: [plugins_browser, plugins_reddit].map((x) => eval(`(function() { ${x} })()`))});
                    }
                }
            }
        }
        constants.COOLDOWN_TIME = 0;
        constants.FINAL_COOLDOWN_TIME = 0;
        var pm = require(`${BASE_DIR}src/plugin-manager.js`).PM({
            chrome: chrome,
            CT: constants
        });
        recg = require(`${BASE_DIR}src/recognizer.js`).Recognizer({
            CT: constants,
            _: lodash,
        });
        bg = require(`${BASE_DIR}src/background.js`).Background({
            chrome: chrome,
            _: lodash,
            CT: constants,
            PM: pm,
            Recognizer: recg
        });

        JSDOM.fromFile("tests/mock.html", {
            runScripts: 'dangerously',
        }).then(dom => {
            attachScript(dom, jQuery);
            dom.window.eval(`
                var chrome = {
                    runtime: {
                        onMessage: {
                            addListener: () => {},
                        },
                        sendMessage: () => {},
                    }
                }
            `);
            window = dom.window;
            window.onerror = function(messageOrEvent, source, lineno, colno, error) {
                wasError = true;
                done(error);
            };
            attachScript(dom, rnh_cs);
            if (!wasError) {
                done();
            }
        });
    });

});
