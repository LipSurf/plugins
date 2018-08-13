import * as sinon from 'sinon';
import anyTest, {TestInterface, ExecutionContext} from 'ava';

const path = require('path');
const fs = require('fs');

import { Recognizer, IRecognizedCallback } from "../src/background/recognizer";
import { PluginManager } from "../src/background/plugin-manager";
import { Store } from "../src/background/store";
import { PluginSandbox } from '../src/background/plugin-sandbox';
import { storage } from "../src/common/browser-interface";
import { ILocalData, } from "../src/common/store-lib";
import { instanceOfDynamicMatch, } from "../src/common/util";
import { BlankPlugin } from "../src/common/plugin-lib";
// used dynamically when Plugins are eval'd
const PluginBase = BlankPlugin;

const BASE_DIR = `${path.join(__dirname, '..', )}/`;
const getPlugin = (pluginId:string) => fs.readFileSync(`${BASE_DIR}plugins/build/${pluginId.toLowerCase()}.js`, { encoding: 'utf-8' });
type SharedTestData = {
    recg: Recognizer,
    store: Store,
    urlUpdate: (string) => void,
}
const test = anyTest as TestInterface<SharedTestData>;
type EC = ExecutionContext<SharedTestData>;


// Stub for HTML5 SpeechRecognition
class SpeechRecognition {
    onresult;
    constructor() { }
    start() { }
};


test.before(async(t) => {
    let testSaveData:ILocalData = <ILocalData>{};
    let biSyncStorageLoad = sinon.stub(storage.sync, 'load');
    sinon.stub(storage.sync, 'registerOnChangeCb');
    sinon.stub(storage.local, 'registerOnChangeCb');
    let biLocalStorageLoad = sinon.stub(storage.local, 'load');
    let fetchPluginStub = sinon.stub(PluginManager, "fetchPluginCode");
    sinon.stub(storage.local, "save").callsFake((saveData:ILocalData) => Object.assign(testSaveData, saveData));
    biSyncStorageLoad.resolves({});
    biLocalStorageLoad.resolves(testSaveData);
    fetchPluginStub.callsFake(async (pluginId:string) => getPlugin(pluginId));

    let store = new Store(PluginManager.digestNewPlugin);
    await store.rebuildLocalPluginCache();
    t.context.store = store;
    t.context.urlUpdate = (url: string) => null;
    let pluginManager = new PluginManager(store);
    let queryActiveTab = async () => (<chrome.tabs.Tab>{id: 1});
    let sendMsgToActiveTab = async (tabId:number, data:ITranscriptParcel) => {
        // get the match function for a plugin
        let plugin;
        let name = `${data.cmdPluginId}`;
        eval(`${getPlugin(data.cmdPluginId)}; plugin = ${name}Plugin`);
        let cmd:IPluginDefCommand = plugin.Plugin.commands.find((cmd) => cmd.name === data.cmdName);
        console.log(`data.text ${data.text}`);
        if (data.cmdName.toLowerCase() === 'click' && data.text === 'z1') 
            return ['z1'];
        if (instanceOfDynamicMatch(cmd.match))
            return await cmd.match.fn(data.text);
    };
    t.context.recg = new Recognizer(store,
        queryActiveTab,
        sendMsgToActiveTab,
        SpeechRecognition
    );
    t.context.urlUpdate('https://www.reddit.com');
});

async function testOutput(t:EC, url:string, userInput: string, expectedCmds: string[], recg=t.context.recg) {
    let matchCmds = (await recg.getCmdsForUserInput(userInput, url, async (cmdPluginId, cmdName, text) => {
        // TODO: this should execute the match fn for the command
        // ... or should we just use the test fns for the plugin to test that?
        if (cmdPluginId.toLowerCase() === 'reddit' && cmdName.toLowerCase() == 'go to subreddit' && ~text.indexOf('go to r')) {
            console.log(`${cmdPluginId} ${cmdName} ${text}`);
            return [];
        }
    }));
    t.is(matchCmds.length, expectedCmds.length, `matchCmds: ${matchCmds.map(x => x.cmdName)}`);
    for (let i = 0; i < expectedCmds.length; i++) {
        t.is(matchCmds[i].cmdName.toLowerCase(), expectedCmds[i]);
    }
}

async function testNoOutput(t:EC, url:string, userInput: string) {
    let matchCmds = await t.context.recg.getCmdsForUserInput(userInput, url, async () => null);
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
    // 'unfullscreen video': ['unfullscreen', 'un fullscreen', 'unfull screen'],
}

for (let expectedCmd in redditCmdToPossibleInput) {
    let possibleUserInputs = redditCmdToPossibleInput[expectedCmd];
    for (let userInput of possibleUserInputs) {
        test(`"${userInput}" should execute expected ${expectedCmd}`, async (t) => {
            await testOutput(t, 'https://www.reddit.com/', userInput, [expectedCmd]);
        });
    }
}

test('should not activate a command for non-command input', async (t) => {
    for (let userInput of ['we are testing']) {
        await testNoOutput(t, userInput, 'http://yahoo.com');
    }
});

test('shouldn\'t parse commands that don\'t match for page', async(t) => {
    let matchCmds = (await t.context.recg.getCmdsForUserInput('upvote', 'http://yahoo.com', () => null));
    t.is(matchCmds.length, 0);
});

test('should execute plugin global commands everywhere', async(t) => {
    let cmdObj = await t.context.recg.getCmdsForUserInput('reddit', 'http://yahoo.com', () => null);
    t.is(cmdObj.length, 1);
    t.is(cmdObj[0].cmdName.toLowerCase(), 'go to reddit');
});

test('should parse subreddit names without spaces', async (t) => {
    let userInput = 'go to r not the onion';
    let {cmdName, matchOutput, delay} = (await t.context.recg.getCmdsForUserInput(userInput, 'http://www.reddit.com/', () => null))[0];
    console.log(`cmdName: ${cmdName} matchOutput: ${matchOutput}, delay: ${delay}`);
    t.is(matchOutput[0], 'nottheonion', `${userInput} -> ${matchOutput}`);
});

test('should parse ordinals with homophones', async(t) => {
    let sel = (await t.context.recg.getCmdsForUserInput('expand for', 'https://www.reddit.com', async () => null))[0];
    t.is(sel.cmdName, 'Expand');
    t.is(sel.matchOutput[0], 4);
});

test('should parse ordinals (upvote, expand)', async (t) => {
    let ordinalTests = {
        'upvote 1st': ['Upvote', 1],
        'expand 3rd': ['Expand', 3],
        '4th expand': ['Expand', 4],
    };
    for (let input in ordinalTests) {
        let sel = (await t.context.recg.getCmdsForUserInput(input, 'https://www.reddit.com', async () => null))[0];
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

// doesn't include handleTranscript extra massaging
test('getCmds chaining w/ different commands', async (t:EC) => {
    await testOutput(t, 'https://www.google.com', 'new tab down', ['new tab', 'scroll down']);
});

test('getCmds chaining w/ same command', async (t:EC) => {
    await testOutput(t, 'https://www.google.com', 'down down', ['scroll down', 'scroll down']);
});

// includes the extra massaging by handleTranscript
// test('End-to-end chaining ')

test('dynamic match chaining', async (t:EC) => {
    // let pluginManager = new PluginManager(t.context.store);
    // let queryActiveTab = async () => (<chrome.tabs.Tab>{id: 1});
    // let sendMsgToActiveTab = async (tabId:number, data:ITranscriptParcel) => {
    //     // get the match function for a plugin
    //     let plugin;
    //     let name = `${data.cmdPluginId}`;
    //     if (data.text === 'z1') {
    //         return ['z1'];
    //     }
    // };
    // let recg = new Recognizer(t.context.store,
    //     t.context.urlUpdate,
    //     queryActiveTab,
    //     sendMsgToActiveTab,
    //     SpeechRecognition
    // );
    // t.context.urlUpdate('https://www.google.com');
    await testOutput(t, 'https://www.google.com', 'z1 down', ['click', 'scroll down']);
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
