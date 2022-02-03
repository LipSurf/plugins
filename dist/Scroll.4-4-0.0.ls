import PluginBase from 'chrome-extension://lnnmjmalakahagblkkcnjkoaihlfglon/dist/modules/plugin-base.js';import ExtensionUtil from 'chrome-extension://lnnmjmalakahagblkkcnjkoaihlfglon/dist/modules/extension-util.js';// dist/tmp/Scroll/Scroll.js
var Scroll_default = { "languages": { "es": { "niceName": "Desplazarse", "authors": "Miko", "commands": { "Scroll Bottom": { "name": "Desplazarse Hasta Abajo", "match": ["desplazarse hasta abajo", "parte inferior", "final"] }, "Scroll Top": { "name": "Desplazarse Hasta Arriba", "match": ["[desplazarse hasta] [/parte ]arriba", "cima", "parte arriba"] }, "Scroll Down": { "name": "Desplazarse Hacia Abajo", "match": ["[/desplazarse hacia ]abajo"] }, "Scroll Up": { "name": "Desplazarse Hacia Arriba", "match": ["[/desplazarse hacia ]arriba"] }, "Scroll Right": { "name": "Desplazarse a la Derecha", "match": ["desplazarse a la derecha"] }, "Scroll Left": { "name": "Desplazarse a la Izquierda", "match": ["desplazarse a la izquierda"] }, "Scroll Down a Little": { "name": "Un Poco Abajo", "match": ["un poco abajo"] }, "Scroll Up a Little": { "name": "Un Poco Arriba", "match": ["un poco arriba"] }, "Auto Scroll": { "name": "Desplazamiento Automático", "match": "desplazamiento automático" }, "Stop Scrolling": { "name": "Parar", "match": "pare" }, "Slower": { "name": "Más Lento", "match": "lento" }, "Faster": { "name": "Más Rápido", "match": "rápido" }, "Scroll Help Down": { "name": "Desplazar la Ayuda Abajo", "match": "ayuda abajo" }, "Scroll Help Up": { "name": "Desplazar la Ayuda Arriba", "match": "ayuda arriba" } } }, "fr": { "niceName": "Défilement", "authors": "Byron Kearns, Miko", "homophones": { "des fils vers le bas": "défile vers le bas", "des fils vers le haut": "défile vers le haut", "ralenti": "ralentis", "défilé en haut": "défiler en haut", "des fils en haut": "défile en haut", "des fils un peu vers le bas": "défile un peu en bas", "des fils un peu vers le haut": "défile un peu vers le haut" }, "commands": { "Scroll Down": { "name": "Défilement vers le Bas", "match": ["[/faire défiler /défiler ]vers le bas"] }, "Scroll Up": { "name": "Défilement vers le Haut", "match": ["[/faire défiler /défiler ]vers le haut"] }, "Auto Scroll": { "name": "Défilement Automatique", "match": ["défilement [automatique/auto]"] }, "Slow Down": { "name": "Ralentir", "match": ["plus lentement", "ralentir"] }, "Speed Up": { "name": "Accélérer", "match": ["plus vite", "accélérer"] }, "Stop Scrolling": { "name": "Arrêter", "match": ["arrêter", "pause"] }, "Scroll Bottom": { "name": "Défilement en Bas", "match": ["en bas", "bas de page", "[faire défiler/défiler] en bas", "aller en bas de la page"] }, "Scroll Top": { "name": "Défilement en Haut", "match": ["en haut", "haut de page", "[faire défiler/défiler] en haut", "aller en haut de la page"] }, "Scroll Down a Little": { "name": "Défilement Léger vers le Bas", "match": ["[/faire défiler /défiler ]un peu vers le bas"] }, "Scroll Up a Little": { "name": "Défilement Léger vers le Haut", "match": ["[/faire défiler /défiler ]un peu vers le haut"] }, "Scroll Left": { "name": "Défilement à Gauche", "match": ["[faire /]défiler à gauche", "[/faire ]défiler vers la gauche"] }, "Scroll Right": { "name": "Défilement à Droite", "match": ["[faire /]défiler à droite", "[/faire ]défiler vers la droite"] }, "Scroll Help Down": { "name": "Faire Défiler l’Aide vers le Bas", "match": ["[faire /]défiler l'aide vers le bas"] }, "Scroll Help Up": { "name": "Faire Défiler l’Aide vers le Haut", "match": ["[faire /]défiler l'aide vers le haut"] } } }, "ja": { "niceName": "スクロール", "description": "ページのスクロールを管理できます。", "homophones": { "しーた": "した", "ちーたー": "した" }, "authors": "Miko, Hiroki Yamazaki", "commands": { "Scroll Bottom": { "name": "ページの一番下に移動", "match": ["いちばんした"] }, "Scroll Top": { "name": "ページの一番上に移動", "match": ["いちばんうえ"] }, "Scroll Down": { "name": "下にスクロール", "match": ["した[/にすくろーる/へすくろーる]", "だうん"] }, "Scroll Up": { "name": "上にスクロール", "match": ["うえ[/にすくろーる/へすくろーる]", "あっぷ"] }, "Scroll Right": { "name": "右にスクロール", "match": ["みぎ[/にすくろーる/へすくろーる]"] }, "Scroll Left": { "name": "左にスクロール", "match": ["ひだり[/にすくろーる/へすくろーる]"] }, "Scroll Up a Little": { "name": "少し上にスクロール", "match": ["すこしうえ[/にすくろーる/へすくろーる]"] }, "Scroll Down a Little": { "name": "少し下にスクロール", "match": ["すこしした[/にすくろーる/へすくろーる]"] }, "Auto Scroll": { "name": "自動スクロール", "match": "じどうすくろーる" }, "Faster": { "name": "もっと早くスクロール", "match": "はやく" }, "Slower": { "name": "もっとゆっくりスクロール", "match": "ゆっくり" }, "Stop Scrolling": { "name": "スクロールを止める", "match": ["すとっぷ", "ていし", "とめる"] }, "Scroll Help Down": { "name": "ヘルプ下", "match": "へるぷした" }, "Scroll Help Up": { "name": "ヘルプ上", "match": "へるぷうえ" } } }, "ru": { "niceName": "Браузер", "description": "Контроль действий в браузере, как-то: создание новой вкладки, навигация по странице (назад, вперед, вниз), вызов справки и т.д.", "homophones": { "тунис": "вниз", "обнинск": "вниз", "знаешь": "вниз", "вниис": "вниз", "beer": "вверх", "вир": "вверх", "вера": "вверх" }, "commands": { "Scroll Bottom": { "name": "Прокрутить в конец страницы", "match": ["в конец", "конец страницы"] }, "Scroll Down a Little": { "name": "Прокрутить немного вниз", "match": ["[немного/чутьчуть] вниз"] }, "Scroll Down": { "name": "Прокрутить вниз", "match": ["вниз"] }, "Scroll Top": { "name": "Вернуться на верх страницы", "match": ["на верх страницы"] }, "Scroll Up a Little": { "name": "Прокрутить немного вверх", "match": ["[немного/чутьчуть] вверх"] }, "Scroll Up": { "name": "Прокрутить вверх", "match": ["вверх"] }, "Scroll Left": { "name": "Прокрутить влево", "match": ["влево"] }, "Scroll Right": { "name": "Прокрутить вправо", "match": ["вправо"] }, "Auto Scroll": { "name": "Автопрокрутка", "match": "автопрокрутка" }, "Stop Scrolling": { "name": "Остановить", "match": ["остановить"] } } } }, "niceName": "Scroll", "description": "Commands for scrolling the page.", "icon": '<svg xmlns="http://www.w3.org/2000/svg" version="1" viewBox="0 0 128 128"><g class="iconic-move-sm iconic-container iconic-sm" transform="scale(8)">\n        <path stroke="#000" stroke-width="2" stroke-linecap="square" d="M8 3v11" fill="none"></path>\n        <path stroke="#000" stroke-width="2" stroke-linecap="square" d="M13 8h-10" fill="none"></path>\n        <path d="M8 0l-3 3h6z"></path>\n        <path d="M16 8l-3-3v6z"></path>\n        <path d="M0 8l3 3v-6z"></path>\n        <path d="M8 16l3-3h-6z"></path>\n    </g></svg>', "version": "4.4.0", "apiVersion": 2, "match": /.*/, "authors": "Miko", "homophones": { "autoscroll": "auto scroll", "horoscrope": "auto scroll", "app": "up", "upwards": "up", "upward": "up", "dumb": "down", "gout": "down", "downwards": "down", "town": "down", "don": "down", "downward": "down", "boreham": "bottom", "volume": "bottom", "barton": "bottom", "barn": "bottom", "born": "bottom", "littledown": "little down", "put it down": "little down", "will down": "little down", "middletown": "little down", "little rock": "little up", "lidl up": "little up", "school little rock": "scroll little up", "time of the page": "top of the page", "scrolltop": "scroll top", "scrub top": "scroll top", "talk": "top", "chop": "top", "school": "scroll", "screw": "scroll", "small": "little", "flower": "slower", "lower": "slower", "pastor": "faster", "master": "faster", "auto spa": "auto scroll", "scallop": "scroll up", "scroll health": "scroll help", "school health": "scroll help", "prohealth": "scroll help" }, "contexts": { "Auto Scroll": { "commands": ["Speed Up", "Slow Down", "Stop Scrolling"] } }, "commands": [{ "name": "Scroll Down", "match": ["[/scroll ]down"], "activeDocument": true }, { "name": "Scroll Up", "match": ["[/scroll ]up"], "activeDocument": true }, { "name": "Auto Scroll", "match": ["[auto/automatic] scroll"], "description": "Continuously scroll down the page slowly, at a reading pace.", "activeDocument": true }, { "name": "Slow Down", "match": ["slower", "slow down"], "description": "Slow down the auto scroll", "activeDocument": true, "normal": false }, { "name": "Speed Up", "match": ["faster", "speed up"], "activeDocument": true, "normal": false, "description": "Speed up the auto scroll" }, { "name": "Stop Scrolling", "match": ["stop", "pause"], "activeDocument": true, "normal": false, "description": "Stop the auto scrolling." }, { "name": "Scroll Bottom", "match": ["bottom[/ of page/of the page]", "scroll [bottom/to bottom/to the bottom/to bottom of page/to the bottom of the page]"], "activeDocument": true }, { "name": "Scroll Top", "match": ["top[/ of page/ of the page]", "scroll [top/to top/to the top/to the top of the page]"], "activeDocument": true }, { "name": "Scroll Help Down", "match": "scroll help down" }, { "name": "Scroll Help Up", "match": "scroll help up" }, { "name": "Scroll Down a Little", "match": ["little [scroll /]down"], "activeDocument": true }, { "name": "Scroll Up a Little", "match": ["little [scroll /]up"], "activeDocument": true }, { "name": "Scroll Left", "match": "scroll left", "activeDocument": true }, { "name": "Scroll Right", "match": "scroll right", "activeDocument": true }] };
export {
  Scroll_default as default
};
LS-SPLIT// dist/tmp/Scroll/Scroll.js
allPlugins.Scroll = (() => {
  var autoscrollIntervalId;
  var SCROLL_SPEED_FACTORS = [240, 120, 90, 60, 36, 24, 12, 6];
  var SCROLL_DURATION = 400;
  var AUTOSCROLL_OPT = "autoscroll-index";
  var scrollNodes = [];
  var scrollIndex = 0;
  function stopAutoscroll() {
    window.clearInterval(autoscrollIntervalId);
    PluginBase.util.removeContext("Auto Scroll");
  }
  function setAutoscroll(indexDelta = 0) {
    let prevPos;
    const zoomFactor = window.outerWidth / window.document.documentElement.clientWidth;
    const scrollFactor = Math.round(1 / zoomFactor * 10) / 10 + 0.1;
    const savedScrollSpeed = PluginBase.getPluginOption("Scroll", AUTOSCROLL_OPT);
    let scrollSpeedIndex = (typeof savedScrollSpeed === "number" ? savedScrollSpeed : 3) + indexDelta;
    if (scrollSpeedIndex >= SCROLL_SPEED_FACTORS.length) {
      scrollSpeedIndex = SCROLL_SPEED_FACTORS.length - 1;
    } else if (scrollSpeedIndex < 0) {
      scrollSpeedIndex = 0;
    }
    console.log("scroll speed", scrollSpeedIndex);
    PluginBase.setPluginOption("Scroll", AUTOSCROLL_OPT, scrollSpeedIndex);
    window.clearInterval(autoscrollIntervalId);
    const scrollEl = getScrollEl();
    if (scrollEl) {
      autoscrollIntervalId = window.setInterval(() => {
        const scrollYPos = scrollEl.scrollY || scrollEl.scrollTop;
        scrollEl.scrollBy(0, scrollFactor);
        if (prevPos && (scrollYPos - prevPos <= 0 || scrollYPos - prevPos > scrollFactor * 1.5)) {
          console.log("stopping due to detected scroll activity");
          stopAutoscroll();
        }
        prevPos = scrollYPos;
      }, SCROLL_SPEED_FACTORS[scrollSpeedIndex]);
    }
  }
  function hasScroll(el, direction, barSize) {
    const offset = direction === "y" ? ["scrollTop", "height"] : ["scrollLeft", "width"];
    let scrollPos = el[offset[0]];
    if (scrollPos < barSize) {
      const originOffset = el[offset[0]];
      el[offset[0]] = el.getBoundingClientRect()[offset[1]];
      scrollPos = el[offset[0]];
      el[offset[0]] = originOffset;
    }
    return scrollPos >= barSize;
  }
  function scrollableMousedownHandler(e) {
    const n = e.currentTarget;
    const target = e.target;
    if (!n.contains(target))
      return;
    let index = scrollNodes.lastIndexOf(target);
    if (index === -1) {
      for (var i = scrollNodes.length - 1; i >= 0; i--) {
        if (scrollNodes[i].contains(target)) {
          index = i;
          break;
        }
      }
      if (index === -1)
        console.warn("cannot find scrollable", e.target);
    }
    scrollIndex = index;
  }
  function getScrollableEls() {
    console.time("getScrollableEls");
    let nodes = listElements(document.body, NodeFilter.SHOW_ELEMENT, function(n) {
      return hasScroll(n, "y", 16) && n.scrollHeight - n.offsetHeight > 60 || hasScroll(n, "x", 16) && n.scrollWidth - n.scrollWidth > 60;
    });
    nodes.sort(function(a, b) {
      if (b.contains(a))
        return 1;
      else if (a.contains(b))
        return -1;
      return b.scrollHeight * b.scrollWidth - a.scrollHeight * a.scrollWidth;
    });
    if (document.scrollingElement.scrollHeight > window.innerHeight || document.scrollingElement.scrollWidth > window.innerWidth) {
      nodes.unshift(document.scrollingElement);
    }
    nodes.forEach(function(n) {
      n.removeEventListener("mousedown", scrollableMousedownHandler);
      n.addEventListener("mousedown", scrollableMousedownHandler);
    });
    console.timeEnd("getScrollableEls");
    return nodes;
  }
  function listElements(root, whatToShow, filter) {
    const elms = [];
    let currentNode;
    const nodeIterator = document.createNodeIterator(root, whatToShow, null);
    while (currentNode = nodeIterator.nextNode()) {
      filter(currentNode) && elms.push(currentNode);
      if (currentNode.shadowRoot) {
        elms.push(...listElements(currentNode.shadowRoot, whatToShow, filter));
      }
    }
    return elms;
  }
  function getScrollEl() {
    let el = window;
    const helpBox = document.getElementById(`${PluginBase.util.getNoCollisionUniqueAttr()}-helpBox`);
    if (helpBox && helpBox.scrollHeight > helpBox.clientHeight) {
      el = helpBox;
    } else if (top.location.href.startsWith("https://docs.google.com/document/")) {
      el = top.document.querySelector(".kix-appview-editor");
    } else if (document.scrollingElement.scrollHeight > window.innerHeight || document.scrollingElement.scrollWidth > window.innerWidth) {
      el = document.scrollingElement;
    } else {
      scrollNodes = getScrollableEls();
      el = scrollNodes[scrollIndex];
    }
    return el;
  }
  async function scrollAmount({ top: top2, left }, relative = true, el = getScrollEl()) {
    if (el) {
      const scrollObj = { top: top2, left, behavior: "smooth" };
      if (relative) {
        el.scrollBy(scrollObj);
      } else {
        el.scrollTo(scrollObj);
      }
    }
    stopAutoscroll();
    return await PluginBase.util.sleep(SCROLL_DURATION);
  }
  function scroll(direction, little = false) {
    console.log("scrolling...", direction);
    const needsKeyPressEvents = /\.pdf$/.test(document.location.pathname);
    let factor;
    let key;
    switch (direction) {
      case "u":
      case "hu":
        factor = -0.85;
        key = 38;
        break;
      case "d":
      case "hd":
        factor = 0.85;
        key = 40;
        break;
      case "l":
        factor = -0.7;
        key = 37;
        break;
      case "r":
        factor = 0.7;
        key = 39;
        break;
      case "t":
        factor = 0;
        key = 36;
        break;
      case "b":
        factor = 1e4;
        key = 35;
        break;
    }
    const littleFactor = little ? 0.5 : 1;
    if (direction === "hd" || direction === "hu") {
      const hud = PluginBase.util.getHUDEl()[0];
      const helpContents = hud.querySelector("#help .cmds");
      return scrollAmount({ top: helpContents.offsetHeight * factor }, true, helpContents);
    } else if (needsKeyPressEvents) {
      let codes;
      if (direction === "t" || direction === "b") {
        codes = [key];
      } else {
        codes = new Array(14 * littleFactor).fill(key);
      }
      chrome.runtime.sendMessage({ type: "pressKeys", payload: { codesWModifiers: codes.map((code) => ({ code })), nonChar: true } });
      return PluginBase.util.sleep(100);
    } else {
      let horizontal = direction === "l" || direction === "r";
      if (horizontal)
        return scrollAmount({ left: window.innerWidth * factor * littleFactor });
      else {
        const relative = direction !== "t";
        if (direction === "b" && document.body.scrollHeight != 0) {
          return scrollAmount({ top: document.documentElement.scrollHeight });
        }
        return scrollAmount({ top: top.innerHeight * factor * littleFactor }, relative);
      }
    }
  }
  function queryScrollPos(querySelector) {
    if (querySelector) {
      const scrollEl = document.querySelector(querySelector);
      return scrollEl.scrollTop;
    } else {
      return window.scrollY;
    }
  }
  async function testScroll(t, say, client, url, querySelector, test = { greater: true }) {
    await client.url(url);
    t.is(await client.getUrl(), url);
    if (test.zero || test.lessThan)
      await say("bottom");
    const scrollStart = await client.execute(queryScrollPos, querySelector);
    await say();
    const scrollEnd = await client.execute(queryScrollPos, querySelector);
    if (test.greater)
      t.true(scrollEnd > scrollStart, `scrollStart: ${scrollStart} scrollEnd: ${scrollEnd} for ${url}`);
    else if (test.lessThan)
      t.true(scrollEnd < scrollStart, `scrollStart: ${scrollStart} scrollEnd: ${scrollEnd} for ${url}`);
    else if (test.zero)
      t.is(scrollEnd, 0, `scrollStart: ${scrollStart} scrollEnd: ${scrollEnd} for ${url}`);
  }
  var Scroll_default = { ...PluginBase, ...{ "destroy": function() {
    stopAutoscroll();
  }, "commands": { "Scroll Down": { "pageFn": () => scroll("d") }, "Scroll Up": { "pageFn": () => scroll("u") }, "Auto Scroll": { "pageFn": () => {
    console.log("adding context");
    PluginBase.util.enterContext(["Auto Scroll", ...PluginBase.util.getContext()]);
    setAutoscroll();
  } }, "Slow Down": { "pageFn": () => {
    setAutoscroll(-1);
  } }, "Speed Up": { "pageFn": () => {
    setAutoscroll(1);
  } }, "Stop Scrolling": { "pageFn": () => {
    stopAutoscroll();
  } }, "Scroll Bottom": { "pageFn": () => {
    return scroll("b");
  } }, "Scroll Top": { "pageFn": () => {
    return scroll("t");
  } }, "Scroll Help Down": { "pageFn": () => scroll("hd", true) }, "Scroll Help Up": { "pageFn": () => scroll("hu", true) }, "Scroll Down a Little": { "pageFn": () => {
    return scroll("d", true);
  } }, "Scroll Up a Little": { "pageFn": () => {
    return scroll("u", true);
  } }, "Scroll Left": { "pageFn": () => {
    return scroll("l");
  } }, "Scroll Right": { "pageFn": () => {
    return scroll("r");
  } } } } };
  return Scroll_default;
})();
LS-SPLIT// dist/tmp/Scroll/Scroll.js
allPlugins.Scroll = (() => {
  var autoscrollIntervalId;
  var SCROLL_SPEED_FACTORS = [240, 120, 90, 60, 36, 24, 12, 6];
  var SCROLL_DURATION = 400;
  var AUTOSCROLL_OPT = "autoscroll-index";
  var scrollNodes = [];
  var scrollIndex = 0;
  function stopAutoscroll() {
    window.clearInterval(autoscrollIntervalId);
    PluginBase.util.removeContext("Auto Scroll");
  }
  function setAutoscroll(indexDelta = 0) {
    let prevPos;
    const zoomFactor = window.outerWidth / window.document.documentElement.clientWidth;
    const scrollFactor = Math.round(1 / zoomFactor * 10) / 10 + 0.1;
    const savedScrollSpeed = PluginBase.getPluginOption("Scroll", AUTOSCROLL_OPT);
    let scrollSpeedIndex = (typeof savedScrollSpeed === "number" ? savedScrollSpeed : 3) + indexDelta;
    if (scrollSpeedIndex >= SCROLL_SPEED_FACTORS.length) {
      scrollSpeedIndex = SCROLL_SPEED_FACTORS.length - 1;
    } else if (scrollSpeedIndex < 0) {
      scrollSpeedIndex = 0;
    }
    console.log("scroll speed", scrollSpeedIndex);
    PluginBase.setPluginOption("Scroll", AUTOSCROLL_OPT, scrollSpeedIndex);
    window.clearInterval(autoscrollIntervalId);
    const scrollEl = getScrollEl();
    if (scrollEl) {
      autoscrollIntervalId = window.setInterval(() => {
        const scrollYPos = scrollEl.scrollY || scrollEl.scrollTop;
        scrollEl.scrollBy(0, scrollFactor);
        if (prevPos && (scrollYPos - prevPos <= 0 || scrollYPos - prevPos > scrollFactor * 1.5)) {
          console.log("stopping due to detected scroll activity");
          stopAutoscroll();
        }
        prevPos = scrollYPos;
      }, SCROLL_SPEED_FACTORS[scrollSpeedIndex]);
    }
  }
  function hasScroll(el, direction, barSize) {
    const offset = direction === "y" ? ["scrollTop", "height"] : ["scrollLeft", "width"];
    let scrollPos = el[offset[0]];
    if (scrollPos < barSize) {
      const originOffset = el[offset[0]];
      el[offset[0]] = el.getBoundingClientRect()[offset[1]];
      scrollPos = el[offset[0]];
      el[offset[0]] = originOffset;
    }
    return scrollPos >= barSize;
  }
  function scrollableMousedownHandler(e) {
    const n = e.currentTarget;
    const target = e.target;
    if (!n.contains(target))
      return;
    let index = scrollNodes.lastIndexOf(target);
    if (index === -1) {
      for (var i = scrollNodes.length - 1; i >= 0; i--) {
        if (scrollNodes[i].contains(target)) {
          index = i;
          break;
        }
      }
      if (index === -1)
        console.warn("cannot find scrollable", e.target);
    }
    scrollIndex = index;
  }
  function getScrollableEls() {
    console.time("getScrollableEls");
    let nodes = listElements(document.body, NodeFilter.SHOW_ELEMENT, function(n) {
      return hasScroll(n, "y", 16) && n.scrollHeight - n.offsetHeight > 60 || hasScroll(n, "x", 16) && n.scrollWidth - n.scrollWidth > 60;
    });
    nodes.sort(function(a, b) {
      if (b.contains(a))
        return 1;
      else if (a.contains(b))
        return -1;
      return b.scrollHeight * b.scrollWidth - a.scrollHeight * a.scrollWidth;
    });
    if (document.scrollingElement.scrollHeight > window.innerHeight || document.scrollingElement.scrollWidth > window.innerWidth) {
      nodes.unshift(document.scrollingElement);
    }
    nodes.forEach(function(n) {
      n.removeEventListener("mousedown", scrollableMousedownHandler);
      n.addEventListener("mousedown", scrollableMousedownHandler);
    });
    console.timeEnd("getScrollableEls");
    return nodes;
  }
  function listElements(root, whatToShow, filter) {
    const elms = [];
    let currentNode;
    const nodeIterator = document.createNodeIterator(root, whatToShow, null);
    while (currentNode = nodeIterator.nextNode()) {
      filter(currentNode) && elms.push(currentNode);
      if (currentNode.shadowRoot) {
        elms.push(...listElements(currentNode.shadowRoot, whatToShow, filter));
      }
    }
    return elms;
  }
  function getScrollEl() {
    let el = window;
    const helpBox = document.getElementById(`${PluginBase.util.getNoCollisionUniqueAttr()}-helpBox`);
    if (helpBox && helpBox.scrollHeight > helpBox.clientHeight) {
      el = helpBox;
    } else if (top.location.href.startsWith("https://docs.google.com/document/")) {
      el = top.document.querySelector(".kix-appview-editor");
    } else if (document.scrollingElement.scrollHeight > window.innerHeight || document.scrollingElement.scrollWidth > window.innerWidth) {
      el = document.scrollingElement;
    } else {
      scrollNodes = getScrollableEls();
      el = scrollNodes[scrollIndex];
    }
    return el;
  }
  async function scrollAmount({ top: top2, left }, relative = true, el = getScrollEl()) {
    if (el) {
      const scrollObj = { top: top2, left, behavior: "smooth" };
      if (relative) {
        el.scrollBy(scrollObj);
      } else {
        el.scrollTo(scrollObj);
      }
    }
    stopAutoscroll();
    return await PluginBase.util.sleep(SCROLL_DURATION);
  }
  function scroll(direction, little = false) {
    console.log("scrolling...", direction);
    const needsKeyPressEvents = /\.pdf$/.test(document.location.pathname);
    let factor;
    let key;
    switch (direction) {
      case "u":
      case "hu":
        factor = -0.85;
        key = 38;
        break;
      case "d":
      case "hd":
        factor = 0.85;
        key = 40;
        break;
      case "l":
        factor = -0.7;
        key = 37;
        break;
      case "r":
        factor = 0.7;
        key = 39;
        break;
      case "t":
        factor = 0;
        key = 36;
        break;
      case "b":
        factor = 1e4;
        key = 35;
        break;
    }
    const littleFactor = little ? 0.5 : 1;
    if (direction === "hd" || direction === "hu") {
      const hud = PluginBase.util.getHUDEl()[0];
      const helpContents = hud.querySelector("#help .cmds");
      return scrollAmount({ top: helpContents.offsetHeight * factor }, true, helpContents);
    } else if (needsKeyPressEvents) {
      let codes;
      if (direction === "t" || direction === "b") {
        codes = [key];
      } else {
        codes = new Array(14 * littleFactor).fill(key);
      }
      chrome.runtime.sendMessage({ type: "pressKeys", payload: { codesWModifiers: codes.map((code) => ({ code })), nonChar: true } });
      return PluginBase.util.sleep(100);
    } else {
      let horizontal = direction === "l" || direction === "r";
      if (horizontal)
        return scrollAmount({ left: window.innerWidth * factor * littleFactor });
      else {
        const relative = direction !== "t";
        if (direction === "b" && document.body.scrollHeight != 0) {
          return scrollAmount({ top: document.documentElement.scrollHeight });
        }
        return scrollAmount({ top: top.innerHeight * factor * littleFactor }, relative);
      }
    }
  }
  function queryScrollPos(querySelector) {
    if (querySelector) {
      const scrollEl = document.querySelector(querySelector);
      return scrollEl.scrollTop;
    } else {
      return window.scrollY;
    }
  }
  async function testScroll(t, say, client, url, querySelector, test = { greater: true }) {
    await client.url(url);
    t.is(await client.getUrl(), url);
    if (test.zero || test.lessThan)
      await say("bottom");
    const scrollStart = await client.execute(queryScrollPos, querySelector);
    await say();
    const scrollEnd = await client.execute(queryScrollPos, querySelector);
    if (test.greater)
      t.true(scrollEnd > scrollStart, `scrollStart: ${scrollStart} scrollEnd: ${scrollEnd} for ${url}`);
    else if (test.lessThan)
      t.true(scrollEnd < scrollStart, `scrollStart: ${scrollStart} scrollEnd: ${scrollEnd} for ${url}`);
    else if (test.zero)
      t.is(scrollEnd, 0, `scrollStart: ${scrollStart} scrollEnd: ${scrollEnd} for ${url}`);
  }
  var Scroll_default = { ...PluginBase, ...{ "destroy": function() {
    stopAutoscroll();
  }, "commands": {} } };
  return Scroll_default;
})();
