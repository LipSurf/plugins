"use strict"
/*
 * Test all the plugin code
 */
var { Browser, By, Builder, until }  = require('selenium-webdriver');
var chrome = require('selenium-webdriver/chrome');
var _ = require('lodash');
var assert = require('assert');
var fs = require('fs');
const path = require('path');
var gtts = require('node-gtts')('en');
const { spawnSync } = require('child_process');

var builder = new Builder()
    .forBrowser('chrome')
    .setChromeOptions(new chrome.Options()
        .addArguments("user-data-dir=/home/lubuntu/.config/google-chrome/Default")
        .addExtensions("/media/sf_no-hands-man/no-hands-man.crx"));

var pluginFilePaths = process.env.PLUGINS.split(',');


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
        spawnSync('play', [audioCachePath]);
    }
}

var talkingBot = new TalkingBot()


async function say(text) {
    console.log(`Saying ${text}`);
    await talkingBot.say(text);
}


describe('Plugin test', function() {
    let driver;
    this.timeout(10000);

    before(async function() {
        driver = await builder.build();
        console.log('yo');
    });

    after(() => driver && driver.quit());

    for (let pluginFilePath of pluginFilePaths) {
        var Plugin = require(pluginFilePath.replace('.js', ''));

        for (let cmd of Plugin.commands) {
            if (cmd.test) {
                let tests = cmd.test;
                let i = 0;
                if (!tests.length) {
                    tests = [tests];
                }
                for (let test of tests) {
                    i += 1;
                    it(`${Plugin.name} -- ${cmd.name} -- #${i}`, async function() {
                        return await test.apply({
                            driver: driver,
                            assert: assert,
                            say: async function() { return await say(typeof cmd.match == 'object' ? cmd.match[0] : cmd.match); }
                        });
                    });
                }
            }
        }
    }
});
