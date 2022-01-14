import PluginBase from 'chrome-extension://lnnmjmalakahagblkkcnjkoaihlfglon/dist/modules/plugin-base.js';import ExtensionUtil from 'chrome-extension://lnnmjmalakahagblkkcnjkoaihlfglon/dist/modules/extension-util.js';// dist/tmp/Spotify/Spotify.js
var SpotifyPlayerUrl = "https://play.spotify.com/";
var SpotifyPlayerUrlMatch = "*://*.spotify.com/*";
var SpotifyControlButtons;
(function(SpotifyControlButtons2) {
  SpotifyControlButtons2["Next"] = 'button[data-testid="control-button-skip-forward"]';
  SpotifyControlButtons2["Play"] = 'button[data-testid="control-button-play"]';
  SpotifyControlButtons2["Previous"] = 'button[data-testid="control-button-skip-back"]';
  SpotifyControlButtons2["Pause"] = 'button[data-testid="control-button-pause"]';
})(SpotifyControlButtons || (SpotifyControlButtons = {}));
async function findSpotifyPlayerTabAsync() {
  return new Promise((res) => {
    return chrome.tabs.query({ url: SpotifyPlayerUrlMatch }, (tabs) => {
      res(tabs.length ? tabs[0] : null);
    });
  });
}
async function createSpotifyPlayerTabAsync() {
  return new Promise((res) => {
    return chrome.tabs.create({ url: SpotifyPlayerUrl }, (tab) => {
      return res(tab);
    });
  });
}
async function sendSpotifyControlMessage(control, _tab = null) {
  const tab = _tab || await findSpotifyPlayerTabAsync();
  return new Promise((resolve) => {
    if (tab && tab.id) {
      return chrome.tabs.sendMessage(tab.id, { type: "postMessage", control }, () => {
        resolve(true);
      });
    }
    resolve(false);
  });
}
var Spotify_default = { "languages": {}, "niceName": "Spotify", "description": "An experimental plugin for spotify.com", "match": /.*\.spotify\.com/, "version": "0.0.9", "apiVersion": 2, "authors": "Ahmed Kamal", "commands": [{ "name": "spotify play", "description": "Play the Spotify web player.", "global": true, "match": "spotify play", "fn": async function() {
  let tab = await findSpotifyPlayerTabAsync();
  if (!tab) {
    const msg = "Spotify player seems to be closed, do you want me to open it?";
    if (prompt(msg, "yes") === "yes") {
      tab = await createSpotifyPlayerTabAsync();
    }
  }
  await sendSpotifyControlMessage(SpotifyControlButtons.Play, tab);
} }, { "name": "spotify pause", "description": "Pause the Spotify web player.", "global": true, "match": "spotify pause", "fn": async function() {
  await sendSpotifyControlMessage(SpotifyControlButtons.Pause);
} }, { "name": "spotify next", "description": "Moves to the next song on the Spotify web player.", "global": true, "match": "spotify next", "fn": async function() {
  await sendSpotifyControlMessage(SpotifyControlButtons.Next);
} }, { "name": "spotify previous", "description": "Moves to the previous song on the Spotify web player.", "global": true, "match": "spotify previous", "fn": async function() {
  await sendSpotifyControlMessage(SpotifyControlButtons.Previous);
} }] };
export {
  Spotify_default as default
};
LS-SPLIT// dist/tmp/Spotify/Spotify.js
allPlugins.Spotify = (() => {
  var SpotifyPlayerUrl = "https://play.spotify.com/";
  var SpotifyPlayerUrlMatch = "*://*.spotify.com/*";
  var SpotifyPlayerUrlRegexMatch = /.*\.spotify\.com/;
  var SpotifyControlButtons;
  (function(SpotifyControlButtons2) {
    SpotifyControlButtons2["Next"] = 'button[data-testid="control-button-skip-forward"]';
    SpotifyControlButtons2["Play"] = 'button[data-testid="control-button-play"]';
    SpotifyControlButtons2["Previous"] = 'button[data-testid="control-button-skip-back"]';
    SpotifyControlButtons2["Pause"] = 'button[data-testid="control-button-pause"]';
  })(SpotifyControlButtons || (SpotifyControlButtons = {}));
  function clickButton(selector) {
    const btn = document.querySelector(selector);
    if (btn)
      btn.click();
  }
  async function findSpotifyPlayerTabAsync() {
    return new Promise((res) => {
      return chrome.tabs.query({ url: SpotifyPlayerUrlMatch }, (tabs) => {
        res(tabs.length ? tabs[0] : null);
      });
    });
  }
  async function createSpotifyPlayerTabAsync() {
    return new Promise((res) => {
      return chrome.tabs.create({ url: SpotifyPlayerUrl }, (tab) => {
        return res(tab);
      });
    });
  }
  async function sendSpotifyControlMessage(control, _tab = null) {
    const tab = _tab || await findSpotifyPlayerTabAsync();
    return new Promise((resolve) => {
      if (tab && tab.id) {
        return chrome.tabs.sendMessage(tab.id, { type: "postMessage", control }, () => {
          resolve(true);
        });
      }
      resolve(false);
    });
  }
  var Spotify_default = { ...PluginBase, ...{ "init": function() {
    if (SpotifyPlayerUrlRegexMatch.test(window.location.origin)) {
      chrome.runtime.onMessage.addListener((msg, _, sendResponse) => {
        if (msg.type === "postMessage") {
          switch (msg.control) {
            case SpotifyControlButtons.Play: {
              clickButton(SpotifyControlButtons.Play);
              break;
            }
            case SpotifyControlButtons.Pause:
              clickButton(SpotifyControlButtons.Pause);
              break;
            case SpotifyControlButtons.Next:
              clickButton(SpotifyControlButtons.Next);
              break;
            case SpotifyControlButtons.Previous:
              clickButton(SpotifyControlButtons.Previous);
              break;
            default:
              break;
          }
          sendResponse(null);
        }
      });
    }
  }, "commands": {} } };
  return Spotify_default;
})();
LS-SPLIT// dist/tmp/Spotify/Spotify.js
allPlugins.Spotify = (() => {
  var SpotifyPlayerUrl = "https://play.spotify.com/";
  var SpotifyPlayerUrlMatch = "*://*.spotify.com/*";
  var SpotifyPlayerUrlRegexMatch = /.*\.spotify\.com/;
  var SpotifyControlButtons;
  (function(SpotifyControlButtons2) {
    SpotifyControlButtons2["Next"] = 'button[data-testid="control-button-skip-forward"]';
    SpotifyControlButtons2["Play"] = 'button[data-testid="control-button-play"]';
    SpotifyControlButtons2["Previous"] = 'button[data-testid="control-button-skip-back"]';
    SpotifyControlButtons2["Pause"] = 'button[data-testid="control-button-pause"]';
  })(SpotifyControlButtons || (SpotifyControlButtons = {}));
  function clickButton(selector) {
    const btn = document.querySelector(selector);
    if (btn)
      btn.click();
  }
  async function findSpotifyPlayerTabAsync() {
    return new Promise((res) => {
      return chrome.tabs.query({ url: SpotifyPlayerUrlMatch }, (tabs) => {
        res(tabs.length ? tabs[0] : null);
      });
    });
  }
  async function createSpotifyPlayerTabAsync() {
    return new Promise((res) => {
      return chrome.tabs.create({ url: SpotifyPlayerUrl }, (tab) => {
        return res(tab);
      });
    });
  }
  async function sendSpotifyControlMessage(control, _tab = null) {
    const tab = _tab || await findSpotifyPlayerTabAsync();
    return new Promise((resolve) => {
      if (tab && tab.id) {
        return chrome.tabs.sendMessage(tab.id, { type: "postMessage", control }, () => {
          resolve(true);
        });
      }
      resolve(false);
    });
  }
  var Spotify_default = { ...PluginBase, ...{ "init": function() {
    if (SpotifyPlayerUrlRegexMatch.test(window.location.origin)) {
      chrome.runtime.onMessage.addListener((msg, _, sendResponse) => {
        if (msg.type === "postMessage") {
          switch (msg.control) {
            case SpotifyControlButtons.Play: {
              clickButton(SpotifyControlButtons.Play);
              break;
            }
            case SpotifyControlButtons.Pause:
              clickButton(SpotifyControlButtons.Pause);
              break;
            case SpotifyControlButtons.Next:
              clickButton(SpotifyControlButtons.Next);
              break;
            case SpotifyControlButtons.Previous:
              clickButton(SpotifyControlButtons.Previous);
              break;
            default:
              break;
          }
          sendResponse(null);
        }
      });
    }
  }, "commands": {} } };
  return Spotify_default;
})();
