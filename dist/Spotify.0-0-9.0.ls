import PluginBase from 'chrome-extension://lnnmjmalakahagblkkcnjkoaihlfglon/dist/modules/plugin-base.js';import ExtensionUtil from 'chrome-extension://lnnmjmalakahagblkkcnjkoaihlfglon/dist/modules/extension-util.js';// dist/tmp/Spotify/Spotify.js
var SpotifyPlayerUrl = "https://play.spotify.com/", SpotifyPlayerUrlMatch = "*://*.spotify.com/*", SpotifyPlayerUrlRegexMatch = /.*\.spotify\.com/;
function clickButton(selector) {
  let btn = document.querySelector(selector);
  btn && btn.click();
}
async function findSpotifyPlayerTabAsync() {
  return new Promise((res) => chrome.tabs.query({url: SpotifyPlayerUrlMatch}, (tabs) => {
    res(tabs.length ? tabs[0] : null);
  }));
}
async function createSpotifyPlayerTabAsync() {
  return new Promise((res) => chrome.tabs.create({url: SpotifyPlayerUrl}, (tab) => res(tab)));
}
async function sendSpotifyControlMessage(control, _tab = null) {
  let tab = _tab || await findSpotifyPlayerTabAsync();
  return new Promise((resolve) => {
    if (tab && tab.id)
      return chrome.tabs.sendMessage(tab.id, {type: "postMessage", control}, () => {
        resolve(!0);
      });
    resolve(!1);
  });
}
var Spotify_default = {
  ...PluginBase,
  languages: {},
  niceName: "Spotify",
  description: "An experimental plugin for spotify.com",
  match: SpotifyPlayerUrlRegexMatch,
  version: "0.0.9",
  authors: "Ahmed Kamal",
  init: function() {
    SpotifyPlayerUrlRegexMatch.test(window.location.origin) && chrome.runtime.onMessage.addListener((msg, _, sendResponse) => {
      if (msg.type === "postMessage") {
        switch (msg.control) {
          case 'button[data-testid="control-button-play"]': {
            clickButton('button[data-testid="control-button-play"]');
            break;
          }
          case 'button[data-testid="control-button-pause"]':
            clickButton('button[data-testid="control-button-pause"]');
            break;
          case 'button[data-testid="control-button-skip-forward"]':
            clickButton('button[data-testid="control-button-skip-forward"]');
            break;
          case 'button[data-testid="control-button-skip-back"]':
            clickButton('button[data-testid="control-button-skip-back"]');
            break;
          default:
            break;
        }
        sendResponse(null);
      }
    });
  },
  commands: [
    {
      name: "spotify play",
      description: "Play the Spotify web player.",
      global: !0,
      match: "spotify play",
      fn: async function() {
        let tab = await findSpotifyPlayerTabAsync();
        tab || prompt("Spotify player seems to be closed, do you want me to open it?", "yes") === "yes" && (tab = await createSpotifyPlayerTabAsync()), await sendSpotifyControlMessage('button[data-testid="control-button-play"]', tab);
      }
    },
    {
      name: "spotify pause",
      description: "Pause the Spotify web player.",
      global: !0,
      match: "spotify pause",
      fn: async function() {
        await sendSpotifyControlMessage('button[data-testid="control-button-pause"]');
      }
    },
    {
      name: "spotify next",
      description: "Moves to the next song on the Spotify web player.",
      global: !0,
      match: "spotify next",
      fn: async function() {
        await sendSpotifyControlMessage('button[data-testid="control-button-skip-forward"]');
      }
    },
    {
      name: "spotify previous",
      description: "Moves to the previous song on the Spotify web player.",
      global: !0,
      match: "spotify previous",
      fn: async function() {
        await sendSpotifyControlMessage('button[data-testid="control-button-skip-back"]');
      }
    }
  ]
}, dumby_default = Spotify_default;
export {
  dumby_default as default
};
LS-SPLIT// dist/tmp/Spotify/Spotify.js
allPlugins.Spotify = (() => {
  var SpotifyPlayerUrl = "https://play.spotify.com/", SpotifyPlayerUrlMatch = "*://*.spotify.com/*", SpotifyPlayerUrlRegexMatch = /.*\.spotify\.com/;
  function clickButton(selector) {
    let btn = document.querySelector(selector);
    btn && btn.click();
  }
  async function findSpotifyPlayerTabAsync() {
    return new Promise((res) => chrome.tabs.query({url: SpotifyPlayerUrlMatch}, (tabs) => {
      res(tabs.length ? tabs[0] : null);
    }));
  }
  async function createSpotifyPlayerTabAsync() {
    return new Promise((res) => chrome.tabs.create({url: SpotifyPlayerUrl}, (tab) => res(tab)));
  }
  async function sendSpotifyControlMessage(control, _tab = null) {
    let tab = _tab || await findSpotifyPlayerTabAsync();
    return new Promise((resolve) => {
      if (tab && tab.id)
        return chrome.tabs.sendMessage(tab.id, {type: "postMessage", control}, () => {
          resolve(!0);
        });
      resolve(!1);
    });
  }
  return {...PluginBase, init: function() {
    SpotifyPlayerUrlRegexMatch.test(window.location.origin) && chrome.runtime.onMessage.addListener((msg, _, sendResponse) => {
      if (msg.type === "postMessage") {
        switch (msg.control) {
          case 'button[data-testid="control-button-play"]': {
            clickButton('button[data-testid="control-button-play"]');
            break;
          }
          case 'button[data-testid="control-button-pause"]':
            clickButton('button[data-testid="control-button-pause"]');
            break;
          case 'button[data-testid="control-button-skip-forward"]':
            clickButton('button[data-testid="control-button-skip-forward"]');
            break;
          case 'button[data-testid="control-button-skip-back"]':
            clickButton('button[data-testid="control-button-skip-back"]');
            break;
          default:
            break;
        }
        sendResponse(null);
      }
    });
  }, commands: {}};
})();
LS-SPLIT// dist/tmp/Spotify/Spotify.js
allPlugins.Spotify = (() => {
  var SpotifyPlayerUrl = "https://play.spotify.com/", SpotifyPlayerUrlMatch = "*://*.spotify.com/*", SpotifyPlayerUrlRegexMatch = /.*\.spotify\.com/;
  function clickButton(selector) {
    let btn = document.querySelector(selector);
    btn && btn.click();
  }
  async function findSpotifyPlayerTabAsync() {
    return new Promise((res) => chrome.tabs.query({url: SpotifyPlayerUrlMatch}, (tabs) => {
      res(tabs.length ? tabs[0] : null);
    }));
  }
  async function createSpotifyPlayerTabAsync() {
    return new Promise((res) => chrome.tabs.create({url: SpotifyPlayerUrl}, (tab) => res(tab)));
  }
  async function sendSpotifyControlMessage(control, _tab = null) {
    let tab = _tab || await findSpotifyPlayerTabAsync();
    return new Promise((resolve) => {
      if (tab && tab.id)
        return chrome.tabs.sendMessage(tab.id, {type: "postMessage", control}, () => {
          resolve(!0);
        });
      resolve(!1);
    });
  }
  return {...PluginBase, init: function() {
    SpotifyPlayerUrlRegexMatch.test(window.location.origin) && chrome.runtime.onMessage.addListener((msg, _, sendResponse) => {
      if (msg.type === "postMessage") {
        switch (msg.control) {
          case 'button[data-testid="control-button-play"]': {
            clickButton('button[data-testid="control-button-play"]');
            break;
          }
          case 'button[data-testid="control-button-pause"]':
            clickButton('button[data-testid="control-button-pause"]');
            break;
          case 'button[data-testid="control-button-skip-forward"]':
            clickButton('button[data-testid="control-button-skip-forward"]');
            break;
          case 'button[data-testid="control-button-skip-back"]':
            clickButton('button[data-testid="control-button-skip-back"]');
            break;
          default:
            break;
        }
        sendResponse(null);
      }
    });
  }, commands: {}};
})();
