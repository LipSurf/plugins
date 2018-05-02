import * as sinon from 'sinon';
import anyTest, {TestInterface, ExecutionContext} from 'ava';

const path = require('path');
const fs = require('fs');

import { Recognizer, IRecognizedCallback } from "../src/background/recognizer";
import { PluginManager } from "../src/background/plugin-manager";
import { Store } from "../src/background/store";
import { PluginSandbox } from '../src/background/plugin-sandbox';
import { storage } from "../src/common/browser-interface";
import { DEFAULT_PREFERENCES } from "../src/common/store-lib";
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
    biSyncStorageLoad.resolves(DEFAULT_PREFERENCES);
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
        let cmd = window[`${data.cmdPluginId}Plugin`].commands.find((cmd) => cmd.name === data.cmdName);
        if (typeof cmd.match === 'function')
            return cmd.match(data.text);
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
    let matchCmds = (await t.context.recg.getCmdsForUserInput(userInput, url));
    t.is(matchCmds.length, 1);
    let selectedCmd = matchCmds ? matchCmds[0].cmdName.toLowerCase() : null;
    t.is(selectedCmd, expectedCmd, selectedCmd);
}

async function testNoOutput(t:ExecutionContext<{recg: Recognizer}>, url:string, userInput: string) {
    let matchCmds = await t.context.recg.getCmdsForUserInput(userInput, url);
    t.is(matchCmds.length, 0, `${userInput} -> ${JSON.stringify(matchCmds)}`);
}

let redditCmdToPossibleInput = {
    'collapse': ['shrink', 'shrink 1st', 'collapse 25', 'collapse'],
    'expand': ['expand 1st', 'first expand', 'expand twelfe', 'expand eight', 'expand'],
    'go back': ['back', 'go back', 'navigate back', 'navigate backwards', 'backwards', 'backward', 'go backwards'],
    'go forward': ['forward', 'go forward', 'forwards'],
    'go to subreddit': ['go to our testing', 'are funny',
            'our world news', 'are worldnews'],
    'go to reddit': ['reddit', 'go to reddit', 'reddit dot com', 'reddit.com'],
    'next tab': ['next app', 'next time'],
    'expand all comments': ['expand all', 'expand all comments'],
    'scroll top': ['top', 'scroll top', 'scrolltop'],
    'scroll bottom': ['bottom', 'scroll bottom'],
    'unfullscreen video': ['unfullscreen', 'un fullscreen', 'unfull screen'],
}

for (let expectedCmd in redditCmdToPossibleInput) {
    let possibleUserInputs = redditCmdToPossibleInput[expectedCmd];
    for (let userInput of possibleUserInputs) {
        test(`"${userInput}" should execute expected ${expectedCmd}`, async (t) => {
            await testOutput(t, 'https://www.reddit.com/', userInput, expectedCmd);
        });
    }
}

test('should not activate a command for non-command input', async (t) => {
    for (let userInput of ['we are testing']) {
        await testNoOutput(t, userInput, 'http://yahoo.com');
    }
});

test('shouldn\'t parse commands that don\'t match for page', async(t) => {
    let matchCmds = (await t.context.recg.getCmdsForUserInput('upvote', 'http://yahoo.com'));
    t.is(matchCmds.length, 0);
});

test('should execute plugin global commands everywhere', async(t) => {
    let cmdObj = await t.context.recg.getCmdsForUserInput('reddit', 'http://yahoo.com');
    t.is(cmdObj.length, 1);
    t.is(cmdObj[0].cmdName.toLowerCase(), 'go to reddit');
});

test('should parse subreddit names without spaces', async (t) => {
    let userInput = 'go to r not the onion';
    let {cmdName, matchOutput, delay} = (await t.context.recg.getCmdsForUserInput(userInput, 'http://www.reddit.com/'))[0];
    console.log(`cmdName: ${cmdName} matchOutput: ${matchOutput}, delay: ${delay}`);
    t.is(matchOutput[0], 'nottheonion', `${userInput} -> ${matchOutput}`);
});

test('should parse ordinals (upvote, expand)', async (t) => {
    let ordinalTests = {
        'upvote 1st': ['Upvote', 1],
        'expand 3rd': ['Expand', 3],
        '4th expand': ['Expand', 4],
    };
    for (let input in ordinalTests) {
        let sel = (await t.context.recg.getCmdsForUserInput(input, 'https://www.reddit.com'))[0];
        t.is(sel.cmdName, ordinalTests[input][0]);
        t.is(sel.matchOutput[0], ordinalTests[input][1]);
    }
});

test('test homophones', async(t) => {
    let recg = t.context.recg as any;
    let homoIt:IterableIterator<string> = recg.generateHomophones("next app");

    let homos = [];
    for (let homo = homoIt.next().value; homo; homo = homoIt.next().value) {
        homos.push(homo);
    }

    t.true(homos.indexOf("next tab") !== -1);
});

// test.cb('should only execute last input', (t) => {
//     let seq = ['click', '16', 'click', 'click 16'];
//     t.context.recg.start((req) => {
//         if (req.cmdName === 'Visit Post' && req.cmdArgs[0] === 16) {
//             t.end()
//         }
//     });
//     seq.forEach((transcript, i) => setTimeout(() => t.context.recg.handleTranscript(transcript, 0.2, i == 4), i * 100));
// });
