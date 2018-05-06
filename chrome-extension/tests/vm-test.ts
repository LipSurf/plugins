/*
 * Test the extension with full control of mouse and keyboard
 * Use 1920x1076 resolution on the VM
 */
import {Browser, By, Builder, until, Key, WebDriver } from 'selenium-webdriver';
import { spawnSync } from 'child_process';
import * as chrome from 'selenium-webdriver/chrome';
import * as fs from 'fs';
import * as path from 'path';

export const timeout = ms => new Promise(res => setTimeout(res, ms));
export const gtts = require('node-gtts')('en');

export let chromeBuilder = new Builder()
    .forBrowser('chrome')
    // @ts-ignore: we know this shit works
    .setChromeOptions(new chrome.Options()
        .addArguments("user-data-dir=/home/lubuntu/.config/google-chrome/Default")
        .addArguments(`--load-extension=/media/sf_lipsurf/chrome-extension`));
        // .addExtensions("/media/sf_no-hands-man/no-hands-man.crx"));


function moveMouse(x:number, y:number) {
    console.debug(`Moving mouse ${x} ${y}`);
    spawnSync('xdotool', ['mousemove', '--sync', x.toString(), y.toString()]);
}


function clickMouse(x:number, y:number) {
    console.debug("Clicking mouse...");
    spawnSync('xdotool', ['mousemove', '--sync', x.toString(), y.toString(), 'click', '1']);
}


export function toggleExtension(active=true) {
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

export interface IBot {
    say(phrase: string): Promise<void>,
}

export class MockedRecognizerBot implements IBot {
    constructor(private driver) {
    }
    async say(phrase) {
        // can be adjusted to change the speed of the tests
        let i = 0;
        await timeout(1000);
        await this.driver.executeScript(`window.postMessage({test_probe: true, cmd: 'recg.handleTranscript("${phrase}", true, 0.99, ${i + 1})'}, '*');`);
    }
}


export class AudioPlayingBot implements IBot {
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
