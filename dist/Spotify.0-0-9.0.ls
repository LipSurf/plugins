// dist/tmp/Spotify/Spotify.js
var SpotifyPlayerUrl = "https://play.spotify.com/", SpotifyPlayerUrlMatch = "*://*.spotify.com/*", SpotifyPlayerUrlRegexMatch = /.*\.spotify\.com/, SpotifyControlButtons;
(function(SpotifyControlButtons1) {
  SpotifyControlButtons1.Next = 'button[data-testid="control-button-skip-forward"]', SpotifyControlButtons1.Play = 'button[data-testid="control-button-play"]', SpotifyControlButtons1.Previous = 'button[data-testid="control-button-skip-back"]', SpotifyControlButtons1.Pause = 'button[data-testid="control-button-pause"]';
})(SpotifyControlButtons || (SpotifyControlButtons = {}));
function clickButton(selector) {
  let btn = document.querySelector(selector);
  btn && btn.click();
}
async function findSpotifyPlayerTabAsync() {
  return new Promise((res) => chrome.tabs.query({ url: SpotifyPlayerUrlMatch }, (tabs) => {
    res(tabs.length ? tabs[0] : null);
  }));
}
async function createSpotifyPlayerTabAsync() {
  return new Promise((res) => chrome.tabs.create({ url: SpotifyPlayerUrl }, (tab) => res(tab)));
}
async function sendSpotifyControlMessage(control, _tab = null) {
  let tab = _tab || await findSpotifyPlayerTabAsync();
  return new Promise((resolve) => {
    if (tab && tab.id)
      return chrome.tabs.sendMessage(tab.id, { type: "postMessage", control }, () => {
        resolve(!0);
      });
    resolve(!1);
  });
}
var Spotify_default = { ...PluginBase, languages: {}, niceName: "Spotify", description: "An experimental plugin for spotify.com", match: SpotifyPlayerUrlRegexMatch, version: "0.0.9", apiVersion: 2, authors: "Ahmed Kamal", init: function() {
  SpotifyPlayerUrlRegexMatch.test(window.location.origin) && chrome.runtime.onMessage.addListener((msg, _, sendResponse) => {
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
}, commands: [{ name: "spotify play", description: "Play the Spotify web player.", global: !0, match: "spotify play", fn: async function() {
  let tab = await findSpotifyPlayerTabAsync();
  tab || prompt("Spotify player seems to be closed, do you want me to open it?", "yes") === "yes" && (tab = await createSpotifyPlayerTabAsync()), await sendSpotifyControlMessage(SpotifyControlButtons.Play, tab);
} }, { name: "spotify pause", description: "Pause the Spotify web player.", global: !0, match: "spotify pause", fn: async function() {
  await sendSpotifyControlMessage(SpotifyControlButtons.Pause);
} }, { name: "spotify next", description: "Moves to the next song on the Spotify web player.", global: !0, match: "spotify next", fn: async function() {
  await sendSpotifyControlMessage(SpotifyControlButtons.Next);
} }, { name: "spotify previous", description: "Moves to the previous song on the Spotify web player.", global: !0, match: "spotify previous", fn: async function() {
  await sendSpotifyControlMessage(SpotifyControlButtons.Previous);
} }] }, dumby_default = Spotify_default;
export {
  dumby_default as default
};
LS-SPLIT// dist/tmp/Spotify/Spotify.js
allPlugins.Spotify = (() => {
  var SpotifyPlayerUrl = "https://play.spotify.com/", SpotifyPlayerUrlMatch = "*://*.spotify.com/*", SpotifyPlayerUrlRegexMatch = /.*\.spotify\.com/, SpotifyControlButtons;
  (function(SpotifyControlButtons1) {
    SpotifyControlButtons1.Next = 'button[data-testid="control-button-skip-forward"]', SpotifyControlButtons1.Play = 'button[data-testid="control-button-play"]', SpotifyControlButtons1.Previous = 'button[data-testid="control-button-skip-back"]', SpotifyControlButtons1.Pause = 'button[data-testid="control-button-pause"]';
  })(SpotifyControlButtons || (SpotifyControlButtons = {}));
  function clickButton(selector) {
    let btn = document.querySelector(selector);
    btn && btn.click();
  }
  async function findSpotifyPlayerTabAsync() {
    return new Promise((res) => chrome.tabs.query({ url: SpotifyPlayerUrlMatch }, (tabs) => {
      res(tabs.length ? tabs[0] : null);
    }));
  }
  async function createSpotifyPlayerTabAsync() {
    return new Promise((res) => chrome.tabs.create({ url: SpotifyPlayerUrl }, (tab) => res(tab)));
  }
  async function sendSpotifyControlMessage(control, _tab = null) {
    let tab = _tab || await findSpotifyPlayerTabAsync();
    return new Promise((resolve) => {
      if (tab && tab.id)
        return chrome.tabs.sendMessage(tab.id, { type: "postMessage", control }, () => {
          resolve(!0);
        });
      resolve(!1);
    });
  }
  return { ...PluginBase, init: function() {
    SpotifyPlayerUrlRegexMatch.test(window.location.origin) && chrome.runtime.onMessage.addListener((msg, _, sendResponse) => {
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
  }, commands: {} };
})();
LS-SPLIT// dist/tmp/Spotify/Spotify.js
allPlugins.Spotify = (() => {
  var SpotifyPlayerUrl = "https://play.spotify.com/", SpotifyPlayerUrlMatch = "*://*.spotify.com/*", SpotifyPlayerUrlRegexMatch = /.*\.spotify\.com/, SpotifyControlButtons;
  (function(SpotifyControlButtons1) {
    SpotifyControlButtons1.Next = 'button[data-testid="control-button-skip-forward"]', SpotifyControlButtons1.Play = 'button[data-testid="control-button-play"]', SpotifyControlButtons1.Previous = 'button[data-testid="control-button-skip-back"]', SpotifyControlButtons1.Pause = 'button[data-testid="control-button-pause"]';
  })(SpotifyControlButtons || (SpotifyControlButtons = {}));
  function clickButton(selector) {
    let btn = document.querySelector(selector);
    btn && btn.click();
  }
  async function findSpotifyPlayerTabAsync() {
    return new Promise((res) => chrome.tabs.query({ url: SpotifyPlayerUrlMatch }, (tabs) => {
      res(tabs.length ? tabs[0] : null);
    }));
  }
  async function createSpotifyPlayerTabAsync() {
    return new Promise((res) => chrome.tabs.create({ url: SpotifyPlayerUrl }, (tab) => res(tab)));
  }
  async function sendSpotifyControlMessage(control, _tab = null) {
    let tab = _tab || await findSpotifyPlayerTabAsync();
    return new Promise((resolve) => {
      if (tab && tab.id)
        return chrome.tabs.sendMessage(tab.id, { type: "postMessage", control }, () => {
          resolve(!0);
        });
      resolve(!1);
    });
  }
  return { ...PluginBase, init: function() {
    SpotifyPlayerUrlRegexMatch.test(window.location.origin) && chrome.runtime.onMessage.addListener((msg, _, sendResponse) => {
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
  }, commands: {} };
})();
