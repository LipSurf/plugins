/**
 * TODO: add arrows, tab, enter tests for Google Sheets
 *
 */
/// <reference types="@lipsurf/types/extension"/>
declare const PluginBase: IPluginBase;

type KeyCodeAndModifier = { code: number; modifier?: number };

export function backendPressKey(...codesWModifiers: KeyCodeAndModifier[]) {
  chrome.runtime.sendMessage({
    type: "pressKeys",
    payload: { codesWModifiers, nonChar: true },
  });
}

function pressKey(name: string, x: KeyCodeAndModifier): boolean {
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

function keyStrSeqToCodeAndMod(keysStrSeq: string) {
  const keysSplit = keysStrSeq.toLowerCase().split("+");
  let code: number;
  let modifier: number = 0;
  let mainKey: string;
  // modifiers: shift +8, alt +1, ctrl +2, cmd +4
  for (const key of keysSplit) {
    switch (key) {
      case "shift":
        modifier += 8;
        break;
      case "cmd":
        modifier += 4;
        break;
      case "ctrl":
        modifier += 2;
        break;
      case "alt":
        modifier += 1;
        break;
      case "arrowdown":
        mainKey = key;
        code = 40;
        break;
      case "arrowup":
        mainKey = key;
        code = 38;
        break;
      case "arrowleft":
        mainKey = key;
        code = 37;
        break;
      case "arrowright":
        mainKey = key;
        code = 39;
        break;
      case "tab":
        mainKey = key;
        code = 9;
        break;
      default:
        mainKey = key;
        code = key.charCodeAt(0);
        break;
    }
  }
  return {
    key: mainKey!,
    code: code!,
    modifier,
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
    version: "4.2.4-alpha.0",
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
        description: "E.g. press Ctrl+P",
        match: "press *",
        pageFn: (transcript, { preTs, normTs }: TsData) => {
          const codeAndMod = keyStrSeqToCodeAndMod(preTs);
          // debugger
          backendPressKey(codeAndMod);
        },
        test: {
          "Ctrl+P": keyComboTest.bind(null, "Ctrl+P"),
          "Cmd+J": keyComboTest.bind(null, "Cmd+J"),
          ArrowDown: keyComboTest.bind(null, "ArrowDown"),
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
