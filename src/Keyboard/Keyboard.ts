/**
 * TODO: add arrows, tab, enter tests for Google Sheets
 *
 */
/// <reference types="@lipsurf/types/extension"/>
declare const PluginBase: IPluginBase;

export function backendPressKey(...keyWModifiers: string[][]) {
  chrome.runtime.sendMessage({
    type: "pressKeys",
    payload: { keyWModifiers, nonChar: true },
  });
}

function pressKey(name: string): boolean {
  backendPressKey([name]);
  return true;
  // const activeEle = document.activeElement;
  // console.log(activeEle);
  // if (activeEle) {
  //     const code = key.charCodeAt(0);
  //     const evtDeets = {
  //         bubbles: true,
  //         cancelable: true,
  //         key,
  //         code: key,
  //         location: 0,
  //         // @ts-ignore
  //         keyCode: code,
  //         // deprecated, but we include it
  //         which: code,
  //     }
  //     activeEle.dispatchEvent(new KeyboardEvent("keydown", evtDeets));
  //     activeEle.dispatchEvent(new KeyboardEvent("keyup", evtDeets));
  //     activeEle.dispatchEvent(new KeyboardEvent("keypress", evtDeets));
  //     return true;
  // }
  // return false;
}

/**
 * console.log(['Ctrl+P', 'ctrl++', 'ctrl+home+end', 'ctrl+shift+t', '+++', '++Ctrl'].map(x => splitByPlusses(x)))
 */
function splitBySingleCharSeparator(s: string, separator = "+") {
  const parts: string[] = [];
  let indexOfSplitter = -1;
  do {
    const prevIndex = indexOfSplitter + 1;
    indexOfSplitter = s.indexOf(separator, prevIndex + 1);
    let part: string;
    if (indexOfSplitter !== -1) {
      part = s.substring(prevIndex, indexOfSplitter);
    } else {
      part = s.substring(prevIndex);
    }
    parts.push(part);
  } while (indexOfSplitter !== -1);
  return parts;
}

/**
 * Showing modifier keys is coming soon:
 *  * https://github.com/wesbos/keycodes/issues/290
 */
async function keyComboTest(keysStrSeq: string, t, say, client) {
  // console.log("1", t, "2", say, "3", client, "4", keys);
  await client.url(`https://keycode.info/`);
  say(`press ${keysStrSeq}`);
  const code = (await (await client.$(".keycode-display")).getText())
    .trim()
    .toLowerCase();
  const key = (
    await (await client.$(".card.item-key .main-description")).getText()
  )
    .trim()
    .toLowerCase();

  // const keyCodeAndMod = keyStrSeqToCodeAndMod(keysStrSeq);
  // // console.log("keyCodeAndMod", keyCodeAndMod, "key", key, "code", code);
  // t.is(keyCodeAndMod.key, key);
  // t.is(keyCodeAndMod.code, code);
}

export default <IPlugin & IPluginBase>{
  ...PluginBase,
  ...{
    niceName: "Keyboard",
    description: "For pressing individual keyboard buttons with your voice.",
    version: "4.7.0-alpha.0",
    apiVersion: 2,
    match: /.*/,
    authors: "Miko",
    homophones: {
      // causes issues with "press tab"
      // 'preston': 'press down',
      pressed: "press",
      dress: "press",
      "present tab": "press tab",
    },
    commands: [
      {
        name: "Press Key Combination",
        description:
          'Simulate pressing keyboard keys. Keys should separated by the "+" symbol (e.g. "press ctrl+p" or "press alt+shift+tab"). Examples of special keys: left arrow, enter, tab, home, end, page down, ctrl, alt, shift, f1, backspace, delete.',
        match: "press *",
        pageFn: (transcript, { preTs, normTs }: TsData) => {
          console.log("pressing", preTs);
          const keys = splitBySingleCharSeparator(preTs);
          // debugger
          backendPressKey(keys);
        },
        test: {
          // manually tested:
          // passed:
          //    ctrl+shift+tab, all arrows, home, end, enter, page up, page down,
          //    backspace, delete, ctrl+shift+a, f keys
          // failed:
          //    alt+tab, escape, print screen
          "Ctrl+P": keyComboTest.bind(null, "Ctrl+P"),
          "Cmd+J": keyComboTest.bind(null, "Cmd+J"),
          "Down Arrow": keyComboTest.bind(null, "ArrowDown"),
        },
      },
      {
        name: "Press Tab",
        description: "Equivalent of hitting the tab key.",
        match: "press tab",
        pageFn: () => {
          if (!pressKey("tab")) backendPressKey(["tab"]);
        },
        test: {
          "go to next form field": async (t, say, client) => {
            await client.url(`${t.context.localPageDomain}/forms.html`);
            await (await client.$("#simple input")).click();
            await say();
            t.is(
              await (
                await client.$(await client.getActiveElement())
              ).getAttribute("type"),
              "password"
            );
          },
        },
      },
      {
        name: "Press Enter",
        description: "Equivalent of hitting the enter key.",
        match: "press enter",
        pageFn: () => {
          if (!pressKey("enter")) backendPressKey(["enter"]);
        },
        test: {
          contenteditables: async (t, say, client) => {
            await client.url(`${t.context.localPageDomain}/text-input.html`);
            const editor = await client.$("#editor");
            await editor.clearValue();
            const [before, _] = await Promise.all([
              t.context.getInnerText(client, "#editor"),
              editor.click(),
            ]);
            await say();
            const after = await t.context.getInnerText(client, "#editor");
            t.true(
              after.includes("\n"),
              `before: "${before}" after: "${after}"`
            );
            t.not(before, after);
          },
          "google search": async (t, say, client) => {
            await client.url("https://www.google.com");
            await say("lipsurf");
            await say();
            const newUrl = await client.getUrl();
            t.true(
              newUrl.includes("/search?"),
              `seems search was not submitted`
            );
          },
        },
      },
      {
        name: "Press Down",
        description: "Equivalent of hitting the down arrow key.",
        match: "press down",
        pageFn: () => {
          // gmail down arrow needs forcus when selecting recipient
          if (!pressKey("down"))
            // not sure of the use case for this
            backendPressKey(["down"]);
        },
        test: {
          "press down": keyComboTest.bind(null, "press down"),
        },
      },
      {
        name: "Press Up",
        description: "Equivalent of hitting the up arrow key.",
        match: "press up",
        pageFn: () => {
          if (!pressKey("up")) backendPressKey(["up"]);
        },
      },
      {
        name: "Press Left",
        description: "Equivalent of hitting the left arrow key.",
        match: "press left",
        pageFn: () => {
          if (!pressKey("left")) backendPressKey(["left"]);
        },
      },
      {
        name: "Press Right",
        description: "Equivalent of hitting the right arrow key.",
        match: "press right",
        pageFn: () => {
          if (!pressKey("right")) backendPressKey(["right"]);
        },
      },
    ],
  },
};
