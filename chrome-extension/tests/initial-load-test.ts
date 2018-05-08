/*
 * Test initial loading things: permissions,
 *  default settings, tutorial gets opened etc.
 */

import anyTest, {TestInterface} from 'ava';
import { WebDriver } from 'selenium-webdriver';
import {
    chromeBuilder,
    timeout,
    IBot,
    toggleExtension,
    AudioPlayingBot,
    MockedRecognizerBot,
} from "./vm-test";

const test = anyTest as TestInterface<{
    driver: WebDriver,
    bot: IBot,
}>;


test.before(async function(t) {
    t.context.driver = await chromeBuilder.build();
    t.context.bot = new MockedRecognizerBot(t.context.driver);

    // close all windows except main
    // none of this works
    // console.log('hi')
    // let wHandles = await t.context.driver.getAllWindowHandles();
    // console.log(`there ${wHandles} ${typeof wHandles}`);
    // for (let i = 0; i <= wHandles.length; i++) {
    //     console.log(`${wHandles[i]} ${i}`);
    // }
    // t.context.driver.executeScript('window.close()');
    // wHandles.forEach((x, i) => {
    //     if (i == 0)
    //         return;
    //     console.log(`x: ${x} i: ${i}`);
    //     t.context.driver.switchTo().window(x);
    //     t.context.driver.close();
    // });

    // open a page because the startup page cannot have cs
    // scripts run on it
    t.context.driver.manage().timeouts().pageLoadTimeout(6500);

    await timeout(2500);

    // enable the plugin
    toggleExtension();
});


test('Commands are loaded when tutorial is opened and browser is restarted', async (t) => {
    await t.context.driver.get(`chrome-extension://lnnmjmalakahagblkkcnjkoaihlfglon/views/tutorial.html`);
    await timeout(1000);
    await t.context.driver.quit();
    t.context.driver = await chromeBuilder.build();
    await timeout(2000);
    // check window.commands if it has more than one key
    let plugins = await t.context.driver.executeScript(`return window.allPlugins;`);
    t.true(Object.keys(plugins).length > 0, `window.allPlugins is blank ${JSON.stringify(plugins)}, needs to be greater than 0`);
    await timeout(50000);
    t.pass();
});
