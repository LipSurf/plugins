import * as sinon from 'sinon';
import anyTest, {TestInterface} from 'ava';

const path = require('path');
const fs = require('fs');

import { Recognizer, IRecognizedCallback, IRecognizedCmd } from "../src/background/recognizer";
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
    let fetchPluginStub = sinon.stub(PluginManager, "fetchPluginCode");
    fetchPluginStub.callsFake(async (pluginName:string) => {
        return eval(`PLUGINS_${pluginName.toUpperCase()}`)
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

test.cb('should only execute last input', (t) => {
    let seq = ['click', '16', 'click', 'click 16'];
    t.context.recg.start((req: IRecognizedCmd) => {
        if (req.cmdName === 'Visit Post' && req.cmdArgs[0] === 16) {
            t.end()
        }
    });
    seq.forEach((transcript, i) => setTimeout(() => t.context.recg.handleTranscript(transcript, i == 4, 0.2), i * 100));
});