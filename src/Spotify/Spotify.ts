/// <reference types="lipsurf-types/extension"/>

declare const PluginBase: IPluginBase;

const SpotifyPlayerUrl = "https://play.spotify.com/";
const SpotifyPlayerUrlMatch = "*://*.spotify.com/*";
const SpotifyPlayerUrlRegexMatch = /.*\.spotify\.com/;

const enum SpotifyControlButtons {
  Next = 'button[data-testid="control-button-skip-forward"]',
  Play = 'button[data-testid="control-button-play"]',
  Previous = 'button[data-testid="control-button-skip-back"]',
  Pause = 'button[data-testid="control-button-pause"]',
}

function clickButton(selector: string): void {
  const btn = document.querySelector<HTMLButtonElement>(selector);
  if (btn) btn.click();
}

async function findSpotifyPlayerTabAsync(): Promise<chrome.tabs.Tab | null> {
  return new Promise((res) => {
    return chrome.tabs.query({ url: SpotifyPlayerUrlMatch }, (tabs) => {
      res(tabs.length ? tabs[0] : null);
    });
  });
}

async function createSpotifyPlayerTabAsync(): Promise<chrome.tabs.Tab> {
  return new Promise((res) => {
    return chrome.tabs.create({ url: SpotifyPlayerUrl }, (tab) => {
      return res(tab);
    });
  });
}

async function sendSpotifyControlMessage(
  control: SpotifyControlButtons,
  _tab: chrome.tabs.Tab | null = null
): Promise<boolean> {
  const tab = _tab || (await findSpotifyPlayerTabAsync());
  return new Promise((resolve) => {
    if (tab && tab.id) {
      return chrome.tabs.sendMessage(
        tab.id,
        { type: "postMessage", control },
        () => {
          resolve(true);
        }
      );
    }
    resolve(false);
  });
}

export default <IPluginBase & IPlugin>{
  ...PluginBase,
  ...{
    niceName: "Spotify",
    description: "An experimental plugin for spotify.com",
    match: SpotifyPlayerUrlRegexMatch,
    version: "0.0.9",
    apiVersion: 2,
    authors: "Ahmed Kamal",
    init: function () {
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
    },

    commands: [
      {
        name: "spotify play",
        description: "Play the Spotify web player.",
        global: true,
        match: "spotify play",
        fn: async function () {
          let tab = await findSpotifyPlayerTabAsync();
          if (!tab) {
            const msg =
              "Spotify player seems to be closed, do you want me to open it?";
            if (prompt(msg, "yes") === "yes") {
              tab = await createSpotifyPlayerTabAsync();
            }
          }
          await sendSpotifyControlMessage(SpotifyControlButtons.Play, tab);
        },
      },
      {
        name: "spotify pause",
        description: "Pause the Spotify web player.",
        global: true,
        match: "spotify pause",
        fn: async function () {
          await sendSpotifyControlMessage(SpotifyControlButtons.Pause);
        },
      },
      {
        name: "spotify next",
        description: "Moves to the next song on the Spotify web player.",
        global: true,
        match: "spotify next",
        fn: async function () {
          await sendSpotifyControlMessage(SpotifyControlButtons.Next);
        },
      },
      {
        name: "spotify previous",
        description: "Moves to the previous song on the Spotify web player.",
        global: true,
        match: "spotify previous",
        fn: async function () {
          await sendSpotifyControlMessage(SpotifyControlButtons.Previous);
        },
      },
    ],
  },
};
