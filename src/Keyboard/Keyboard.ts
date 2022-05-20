/**
 * TODO: add arrows, tab, enter tests for Google Sheets
 *
 */
/// <reference types="@lipsurf/types/extension"/>
declare const PluginBase: IPluginBase;

type KeyCodeAndModifiers = { code: number; modifiers?: number };

export function backendPressKey(...codesWModifiers: KeyCodeAndModifiers[]) {
  chrome.runtime.sendMessage({
    type: "pressKeys",
    payload: { codesWModifiers, nonChar: true },
  });
}

function pressKey(name: string, x: KeyCodeAndModifiers): boolean {
  backendPressKey(x);
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

const FKEY_REGX = /f\d{1,2}/;

function keyStrSeqToCodeAndMod(keysStrSeq: string) {
  const keysSplit = splitBySingleCharSeparator(keysStrSeq.toLowerCase());
  let code: number;
  let modifiers: number = 0;
  let mainKey: string;
  // modifiers: shift +8, alt +1, ctrl +2, cmd +4
  for (const key of keysSplit) {
    mainKey = key;
    // WARNING: Not all of these have passed tests (some don't seem to work)
    switch (key) {
      case "shift":
        modifiers += 8;
        break;
      case "cmd":
        modifiers += 4;
        break;
      case "ctrl":
        modifiers += 2;
        break;
      case "alt":
        modifiers += 1;
        break;
      case "down arrow":
        mainKey = "arrowdown";
        code = 40;
        break;
      case "up arrow":
        mainKey = "arrowup";
        code = 38;
        break;
      case "left arrow":
        mainKey = "arrowleft";
        code = 37;
        break;
      case "right arrow":
        mainKey = "arrowright";
        code = 39;
        break;
      case "tab":
        code = 9;
        break;
      case "pause":
      case "break":
      case "pause/break":
        mainKey = "pause/break";
        code = 19;
        break;
      case "home":
        code = 36;
        break;
      case "end":
        code = 35;
        break;
      case "insert":
        code = 45;
        break;
      case "caps lock":
        code = 20;
        break;
      case "enter":
        code = 13;
        break;
      case "page up":
        code = 33;
        break;
      case "page down":
        code = 34;
        break;
      case "delete":
        code = 46;
        break;
      case "backspace":
        code = 8;
        break;
      case "print screen":
        code = 44;
        break;
      case "escape":
        code = 27;
        break;
      default:
        // f keys
        if (FKEY_REGX.test(key)) {
          code = 111 + +key.substring(1);
        } else {
          code = key.toUpperCase().charCodeAt(0);
        }
        break;
    }
  }
  return {
    key: mainKey!,
    code: code!,
    modifiers,
  };
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

  const keyCodeAndMod = keyStrSeqToCodeAndMod(keysStrSeq);
  // console.log("keyCodeAndMod", keyCodeAndMod, "key", key, "code", code);
  t.is(keyCodeAndMod.key, key);
  t.is(keyCodeAndMod.code, code);
}

export default <IPlugin & IPluginBase>{
  ...PluginBase,
  ...{
    niceName: "Keyboard",
    description: "For pressing individual keyboard buttons with your voice.",
    version: "4.6.0",
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
          const codeAndMod = keyStrSeqToCodeAndMod(preTs);
          // debugger
          backendPressKey(codeAndMod);
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
          if (!pressKey("Tab", { code: 9 })) backendPressKey({ code: 9 });
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
          if (!pressKey("Enter", { code: 13 })) backendPressKey({ code: 13 });
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
          if (!pressKey("ArrowDown", { code: 40 }))
            // not sure of the use case for this
            backendPressKey({ code: 40 });
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
          if (!pressKey("ArrowUp", { code: 38 })) backendPressKey({ code: 38 });
        },
      },
      {
        name: "Press Left",
        description: "Equivalent of hitting the left arrow key.",
        match: "press left",
        pageFn: () => {
          if (!pressKey("ArrowLeft", { code: 37 }))
            backendPressKey({ code: 37 });
        },
      },
      {
        name: "Press Right",
        description: "Equivalent of hitting the right arrow key.",
        match: "press right",
        pageFn: () => {
          if (!pressKey("ArrowRight", { code: 39 }))
            backendPressKey({ code: 39 });
        },
      },
    ],
  },
};
