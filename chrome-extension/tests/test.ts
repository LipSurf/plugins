import * as sinon from 'sinon';
import anyTest, {TestInterface} from 'ava';

const path = require('path');
const fs = require('fs');

import { Recognizer } from "../src/background/recognizer";
import { PluginManager } from "../src/background/plugin-manager";
import { Store } from "../src/background/store";
import { Preferences } from "../src/background/preferences";
import { PluginSandbox } from '../src/background/plugin-sandbox';
import { storage } from "../src/common/browser-interface";

const readFileSync = file_name => fs.readFileSync(file_name, { encoding: 'utf-8' });
const BASE_DIR = `${path.join(__dirname, '..', '..', '..', 'chrome-extension')}/`;
const PLUGINS_BROWSER = readFileSync(`${BASE_DIR}dist/plugins/browser.js`);
const PLUGINS_REDDIT = readFileSync(`${BASE_DIR}dist/plugins/reddit.js`);
const test = anyTest as TestInterface<{recg: Recognizer}>;


class Recognition {
    onresult;

    constructor() {

    }

    start() {

    }
};


test.before(async(t) => {
    sinon.stub(storage.local, "save").resolves();
    let store = new Store();
    let preferences = new Preferences();
    let loadStub = sinon.stub(preferences, 'load');
    loadStub.resolves(Preferences.DEFAULT_PREFERENCES);
    let fetchPluginStub = sinon.stub(PluginManager, "_fetchPluginCode");
    fetchPluginStub.callsFake(async (pluginName:string) => {
        let exports = {};
        eval(eval(`PLUGINS_${pluginName.toUpperCase()}`));
        return exports[`${pluginName}Plugin`];
    });

    let pluginManager = new PluginManager(store, preferences);
    t.context.recg = new Recognizer(Recognition, store);
});

function testOutput(t, userInput: string, expectedCmd: string) {
    let selectedCmd = t.context.recg.getCmdForUserInput(userInput).cmdName;
    t.is(selectedCmd ? selectedCmd.toLowerCase() : selectedCmd, expectedCmd, selectedCmd);
}

function testNoOutput(t, userInput: string) {
    let cmdName = t.context.recg.getCmdForUserInput(userInput).cmdName;
    t.truthy(cmdName === undefined, `${userInput} -> ${cmdName}`);
}

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
    'unfullscreen': ['unfullscreen', 'un fullscreen', 'unfull screen'],
}

for (let expectedCmd in cmdToPossibleInput) {
    let possibleUserInputs = cmdToPossibleInput[expectedCmd];
    for (let userInput of possibleUserInputs) {
        test(`"${userInput}" should execute expected ${expectedCmd}`, async (t) => {
            testOutput(t, userInput, expectedCmd);
        });
    }
}

test('should not activate a command', async (t) => {
    for (let userInput of ['we are testing']) {
        testNoOutput(t, userInput);
    }
});

test('should parse subreddit names without spaces', async (t) => {
    let userInput = 'go to r not the onion';
    var {cmdName, matchOutput, delay} = t.context.recg.getCmdForUserInput(userInput);
    t.is(matchOutput[0], 'nottheonion', `${userInput} -> ${matchOutput}`);
});

test('should parse ordinals', async (t) => {
    let ordinalTests = {
        'upvote 1st': ['Upvote', 1],
        'preview 3rd': ['Expand', 3],
    };
    for (let input in ordinalTests) {
        let sel = t.context.recg.getCmdForUserInput(input);
        t.is(sel.cmdName, ordinalTests[input][0]);
        t.is(sel.matchOutput[0], ordinalTests[input][1]);
    }
});

    //// it('should only execute last input', function(cb) {
    ////     let seq = _(['click', '16', 'click', 'click 16']);
    ////     _cmdRecognizedCb = function(request) {
    ////         console.log('a command was called');
    ////         if (request.cmdName) {
    ////             cb();
    ////         }
    ////     };
    ////     seq.each((val, i) => setTimeout(() => recg.handleTranscript({isFinal: i == 4, confidence: 0.2, transcript: val}), i * 100));
    //// });


//'use strict';
//const jsdom = require('jsdom');
//const fs = require('fs');
//const _ = require('lodash');

//import * as TypeMoq from "typemoq";

//// attachable shits
//const RNH_CS = readFileSync(`${BASE_DIR}dist/content-scripts/rnh-cs.js`);
//const VENDOR_JQUERY = readFileSync(`${BASE_DIR}vendor/jquery-3.2.1.min.js`);
//const { JSDOM } = jsdom;


//function attachScript(dom, scriptContent) {
    //var scriptEl = dom.window.document.createElement("script");
    //scriptEl.textContent = scriptContent;
    //dom.window.document.body.appendChild(scriptEl);
//}


//describe('Recognizer tests', function() {
    //var recg: Recognizer;
    //var _cmdRecognizedCb = (req) => null;
    //var cmdRecognizedCb = (request) => { _cmdRecognizedCb(request); };

    //// runs once (as opposed to beforeEach)
    //before(async function (done) {
        ////let wasError = false;
        ////var lodash = require(`${BASE_DIR}vendor/lodash.min.js`);
        ////var constants = require(`${BASE_DIR}src/constants.js`).CT;
        ////var chrome = {
            ////browserAction: {
                ////setIcon: () => null,
                ////onClicked: {
                    ////addListener: () => null,
                ////}
            ////},
            ////tabs: {
                ////onActivated: {
                    ////addListener: () => null,
                ////},
                ////query: () => null,
            ////},
            ////runtime: {
                ////onMessage: {
                    ////addListener: () => null,
                ////}
            ////},
            ////storage: {
                ////sync: {
                    ////get: function(key, cb) {
                        ////return cb({});
                    ////},
                    ////set: function(key, cb) {
                        ////cb();
                    ////}
                ////}
            ////}
        ////};
        ////var util = require(`${BASE_DIR}src/util.js`).Util({
            ////chrome: chrome,
            ////_: lodash,
            ////CT: constants
        ////});
        ////var plugin_sandbox = require(`${BASE_DIR}src/plugin-sandbox.js`).PS({
            ////chrome: chrome,
            ////_: lodash,
            ////Util: util
        ////});
        ////constants.COOLDOWN_TIME = 0;
        ////constants.FINAL_COOLDOWN_TIME = 0;
        ////var PM = require(`${BASE_DIR}src/plugin-manager.js`).PM({
            ////chrome: chrome,
            ////_: lodash,
            ////CT: constants,
            ////PS: plugin_sandbox,
        ////});
        ////PM._getPlugin = (pluginName) => new Promise((resolve) => resolve(eval(`(function() { ${eval(`plugins_${pluginName}`)} })()`)));
        ////recg = require(`${BASE_DIR}src/recognizer.js`).Recognizer({
            ////CT: constants,
            ////_: lodash,
            ////webkitSpeechRecognition: function() {return {start: () => null}},
        ////});

        ////PM.loadPlugins().then((res) => {
            ////var cmds = res[0];
            ////var homos = res[1];
            ////recg.setPlugins(cmds, homos);
            ////done();
        ////});

        ////recg.start({
            ////cmdRecognizedCb: cmdRecognizedCb,
        ////});
    //});


//});

////describe('rnh tests', function() {
    ////var window;
    ////var bg;
    ////var recg;

    ////before(function (done) {
        ////let wasError = false;
        ////var lodash = require(`${BASE_DIR}vendor/lodash.min.js`);
        ////var constants = require(`${BASE_DIR}src/constants.js`).CT;
        ////var chrome = {
            ////browserAction: {
                ////setIcon: () => null,
                ////onClicked: {
                    ////addListener: () => null,
                ////}
            ////},
            ////tabs: {
                ////onActivated: {
                    ////addListener: () => null,
                ////},
                ////query: () => null,
            ////},
            ////runtime: {
                ////onMessage: {
                    ////addListener: () => null,
                ////}
            ////},
            ////storage: {
                ////sync: {
                    ////get: function(key, cb) {
                        ////return cb({cmdGroups: [plugins_browser, plugins_reddit].map((x) => eval(`(function() { ${x} })()`))});
                    ////}
                ////}
            ////}
        ////}
        ////constants.COOLDOWN_TIME = 0;
        ////constants.FINAL_COOLDOWN_TIME = 0;
        ////var pm = require(`${BASE_DIR}src/plugin-manager.js`).PM({
            ////chrome: chrome,
            ////CT: constants
        ////});
        ////recg = require(`${BASE_DIR}src/recognizer.js`).Recognizer({
            ////CT: constants,
            ////_: lodash,
        ////});
        ////bg = require(`${BASE_DIR}src/background.js`).Background({
            ////chrome: chrome,
            ////_: lodash,
            ////CT: constants,
            ////PM: pm,
            ////Recognizer: recg
        ////});

        ////JSDOM.fromFile("tests/mock.html", {
            ////runScripts: 'dangerously',
        ////}).then(dom => {
            ////attachScript(dom, VENDOR_JQUERY);
            ////dom.window.eval(`
                ////var chrome = {
                    ////runtime: {
                        ////onMessage: {
                            ////addListener: () => {},
                        ////},
                        ////sendMessage: () => {},
                    ////}
                ////}
            ////`);
            ////window = dom.window;
            ////window.onerror = function(messageOrEvent, source, lineno, colno, error) {
                ////wasError = true;
                ////done(error);
            ////};
            ////attachScript(dom, RNH_CS);
            ////if (!wasError) {
                ////done();
            ////}
        ////});
    ////});

////});
