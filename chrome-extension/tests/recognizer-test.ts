import * as sinon from 'sinon';
import anyTest, {TestInterface, ExecutionContext} from 'ava';

const path = require('path');
const fs = require('fs');

import { Recognizer, IRecognizedCallback, IRecognizedCmd } from "../src/background/recognizer";
import { PluginManager } from "../src/background/plugin-manager";
import { Store } from "../src/background/store";
import { PluginSandbox } from '../src/background/plugin-sandbox';
import { storage } from "../src/common/browser-interface";
var {PluginBase} = require("../src/common/plugin-lib");

const BASE_DIR = `${path.join(__dirname, '..', '..', '..', 'chrome-extension')}/`;
const getPlugin = (pluginId:string) => fs.readFileSync(`${BASE_DIR}dist/plugins/${pluginId.toLowerCase()}.js`, { encoding: 'utf-8' });
const test = anyTest as TestInterface<{
    recg: Recognizer,
    urlUpdate: (string) => void,
}>;


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
    let evalPluginsStub = sinon.stub(PluginManager, "evalPluginCode");
    sinon.stub(storage.local, "save").callsFake((saveData:ILocalData) => Object.assign(testSaveData, saveData));
    biSyncStorageLoad.resolves(Store.DEFAULT_PREFERENCES);
    biLocalStorageLoad.resolves(testSaveData);
    fetchPluginStub.callsFake(async (pluginId:string) => getPlugin(pluginId));
    evalPluginsStub.callsFake((function (id:string, text:string) {
        let plugin;
        let window = {};
        let $ = () => { return {ready: () => null}};
        eval(`${text}; plugin = window.${id}Plugin;`);
        return plugin;
    }).bind(PluginManager));

    let store = new Store(PluginManager.digestNewPlugin);
    await store.rebuildLocalPluginCache();
    let pluginManager = new PluginManager(store);
    t.context.urlUpdate = (url: string) => null;
    let queryActiveTab = async () => (<chrome.tabs.Tab>{id: 1});
    let sendMsgToActiveTab = (tabId:number, data:ITranscriptParcel) => {
        // get the match function for a plugin
        let window = {};
        let plugin = eval(getPlugin(data.cmdPluginId));
        return window[`${data.cmdPluginId}Plugin`].commands.find((cmd) => cmd.name === data.cmdName).match(data.processedInput)
    };
    t.context.recg = new Recognizer(store, 
        t.context.urlUpdate, 
        queryActiveTab, 
        sendMsgToActiveTab,
        Recognition
    );
    t.context.urlUpdate('https://www.reddit.com');
});

async function testOutput(t:ExecutionContext<{recg: Recognizer}>, url:string, userInput: string, expectedCmd: string) {
    let selectedCmd = (await t.context.recg.getCmdForUserInput(userInput, url)).cmdName;
    t.is(selectedCmd ? selectedCmd.toLowerCase() : selectedCmd, expectedCmd, selectedCmd);
}

async function testNoOutput(t:ExecutionContext<{recg: Recognizer}>, url:string, userInput: string) {
    let cmdName = (await t.context.recg.getCmdForUserInput(userInput, url)).cmdName;
    t.truthy(cmdName === undefined, `${userInput} -> ${cmdName}`);
}

let redditCmdToPossibleInput = {
    'collapse': ['shrink', 'shrink 1st', 'collapse 25', 'collapse'],
    'expand': ['expand 1st', 'first expand', 'preview twelfe', 'preview eight', 'expand', 'preview'],
    'go back': ['back', 'go back', 'navigate back', 'navigate backwards', 'backwards', 'backward', 'go backwards'],
    'go forward': ['forward', 'go forward', 'forwards'],
    'go to subreddit': ['go to our testing', 'are funny',
            'our world news', 'are worldnews'],
    'go to reddit': ['reddit', 'go to reddit', 'reddit dot com', 'reddit.com'],
    'scroll top': ['top', 'scroll top', 'scrolltop'],
    'scroll bottom': ['bottom', 'scroll bottom'],
    'unfullscreen': ['unfullscreen', 'un fullscreen', 'unfull screen'],
}

for (let expectedCmd in redditCmdToPossibleInput) {
    let possibleUserInputs = redditCmdToPossibleInput[expectedCmd];
    for (let userInput of possibleUserInputs) {
        test(`"${userInput}" should execute expected ${expectedCmd}`, async (t) => {
            await testOutput(t, 'https://www.reddit.com/', userInput, expectedCmd);
        });
    }
}

test('should not activate a command', async (t) => {
    for (let userInput of ['we are testing']) {
        await testNoOutput(t, userInput, 'http://yahoo.com');
    }
});

test('shouldn\'t parse commands that don\'t match for page', async(t) => {
    let userInput = 'upvote';
    let {cmdName, matchOutput, delay} = await t.context.recg.getCmdForUserInput(userInput, 'http://yahoo.com');
    t.is(cmdName, undefined);
});

test('should parse subreddit names without spaces', async (t) => {
    let userInput = 'go to r not the onion';
    let {cmdName, matchOutput, delay} = await t.context.recg.getCmdForUserInput(userInput, 'http://www.reddit.com/');
    console.log(`cmdName: ${cmdName} matchOutput: ${matchOutput}, delay: ${delay}`);
    t.is(matchOutput[0], 'nottheonion', `${userInput} -> ${matchOutput}`);
});

test('should parse ordinals', async (t) => {
    let ordinalTests = {
        'upvote 1st': ['Upvote', 1],
        'preview 3rd': ['Expand', 3],
    };
    for (let input in ordinalTests) {
        let sel = await t.context.recg.getCmdForUserInput(input, 'https://www.reddit.com');
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
