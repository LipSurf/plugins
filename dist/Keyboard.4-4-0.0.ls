import PluginBase from 'chrome-extension://lnnmjmalakahagblkkcnjkoaihlfglon/dist/modules/plugin-base.js';import ExtensionUtil from 'chrome-extension://lnnmjmalakahagblkkcnjkoaihlfglon/dist/modules/extension-util.js';// dist/tmp/Keyboard/Keyboard.js
var Keyboard_default = { "languages": { "ja": { "niceName": "キーボード", "description": "キーボードのキーを個別に声で押せます。", "authors": "Hiroki Yamazaki, Miko", "commands": { "Press Tab": { "name": "Tabを押す", "description": "Tabキーを押すのと同じ動作をします。", "match": "たぶをおす" }, "Press Enter": { "name": "Enterを押す", "description": "Enterキーを押すのと同じ動作をします。", "match": "えんたーをおす" }, "Press Down": { "name": "↓を押す", "description": "↓キーを押すのと同じ動作をします。", "match": "したをおす" }, "Press Up": { "name": "↑を押す", "description": "↑キーを押すのと同じ動作をします。", "match": "うえをおす" }, "Press Left": { "name": "←を押す", "description": "←キーを押すのと同じ動作をします。", "match": "ひだりをおす" }, "Press Right": { "name": "→を押す", "description": "→キーを押すのと同じ動作をします。", "match": "みぎをおす" } } }, "ru": { "niceName": "Клавиатура", "authors": "Dmitri H., Miko", "commands": { "Press Enter": { "name": "нажмите ввод", "match": "ввод" }, "Press Left": { "name": "нажмите влево", "match": "нажмите влево" }, "Press Right": { "name": "нажмите вправо", "match": "нажмите вправо" }, "Press Up": { "name": "нажмите вверх", "match": "нажмите вверх" }, "Press Down": { "name": "нажмите вниз", "match": "нажмите вниз" }, "Press Tab": { "name": "нажмите вкладку", "match": "нажмите вкладку" } } } }, "niceName": "Keyboard", "description": "For pressing individual keyboard buttons with your voice.", "version": "4.4.0", "apiVersion": 2, "match": /.*/, "authors": "Miko", "homophones": { "pressed": "press", "dress": "press", "present tab": "press tab" }, "commands": [{ "name": "Press Key Combination", "description": 'Simulate pressing keyboard keys. Keys should separated by the "+" symbol (e.g. "press ctrl+p" or "press alt+shift+tab"). Examples of special keys: left arrow, enter, tab, home, end, page down, ctrl, alt, shift, f1, backspace, delete.', "match": "press *" }, { "name": "Press Tab", "description": "Equivalent of hitting the tab key.", "match": "press tab" }, { "name": "Press Enter", "description": "Equivalent of hitting the enter key.", "match": "press enter" }, { "name": "Press Down", "description": "Equivalent of hitting the down arrow key.", "match": "press down" }, { "name": "Press Up", "description": "Equivalent of hitting the up arrow key.", "match": "press up" }, { "name": "Press Left", "description": "Equivalent of hitting the left arrow key.", "match": "press left" }, { "name": "Press Right", "description": "Equivalent of hitting the right arrow key.", "match": "press right" }] };
export {
  Keyboard_default as default
};
LS-SPLIT// dist/tmp/Keyboard/Keyboard.js
allPlugins.Keyboard = (() => {
  function backendPressKey(...codesWModifiers) {
    chrome.runtime.sendMessage({ type: "pressKeys", payload: { codesWModifiers, nonChar: true } });
  }
  function pressKey(name, x) {
    backendPressKey(x);
    return true;
  }
  function splitBySingleCharSeparator(s, separator = "+") {
    const parts = [];
    let indexOfSplitter = -1;
    do {
      const prevIndex = indexOfSplitter + 1;
      indexOfSplitter = s.indexOf(separator, prevIndex + 1);
      let part;
      if (indexOfSplitter !== -1) {
        part = s.substring(prevIndex, indexOfSplitter);
      } else {
        part = s.substring(prevIndex);
      }
      parts.push(part);
    } while (indexOfSplitter !== -1);
    return parts;
  }
  var FKEY_REGX = /f\d{1,2}/;
  function keyStrSeqToCodeAndMod(keysStrSeq) {
    const keysSplit = splitBySingleCharSeparator(keysStrSeq.toLowerCase());
    let code;
    let modifiers = 0;
    let mainKey;
    for (const key of keysSplit) {
      mainKey = key;
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
          if (FKEY_REGX.test(key)) {
            code = 111 + +key.substring(1);
          } else {
            code = key.toUpperCase().charCodeAt(0);
          }
          break;
      }
    }
    return { key: mainKey, code, modifiers };
  }
  async function keyComboTest(keysStrSeq, t, say, client) {
    await client.url(`https://keycode.info/`);
    say(`press ${keysStrSeq}`);
    const code = (await (await client.$(".keycode-display")).getText()).trim().toLowerCase();
    const key = (await (await client.$(".card.item-key .main-description")).getText()).trim().toLowerCase();
    const keyCodeAndMod = keyStrSeqToCodeAndMod(keysStrSeq);
    t.is(keyCodeAndMod.key, key);
    t.is(keyCodeAndMod.code, code);
  }
  var Keyboard_default = { ...PluginBase, ...{ "commands": { "Press Key Combination": { "pageFn": (transcript, { preTs, normTs }) => {
    console.log("pressing", preTs);
    const codeAndMod = keyStrSeqToCodeAndMod(preTs);
    backendPressKey(codeAndMod);
  } }, "Press Tab": { "pageFn": () => {
    if (!pressKey("Tab", { code: 9 }))
      backendPressKey({ code: 9 });
  } }, "Press Enter": { "pageFn": () => {
    if (!pressKey("Enter", { code: 13 }))
      backendPressKey({ code: 13 });
  } }, "Press Down": { "pageFn": () => {
    if (!pressKey("ArrowDown", { code: 40 }))
      backendPressKey({ code: 40 });
  } }, "Press Up": { "pageFn": () => {
    if (!pressKey("ArrowUp", { code: 38 }))
      backendPressKey({ code: 38 });
  } }, "Press Left": { "pageFn": () => {
    if (!pressKey("ArrowLeft", { code: 37 }))
      backendPressKey({ code: 37 });
  } }, "Press Right": { "pageFn": () => {
    if (!pressKey("ArrowRight", { code: 39 }))
      backendPressKey({ code: 39 });
  } } } } };
  return Keyboard_default;
})();
LS-SPLIT