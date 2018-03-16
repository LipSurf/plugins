/*
 * Test all the plugin code
 * Use 1920x1076 resolution on the VM
 */
import anyTest, {TestInterface} from 'ava';
import {Browser, By, Builder, until, Key, WebDriver } from 'selenium-webdriver';
import * as chrome from 'selenium-webdriver/chrome';
import * as _ from 'lodash';
import { readFile } from 'fs';
import { spawnSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const gtts = require('node-gtts')('en');


const test = anyTest as TestInterface<{
    driver: WebDriver,
    bot: IBot,
}>;
const readFileSync = file_name => fs.readFileSync(file_name, { encoding: 'utf-8' });
const timeout = ms => new Promise(res => setTimeout(res, ms));
const MAX_TRIES_PER_TEST = 3;
const BLACKLISTED_PHRASES = [];
const WHITELISTED_PHRASES = [
    'bottom of page',
    'scroll little down',
    'top',
    'little scroll up',
    'up little',
    'scroll up',
    'new tab',
    'open tab',
];
const REAL_AUDIO = false;
const DEBUG = false;

var builder = new Builder()
    .forBrowser('chrome')
    // @ts-ignore: we know this shit works
    .setChromeOptions(new chrome.Options()
        .addArguments("user-data-dir=/home/lubuntu/.config/google-chrome/Default")
        .addArguments(`--load-extension=/media/sf_no-hands-man/chrome-extension`));
        // .addExtensions("/media/sf_no-hands-man/no-hands-man.crx"));

var pluginFilePaths = process.env.PLUGINS ? process.env.PLUGINS.split(',') : [];


function moveMouse(x:number, y:number) {
    console.debug(`Moving mouse ${x} ${y}`);
    spawnSync('xdotool', ['mousemove', '--sync', x.toString(), y.toString()]);
}


function clickMouse(x:number, y:number) {
    console.debug("Clicking mouse...");
    spawnSync('xdotool', ['mousemove', '--sync', x.toString(), y.toString(), 'click', '1']);
}


function toggleExtension(active=true) {
    // extension button
    clickMouse(904, 66);
}


function pressKeys(keys) {
    console.debug(`Pressing keys ${keys}`);
    spawnSync('xdotool', ['key', keys]);
}


function typeKeys(keys) {
    console.debug(`Typing keys ${keys}`);
    spawnSync('xdotool', ['type', keys]);
}


interface IBot {
    say(phrase: string): Promise<void>,
}


class MockedRecognizerBot implements IBot {
    constructor(private driver) {
    }
    async say(phrase) {
        // can be adjusted to change the speed of the tests
        await timeout(1000);
        await this.driver.executeScript(`window.postMessage({test_probe: true, cmd: 'recg.handleTranscript("${phrase}", false, 0.99)'}, '*');`);
    }
}


class AudioPlayingBot implements IBot {
    CACHE_FOLDER = process.env.AUDIO_CACHE_FOLDER;
    EXISTS_CACHE = [];

    constructor() {
        try {
            fs.mkdirSync(this.CACHE_FOLDER);
        } catch (err) {
            console.warn("Could not create cache folder. Perhaps it already exists.");
        }
        for (let filename of fs.readdirSync(this.CACHE_FOLDER)) {
            console.debug(`Found existing audio ${filename}`);
            this.EXISTS_CACHE.push(filename.split('.mp3')[0])
        }
    }

    async say(phrase) {
        let audioCachePath = path.join(this.CACHE_FOLDER, `${phrase.toLowerCase()}.mp3`);
        if (!~this.EXISTS_CACHE.indexOf(phrase.toLowerCase())) {
            await gtts.save(audioCachePath, phrase);
            this.EXISTS_CACHE.push(phrase.toLowerCase());
        }
        console.debug(`Saying ${phrase}`);
        spawnSync('play', [audioCachePath]);
    }
}


test.before(async function(t) {
    t.context.driver = await builder.build();
    t.context.bot = REAL_AUDIO ? new AudioPlayingBot() : new MockedRecognizerBot(t.context.driver);

    // open a page because the startup page cannot have cs
    // scripts run on it
    t.context.driver.manage().timeouts().pageLoadTimeout(6500);

    await timeout(2500);

    // enable the plugin
    toggleExtension();
});

test.beforeEach(async (t) => {
    // Need to timeout the page and catch the error as a workaround
    // for the page never loading when the add on is already activated?
    t.context.driver.get('https://www.google.com').then(() => null, () => null);
});

test.after(async (t) => {
    //var tests = this.tests;
    var failed = false;
    //for (var i = 0, limit = tests.length; !failed && i < limit; ++i)
        //failed = tests[i].state === "failed";

    if (DEBUG && failed) {
        // don't close the browser
        //await timeout(120000);
    }
    t.context.driver && await t.context.driver.quit();
});

test.afterEach.always((t) => {
    // if (DEBUG) {
    //     debugger;
    //     //if (this.currentTest.state !== 'passed') {
    //         //await timeout(2000);
    //     //} else {
    //         //await timeout(10000);
    //     //}
    // }
});


let pluginFilePath: string;
for (pluginFilePath of pluginFilePaths) {
    let exports = {Plugin: undefined};
    eval(readFileSync(pluginFilePath))
    let Plugin: IPlugin = exports.Plugin;
    for (let cmd of Plugin.plugin.commands) {
        if (cmd.test) {
            for (let pluginTest of _.flatten([cmd.test])) {
                var phrases = typeof cmd.match !== 'function' ? _.flatten([cmd.match]) : [];
                let phrase: string;
                for (phrase of phrases) {
                    if (~BLACKLISTED_PHRASES.indexOf(phrase))
                        continue
                    if (WHITELISTED_PHRASES.length > 0 && !~WHITELISTED_PHRASES.indexOf(phrase))
                        continue
                    test.serial(`${Plugin.plugin.name} -- ${cmd.name} -- #${phrase}`, async (t) => {
                        try {
                            let res = await pluginTest.apply({
                                driver: t.context.driver,
                                Key: Key,
                                By: By,
                                until: until,
                                assert: {
                                    notEqual: t.not,
                                    equal: t.is,
                                    true: t.true,
                                },
                                say: async function() { return await t.context.bot.say(phrase); },
                                timeout: timeout,
                                // Workaround for the infinite-loading issue [1]
                                // don't error on timeout
                                loadPage: async function loadPage(url) {
                                    return await t.context.driver.get(url).then(() => null, () => null);
                                },
                            });
                        } catch(e) {
                            if (DEBUG) {
                                console.log(`DEBUG mode activated, caught error: ${Plugin.plugin.name} -- ${cmd.name} -- ${phrase}\n${e}`);
                                await timeout(20 * 60 * 1000);
                            } else {
                                throw e;
                            }
                            t.fail();
                        }
                        t.pass();
                    });
                }
            }
        }
    }
}
