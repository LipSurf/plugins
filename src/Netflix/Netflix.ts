// lipsurf-plugins/src/Netflix/Netflix.ts
/// <reference types="lipsurf-types/extension"/>
declare const PluginBase: IPluginBase;

// Messaging

const LIPSURF_BOOT_SCRIPT_ID = "lipsurf-netflix-script";
const TO_PAGE_PROOF_KEY = String(Math.floor(Math.random() * 1000));
const FROM_PAGE_PROOF_KEY = String(Math.floor(Math.random() * 1000));

type Message<T> = { proofKey: string; payload: T };

const sendMessage = (payload: Command) =>
  (window as any).postMessage(
    JSON.stringify({ proofKey: TO_PAGE_PROOF_KEY, payload } as Message<Command>)
  );

/**
 * Receive Message
 */
(() => {
  window.addEventListener("message", ev => receiveMessage(ev.data));
  const receiveMessage = (messageStr: string) => {
    try {
      const message = JSON.parse(messageStr) as Message<Command>;
      if (message.proofKey === FROM_PAGE_PROOF_KEY) {
        const command = message.payload;
        switch (command.key) {
          case "changeText":
            return handleChangeTextAnswer(command);
          case "changeAudio":
            return handleChangeAudioAnswer(command);
        }
      }
    } catch {
      // Silent catch
      // This try catch is used only to catch JSON.parse failure
      // Which is impossible to happen within Netflix Plugin scope
    }
  };
})();

// Utilities

const stripNonAlphaNumericAndTrim = (someString: string) =>
  someString
    .split(" ")
    .map(someString => someString.replace(/[^\w\s]/gi, "").trim())
    .join(" ");

const navigateToSearch = (title: string) => {
  window.location.href = `https://www.netflix.com/search?q=${encodeURIComponent(
    title
  )}`;
};

// Context

/**
 * Context is currently disabled becacuse some weird behavior with non-normal
 * context
 */

enum NetflixPluginContextEnum {
  watch = "Netflix Video Player Controls",
  browse = "Browse Netflix"
}
type NetflixPluginContext = NetflixPluginContextEnum | null;

const contextManager = (() => {
  let enabled = true;

  type ContextPatcher = {
    add: (context: string) => void;
    remove: (context: string) => void;
  };

  /**
   * Patch context to avoid context duplication
   * due to addContext being called multiple times causing duplicate
   * context entry
   *
   * Usage:
   *
   * ```typescript
   * patchContext((patcher) => {
   *  patcher.add("ContextA")
   *  patcher.add("ContextB")
   *  patcher.add("ContextC")
   * });
   * ```
   */
  const patchContext = (fn: (patcher: ContextPatcher) => unknown) => {
    const contextSet = new Set(PluginBase.util.getContext());
    const contextPatcher = {
      add: (context: string) => {
        if (!contextSet.has(context)) {
          PluginBase.util.addContext(context);
        }
      },
      remove: (context: string) => {
        if (contextSet.has(context)) {
          PluginBase.util.removeContext(context);
        }
      }
    } as ContextPatcher;
    return fn(contextPatcher);
  };

  const createContextFromUrl = (url: URL): NetflixPluginContext => {
    const { pathname } = url;
    switch (true) {
      case pathname.startsWith("/watch"):
        return NetflixPluginContextEnum.watch;
      case pathname.startsWith("/latest"):
      case pathname.startsWith("/browse"):
      case pathname.startsWith("/title"):
        return NetflixPluginContextEnum.browse;
      default:
        return null;
    }
  };
  const setContext = (context: NetflixPluginContext) =>
    patchContext(patcher => {
      switch (true) {
        case context === NetflixPluginContextEnum.browse: {
          patcher.add(NetflixPluginContextEnum.browse);
          patcher.add("Normal");
          return;
        }
        case context === NetflixPluginContextEnum.watch: {
          patcher.add(NetflixPluginContextEnum.watch);
          patcher.remove("Normal");
          return;
        }
        default: {
          patcher.remove(NetflixPluginContextEnum.watch);
          patcher.remove(NetflixPluginContextEnum.browse);
          patcher.add("Normal");
          return;
        }
      }
    });

  const refreshCurrentContext = () => {
    try {
      setContext(createContextFromUrl(new URL(window.location.href)));
    } catch (error) {
      console.error(error);
    }
  };

  return {
    enable: async () => {
      enabled = true;
      while (enabled) {
        refreshCurrentContext();
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    },
    disable: () => {
      enabled = false;
      PluginBase.util.enterContext(["Normal"]);
    }
  };
})();

// Netflix specific functionalities

type Command =
  | { key: "play" }
  | { key: "pause" }
  /**
   * Disabled due to error:
   * Failed to execute 'requestFullscreen' on 'Element': API can only be initiated by a user gesture.
   * | { key: "toggleFullScreen" }
   */
  | ChangeTextCommand
  | ChangeAudioCommand
  | VolumeCommand
  | SeekCommand
  | WatchCommand
  | { key: "watchRandom" };
type VolumeCommand = {
  key: "volume";
  sub:
    | { key: "up" }
    | { key: "down" }
    | { key: "half" }
    | { key: "full" }
    | { key: "zero" }
    | { key: "setPercent"; percentage: number };
};
type SeekCommand = {
  key: "skip";
  sub:
    | { key: "to"; timestamp: number }
    | { key: "ahead"; duration: number }
    | { key: "behind"; duration: number };
};
type WatchCommand = { key: "watch"; title: string };
type ChangeTextCommand = {
  key: "changeText";
  sub:
    | { key: "ask"; query: string }
    | { key: "answer"; query: string; texts: NetflixText[] }
    | { key: "to"; trackId: string };
};
type ChangeAudioCommand = {
  key: "changeAudio";
  sub:
    | { key: "ask"; query: string }
    | { key: "answer"; query: string; audios: NetflixAudio[] }
    | { key: "to"; trackId: string };
};

type NetflixText = {
  trackId: string;
  displayName: string;
};

type NetflixAudio = {
  trackId: string;
  displayName: string;
};

export default <IPluginBase & IPlugin>{
  ...PluginBase,
  ...{
    niceName: "Netflix",
    description:
      "A Netflix plugin to assist audience in operating the video player and navigating through netflix web application",
    match: /.*\.netflix.com/,
    version: "1.0.0",
    init: () => contextManager.enable(),
    destroy: () => contextManager.disable(),
    contexts: {
      [NetflixPluginContextEnum.watch]: {
        commands: [
          "Watch::Pause",
          "Watch::Play",
          "Volume::Up",
          "Volume::Down",
          "Volume::Full",
          "Volume::Zero",
          "Volume::Half",
          "Volume::SetPercent",
          "ChangeAudio",
          "ChangeText",
          "Seek::To::Minute+Second",
          "Seek::To::Second",
          "Seek::Ahead::Minute+Second",
          "Seek::Ahead::Second",
          "Seek::Behind::Minute+Second",
          "Seek::Behind::Second"
        ]
      },
      [NetflixPluginContextEnum.browse]: {
        commands: ["Watch::Title", "Watch::Random", "Search"]
      }
    },
    commands: [
      {
        name: "Override::Netflix",
        match: "netflix",
        /* Empty to override netflix */
        pageFn: () => {}
      },
      {
        name: "Watch::Pause",
        match: ["pause", "stop"],
        pageFn: () => sendMessage({ key: "pause" }),
        normal: false
      },
      {
        name: "Watch::Play",
        match: "play",
        pageFn: () => sendMessage({ key: "play" }),
        normal: false
      },
      {
        name: "Volume::Up",
        match: "[volume/sound level] up",
        pageFn: () => sendMessage({ key: "volume", sub: { key: "up" } }),
        normal: false
      },
      {
        name: "Volume::Down",
        match: "[volume/sound level] down",
        pageFn: () => sendMessage({ key: "volume", sub: { key: "down" } }),
        normal: false
      },
      {
        name: "Volume::Full",
        match: "[volume/sound level] full",
        pageFn: () => sendMessage({ key: "volume", sub: { key: "full" } }),
        normal: false
      },
      {
        name: "Volume::Zero",
        match: "[volume/sound level] zero",
        pageFn: () => sendMessage({ key: "volume", sub: { key: "zero" } }),
        normal: false
      },
      {
        name: "Volume::Half",
        match: "[volume/sound level] half",
        pageFn: () => sendMessage({ key: "volume", sub: { key: "half" } }),
        normal: false
      },
      {
        name: "Volume::SetPercent",
        match: "set [volume/sound level] to # percent",
        pageFn: (_: string, volumePercentage: number) =>
          sendMessage({
            key: "volume",
            sub: { key: "setPercent", percentage: volumePercentage / 100 }
          }),
        normal: false
      },
      {
        name: "ChangeAudio",
        match: ["[change/switch] audio to *", "audio to *"],
        pageFn: (_: string, audioName?: string) =>
          !!audioName &&
          sendMessage({
            key: "changeAudio",
            sub: {
              key: "ask",
              query: audioName
            }
          }),
        normal: false
      },
      {
        name: "ChangeText",
        match: ["[change/switch] [text/subtitle] to *", "[text/subtitle] to *"],
        pageFn: (_: string, textName?: string) =>
          !!textName &&
          sendMessage({
            key: "changeText",
            sub: {
              key: "ask",
              query: textName
            }
          }),
        normal: false
      },
      {
        name: "Seek::To::Minute+Second",
        match: ["skip to minute #", "skip to minute # second #"],
        pageFn: (_: string, minute: number, second = 0) =>
          sendMessage({
            key: "skip",
            sub: { key: "to", timestamp: (60 * minute + second) * 1000 }
          }),
        normal: false
      },
      {
        name: "Seek::To::Second",
        match: ["skip to second #"],
        pageFn: (_: string, second: number) =>
          sendMessage({
            key: "skip",
            sub: { key: "to", timestamp: second * 1000 }
          }),
        normal: false
      },
      {
        name: "Seek::Ahead::Minute+Second",
        match: [
          "skip ahead # [minute/minutes]",
          "skip ahead # [minute/minutes] # [second/seconds]"
        ],
        pageFn: (_: string, minute: number, second = 0) =>
          sendMessage({
            key: "skip",
            sub: { key: "ahead", duration: (60 * minute + second) * 1000 }
          }),
        normal: false
      },
      {
        name: "Seek::Ahead::Second",
        match: ["skip ahead # [second/seconds]"],
        pageFn: (_: string, second: number) =>
          sendMessage({
            key: "skip",
            sub: { key: "ahead", duration: second * 1000 }
          }),
        normal: false
      },
      {
        name: "Seek::Behind::Minute+Second",
        match: [
          "skip behind # [minute/minutes]",
          "skip behind # [minute/minutes] # [second/seconds]"
        ],
        pageFn: (_: string, minute: number, second = 0) =>
          sendMessage({
            key: "skip",
            sub: { key: "behind", duration: (60 * minute + second) * 1000 }
          }),
        normal: false
      },
      {
        name: "Seek::Behind::Second",
        match: ["skip behind # [second/seconds]"],
        pageFn: (_: string, second: number) =>
          sendMessage({
            key: "skip",
            sub: { key: "behind", duration: second * 1000 }
          }),
        normal: false
      },

      {
        name: "Watch::Title",
        match: ["watch *"],
        pageFn: (_: string, title: string) =>
          sendMessage({ key: "watch", title: title.toLowerCase() }),
        normal: false
      },
      {
        name: "Watch::Random",
        match: ["random"],
        pageFn: (_: string) => sendMessage({ key: "watchRandom" }),
        normal: false
      },
      {
        name: "Search",
        match: ["search *"],
        pageFn: (_: string, title: string) => navigateToSearch(title),
        normal: false
      }
    ]
  }
};

const handleChangeTextAnswer = async (command: ChangeTextCommand) => {
  const { sub } = command;
  if (sub.key !== "answer") return;
  const tracks = sub.texts;
  const [index] = await PluginBase.util.fuzzyHighScore(
    sub.query,
    tracks.map(track => track.displayName).map(stripNonAlphaNumericAndTrim),
    undefined,
    true
  );
  const track = tracks[index];
  if (!track) return;
  sendMessage({
    key: "changeText",
    sub: {
      key: "to",
      trackId: track.trackId
    }
  });
};

const handleChangeAudioAnswer = async (command: ChangeAudioCommand) => {
  const { sub } = command;
  if (sub.key !== "answer") return;
  const tracks = sub.audios;
  const [index] = await PluginBase.util.fuzzyHighScore(
    sub.query,
    tracks.map(track => track.displayName).map(stripNonAlphaNumericAndTrim),
    undefined,
    true
  );
  const track = tracks[index];
  if (!track) return;
  sendMessage({
    key: "changeAudio",
    sub: {
      key: "to",
      trackId: track.trackId
    }
  });
};

/**
 * Variables inside this scope must use reference outside
 * This `injectables` scope will be stringifed and injected to main
 * page context to be able to access `window.netflix`
 */
export const injectables = (
  toPageProofKey: string,
  fromPageProofKey: string
) => {
  const sendMessage = (payload: Command) =>
    (window as any).postMessage(
      JSON.stringify({ proofKey: fromPageProofKey, payload } as Message<
        Command
      >)
    );
  const receiveMessage = (messageStr: string) => {
    try {
      const message = JSON.parse(messageStr) as Message<Command>;
      if (message.proofKey === toPageProofKey) {
        const command = message.payload;
        switch (command.key) {
          case "play":
            return withCurrentPlayer(player => player.play());
          case "pause":
            return withCurrentPlayer(player => player.pause());
          case "volume":
            return handleVolumeCommand(command);
          case "skip":
            return handleSeekCommand(command);
          case "watch":
            return handleWatch(command);
          case "watchRandom":
            return handleWatchRandom();
          case "changeText":
            return handleChangeText(command);
          case "changeAudio":
            return handleChangeAudio(command);
        }
      }
    } catch {
      // Silent catch
      // This try catch is used only to catch JSON.parse failure
      // Which is impossible to happen within Netflix Plugin scope
    }
  };

  const handleChangeText = (command: ChangeTextCommand) => {
    const { sub } = command;
    switch (sub.key) {
      case "ask":
        return withCurrentPlayer(player =>
          sendMessage({
            key: "changeText",
            sub: {
              key: "answer",
              texts: player.getTextTrackList() as NetflixText[],
              query: sub.query
            }
          } as ChangeTextCommand)
        );
      case "to":
        return withCurrentPlayer(player => {
          const track = (player.getTextTrackList() as NetflixText[]).find(
            track => track.trackId === sub.trackId
          );
          if (!track) return;
          player.setTextTrack(track);
        });
    }
  };

  const handleChangeAudio = (command: ChangeAudioCommand) => {
    const { sub } = command;
    switch (sub.key) {
      case "ask":
        return withCurrentPlayer(player =>
          sendMessage({
            key: "changeAudio",
            sub: {
              key: "answer",
              audios: player.getAudioTrackList(),
              query: sub.query
            }
          } as ChangeAudioCommand)
        );
      case "to":
        return withCurrentPlayer(player => {
          const track = (player.getAudioTrackList() as NetflixAudio[]).find(
            track => track.trackId === sub.trackId
          );
          if (!track) return;
          player.setAudioTrack(track);
        });
    }
  };

  const handleVolumeCommand = (command: VolumeCommand) =>
    withCurrentPlayer(player => {
      switch (command.sub.key) {
        case "up":
          return player.setVolume(Math.min(player.getVolume() + 0.1, 1));
        case "down":
          return player.setVolume(Math.max(player.getVolume() - 0.1, 0));
        case "full":
          return player.setVolume(1);
        case "zero":
          return player.setVolume(0);
        case "half":
          return player.setVolume(0.5);
        case "setPercent": {
          return player.setVolume(command.sub.percentage);
        }
      }
    });

  const handleSeekCommand = (command: SeekCommand) =>
    withCurrentPlayer(player => {
      switch (command.sub.key) {
        case "to":
          return player.seek(command.sub.timestamp);
        case "ahead":
          return player.seek(player.getCurrentTime() + command.sub.duration);
        case "behind":
          return player.seek(player.getCurrentTime() - command.sub.duration);
      }
    });

  const handleWatch = (command: WatchCommand) => {
    const videos = [...getInPageVideos(), ...getInCacheVideo()];
    const anchors = videos.find(({ title }) => {
      return title.toLowerCase().trim() === command.title.trim();
    });

    if (!anchors) return;
    navigateToWatch(anchors.videoId);
  };

  type InPageVideo = {
    anchorElement: HTMLAnchorElement;
    title: string;
    videoId: string;
  };

  type InCacheVideo = {
    data: {
      title?: {
        value: string;
      };
    };
    title: string;
    videoId: string;
  };

  const getInCacheVideo = (): InCacheVideo[] =>
    withCache(cache => {
      const videos = cache.videos as InCacheVideo["data"][] | null;
      if (!videos) return null;
      return Object.entries(videos)
        .map(([videoId, video]) => ({
          videoId,
          title: (video.title && video.title.value) || "",
          data: video
        }))
        .filter(video => video.title !== "");
    }) || [];

  const getInPageVideos = (): InPageVideo[] =>
    Array.from(document.querySelectorAll("a"))
      .map((anchorElement): InPageVideo | null => {
        if (!anchorElement.href) return null;
        const url = new URL(anchorElement.href, window.location.origin);
        if (url.pathname.startsWith("/watch/")) {
          const ariaLabel = anchorElement.getAttribute("aria-label") || "";
          return {
            anchorElement,
            title: ariaLabel,
            videoId: url.pathname.slice("/watch/".length)
          };
        }
        return null;
      })
      .filter((result): result is InPageVideo => result !== null);

  const handleWatchRandom = () => {
    const videoIds = Array.from(
      new Set([
        ...getInCacheVideo().map(({ videoId }) => videoId),
        ...getInPageVideos().map(({ videoId }) => videoId)
      ])
    );
    const videoId = videoIds[Math.round(Math.random() * (videoIds.length - 1))];
    if (!videoId) return;
    navigateToWatch(videoId);
  };

  const navigateToWatch = (videoId: string) => {
    window.location.href = `https://www.netflix.com/watch/${videoId}`;
  };

  const withCurrentPlayer = (fn: (player: any) => unknown) => {
    const currentPlayer = getCurrentPlayer();
    if (currentPlayer) fn(currentPlayer);
  };

  const getCurrentPlayer = () => {
    const videoPlayer = getVideoPlayerObject();
    if (!videoPlayer) return null;

    const session = getCurrentWatchSession();
    if (!session) return null;

    const playerElement = videoPlayer.getVideoPlayerBySessionId(
      session.sessionId
    );
    return playerElement || null;
  };

  const getCurrentWatchSession = () => {
    try {
      const [session] = (window as any).netflix.appContext
        .getPlayerApp()
        .getAPI()
        .getOpenPlaybackSessions();
      if (!session) return null;
      if (session.playbackInitiator !== "USER") return null;
      return session;
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  const getVideoPlayerObject = () => {
    try {
      return (
        (window as any).netflix.appContext.state.playerApp.getAPI()
          .videoPlayer || null
      );
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  const getCache = () =>
    withNetflix(netflix =>
      netflix.appContext.getState().pathEvaluator.getCache()
    );

  const withCache = (fn: (cache: any) => any) => {
    try {
      const cache = getCache();
      if (!cache) return null;
      return fn(cache);
    } catch (error) {
      console.error(error);
    }
  };

  const withNetflix = (fn: (netflix: any) => any) => {
    try {
      const netflix = (window as any).netflix;
      if (!netflix) return null;
      return fn(netflix);
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  window.addEventListener("message", ev => receiveMessage(ev.data));
};

if (!document.getElementById(LIPSURF_BOOT_SCRIPT_ID)) {
  const script = document.createElement("script");
  script.id = LIPSURF_BOOT_SCRIPT_ID;
  script.textContent = `(${injectables.toString()})("${TO_PAGE_PROOF_KEY}","${FROM_PAGE_PROOF_KEY}");`;
  ((document.head || document.documentElement) as any).appendChild(script);
  script.remove();
}
