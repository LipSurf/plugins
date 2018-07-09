/*
 * Test all the plugin code
 */
import anyTest, {TestInterface} from 'ava';
import { By, until, Key, WebDriver } from 'selenium-webdriver';
import * as _ from 'lodash';
import { readFileSync } from 'fs';
import { PluginManager } from "../../src/background/plugin-manager";
import {
    chromeBuilder,
    timeout,
    IBot,
    toggleExtension,
    AudioPlayingBot,
    MockedRecognizerBot,
} from "../vm-test";
import { instanceOfDynamicMatch } from 'src/common/util';

const test = anyTest as TestInterface<{
    driver: WebDriver,
    bot: IBot,
}>;
const readPluginSync = file_name => readFileSync(file_name, { encoding: 'utf-8' });
const MAX_TRIES_PER_TEST = 3;
const BLACKLISTED_PHRASES = [];
const WHITELISTED_PHRASES = [];
const REAL_AUDIO = false;
const DEBUG = false;


var pluginFilePaths = process.env.PLUGINS ? process.env.PLUGINS.split(',') : [];

test.before(async function(t) {
    t.context.driver = await chromeBuilder.build();
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
    let pathArr = pluginFilePath.split('/');
    let pluginId = pathArr[pathArr.length - 1].split('.')[0];
    pluginId = pluginId[0].toUpperCase() + pluginId.substr(1, pluginId.length);
    let Plugin = PluginManager.evalPluginCode(pluginId, readPluginSync(pluginFilePath));
    for (let cmd of Plugin.commands) {
        if (cmd.test) {
            for (let pluginTest of _.flatten([cmd.test])) {
                var phrases = instanceOfDynamicMatch(cmd.match) ? [] : _.flatten([cmd.match]);
                let phrase: string;
                for (phrase of phrases) {
                    if (~BLACKLISTED_PHRASES.indexOf(phrase))
                        continue
                    if (WHITELISTED_PHRASES.length > 0 && !~WHITELISTED_PHRASES.indexOf(phrase))
                        continue
                    test.serial(`${Plugin.niceName} -- ${cmd.name} -- #${phrase}`, async (t) => {
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
                                console.log(`DEBUG mode activated, caught error: ${Plugin.niceName} -- ${cmd.name} -- ${phrase}\n${e}`);
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
