"use strict"
/*
 * Test all the plugin code
 * Use 2048x1048 resolution on the VM
 */
const { Browser, By, Builder, until, Key }  = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const _ = require('lodash');
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const gtts = require('node-gtts')('en');
const { spawnSync } = require('child_process');
const timeout = ms => new Promise(res => setTimeout(res, ms));
const MAX_TRIES_PER_TEST = 3;
const BLACKLISTED_PHRASES = ['back'];

var builder = new Builder()
    .forBrowser('chrome')
    .setChromeOptions(new chrome.Options()
        .addArguments("user-data-dir=/home/lubuntu/.config/google-chrome/Default")
        .addExtensions("/media/sf_no-hands-man/no-hands-man.crx"));

var pluginFilePaths = process.env.PLUGINS ? process.env.PLUGINS.split(',') : [];
var debug = false;


function moveMouse(x, y) {
    console.debug(`Moving mouse ${x} ${y}`);
    spawnSync('xdotool', ['mousemove', x, y]);
}


function clickMouse(x, y) {
    if (x && y) {
        moveMouse(x, y);
    }
    console.debug("Clicking mouse...");
    spawnSync('xdotool', ['click', '1']);
}


function toggleExtension(active=true) {
    // extension button
    clickMouse(964, 61);
}


function pressKeys(keys) {
    console.debug(`Pressing keys ${keys}`);
    spawnSync('xdotool', ['key', keys]);
}


function typeKeys(keys) {
    console.debug("Typing keys %s" % keys)
    spawnSync('xdotool', ['type', keys])
}



class TalkingBot {

    constructor() {
        this.CACHE_FOLDER = process.env.AUDIO_CACHE_FOLDER;
        this.EXISTS_CACHE = [];
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

var talkingBot = new TalkingBot()


describe('Plugin test', function() {
    var driver;
    this.timeout(1000000);

    // Workaround for the infinite-loading issue [1]
    // don't error on timeout
    async function loadPage(url) {
        return await this.driver.get(url).then(() => null, (err) => null);
    }


    beforeEach(async function() {
        try {
            driver && driver.quit();
        } catch(e) {}
        driver = await builder.build();

        // enable the plugin
        toggleExtension();

        // open a page because the startup page cannot have cs
        // scripts run on it
        driver.manage().timeouts().pageLoadTimeout(3500);
        // Need to timeout the page and catch the error as a workaround
        // for the page never loading when the add on is already activated?
        driver.get('https://www.google.com').then(() => null, (err) => null);

        await timeout(1500);
    });

    after(async () => {
        var tests = this.tests;
        var failed = false;
        for (var i = 0, limit = tests.length; !failed && i < limit; ++i)
            failed = tests[i].state === "failed";

        if (debug && failed) {
            // don't close the browser
            await timeout(120000);
        }
        driver && driver.quit();
    });

    afterEach(async function () {
        console.log(`Test state: ${this.currentTest.state}`);
        if (debug) {
            if (this.currentTest.state !== 'passed') {
                await timeout(2000);
            } else {
                await timeout(10000);
            }
        }
    });

    for (let pluginFilePath of pluginFilePaths) {
        var Plugin = require(pluginFilePath.replace('.js', ''));

        for (let cmd of Plugin.commands) {
            if (cmd.test) {
                let tests = cmd.test;
                if (!tests.length) {
                    tests = [tests];
                }
                for (let test of tests) {
                    var phrases = typeof cmd.match === 'object' ? cmd.match : [cmd.match];
                    for (let phrase of phrases) {
                        if (~BLACKLISTED_PHRASES.indexOf(phrase))
                            continue
                        if (phrase != 'collapse')
                            continue
                        it(`${Plugin.name} -- ${cmd.name} -- #${phrase}`, async () => {
                            return await test.apply({
                                driver: driver,
                                Key: Key,
                                By: By,
                                until: until,
                                assert: assert,
                                say: async function() { return await talkingBot.say(phrase); },
                                timeout: timeout,
                                loadPage: loadPage,
                            });
                        });
                    }
                }
            }
        }
    }
});
