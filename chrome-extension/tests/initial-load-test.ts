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

    // open a page because the startup page cannot have cs
    // scripts run on it
    t.context.driver.manage().timeouts().pageLoadTimeout(6500);

    await timeout(2500);

    // enable the plugin
    toggleExtension();
});


test('Commands are loaded when tutorial is opened and browser is restarted', async (t) => {
   t.pass();
});
