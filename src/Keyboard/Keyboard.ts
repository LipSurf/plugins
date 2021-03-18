/**
 * TODO: add arrows, tab, enter tests for Google Sheets
 *
 */
/// <reference types="lipsurf-types/extension"/>
declare const PluginBase: IPluginBase;

export function backendPressKey(codes: number | number[]) {
  // force into array
  const codesArr = (<number[]>[]).concat(codes);
  chrome.runtime.sendMessage({
    type: "pressKeys",
    payload: { codes: codesArr, nonChar: true },
  });
}

function pressKey(key: string, code: number = 0): boolean {
  backendPressKey(code);
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

export default <IPlugin & IPluginBase>{
  ...PluginBase,
  ...{
    niceName: "Keyboard",
    description: "For pressing individual keyboard buttons with your voice.",
    version: "4.0.0",
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
        name: "Press Tab",
        description: "Equivalent of hitting the tab key.",
        match: "press tab",
        pageFn: () => {
          if (!pressKey("Tab", 9)) backendPressKey(9);
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
          if (!pressKey("Enter", 13)) backendPressKey(13);
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
            await say("dictate lipsurf");
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
          if (!pressKey("ArrowDown", 40))
            // not sure of the use case for this
            backendPressKey(40);
        },
      },
      {
        name: "Press Up",
        description: "Equivalent of hitting the up arrow key.",
        match: "press up",
        pageFn: () => {
          if (!pressKey("ArrowUp", 38)) backendPressKey(38);
        },
      },
      {
        name: "Press Left",
        description: "Equivalent of hitting the left arrow key.",
        match: "press left",
        pageFn: () => {
          if (!pressKey("ArrowLeft", 37)) backendPressKey(37);
        },
      },
      {
        name: "Press Right",
        description: "Equivalent of hitting the right arrow key.",
        match: "press right",
        pageFn: () => {
          if (!pressKey("ArrowRight", 39)) backendPressKey(39);
        },
      },
    ],
  },
};
