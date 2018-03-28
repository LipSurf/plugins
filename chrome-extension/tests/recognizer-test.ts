import * as sinon from 'sinon';
import anyTest, {TestInterface, ExecutionContext} from 'ava';

const path = require('path');
const fs = require('fs');

import { Recognizer, IRecognizedCallback, IRecognizedCmd } from "../src/background/recognizer";
import { PluginManager } from "../src/background/plugin-manager";
import { Store } from "../src/background/store";
import { PluginSandbox } from '../src/background/plugin-sandbox';
import { storage } from "../src/common/browser-interface";

const readFileSync = file_name => fs.readFileSync(file_name, { encoding: 'utf-8' });
const BASE_DIR = `${path.join(__dirname, '..', '..', '..', 'chrome-extension')}/`;
const PLUGINS_BROWSER = readFileSync(`${BASE_DIR}dist/plugins/browser.js`);
const PLUGINS_REDDIT = readFileSync(`${BASE_DIR}dist/plugins/reddit.js`);
const PLUGINS_GOOGLE = readFileSync(`${BASE_DIR}dist/plugins/google.js`);
const test = anyTest as TestInterface<{recg: Recognizer}>;


class Recognition {
    onresult;

    constructor() {

    }

    start() {

    }
};


test.before(async(t) => {
    let testSaveData:ILocalData = <ILocalData>{};
    let biSyncStorageLoad = sinon.stub(storage.sync, 'load');
    sinon.stub(storage.sync, 'registerOnChangeCb');
    let biLocalStorageLoad = sinon.stub(storage.local, 'load');
    let fetchPluginStub = sinon.stub(PluginManager, "fetchPluginCode");
    sinon.stub(storage.local, "save").callsFake((saveData:ILocalData) => Object.assign(testSaveData, saveData));
    biSyncStorageLoad.resolves(Store.DEFAULT_PREFERENCES);
    biLocalStorageLoad.resolves(testSaveData);
    fetchPluginStub.callsFake(async (pluginName:string) => {
        return eval(`PLUGINS_${pluginName.toUpperCase()}`)
    });

    let store = new Store(PluginManager.digestNewPlugin);
    await store.rebuildLocalPluginCache();
    let pluginManager = new PluginManager(store);
    let urlCb = (url: string) => null;
    let onUrlUpdate = () => urlCb;
    t.context.recg = new Recognizer(store, onUrlUpdate, Recognition);
    urlCb('https://www.reddit.com');
});

function testOutput(t:ExecutionContext<{recg: Recognizer}>, url:string, userInput: string, expectedCmd: string) {
    let selectedCmd = t.context.recg.getCmdForUserInput(userInput, url).cmdName;
    t.is(selectedCmd ? selectedCmd.toLowerCase() : selectedCmd, expectedCmd, selectedCmd);
}

function testNoOutput(t:ExecutionContext<{recg: Recognizer}>, url:string, userInput: string) {
    let cmdName = t.context.recg.getCmdForUserInput(userInput, url).cmdName;
    t.truthy(cmdName === undefined, `${userInput} -> ${cmdName}`);
}

let redditCmdToPossibleInput = {
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

for (let expectedCmd in redditCmdToPossibleInput) {
    let possibleUserInputs = redditCmdToPossibleInput[expectedCmd];
    for (let userInput of possibleUserInputs) {
        test(`"${userInput}" should execute expected ${expectedCmd}`, async (t) => {
            testOutput(t, 'https://www.reddit.com/', userInput, expectedCmd);
        });
    }
}

test('should not activate a command', async (t) => {
    for (let userInput of ['we are testing']) {
        testNoOutput(t, userInput, 'http://yahoo.com');
    }
});

test('shouldn\'t parse commands that don\'t match for page', async(t) => {
    let userInput = 'upvote';
    var {cmdName, matchOutput, delay} = t.context.recg.getCmdForUserInput(userInput, 'http://yahoo.com');
    t.is(cmdName, undefined);
});

test('should parse subreddit names without spaces', async (t) => {
    let userInput = 'go to r not the onion';
    var {cmdName, matchOutput, delay} = t.context.recg.getCmdForUserInput(userInput, 'http://www.reddit.com/');
    t.is(matchOutput[0], 'nottheonion', `${userInput} -> ${matchOutput}`);
});

test('should parse ordinals', async (t) => {
    let ordinalTests = {
        'upvote 1st': ['Upvote', 1],
        'preview 3rd': ['Expand', 3],
    };
    for (let input in ordinalTests) {
        let sel = t.context.recg.getCmdForUserInput(input, 'https://www.reddit.com');
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