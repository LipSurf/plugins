// lipsurf-plugins/src/Netflix/Netflix.ts

/**
 * Limitations and gotchas:
 * - This plugin relies on Netflix's `window.netflix` publicized object.
 *   This plugin MAY fails if netflix introduce a change to that `window.netflix` object
 * - Watch command relies on videos on cache. It only queries the show netflix has loaded from
 *   their service and does not query it directly from the service.
 *
 * TODOs:
 * - Remove ContextPatcher stuff when context duplication caused by PluginBase.util.addContext is fixed
 * - Remove homophone `"search": "search"` after homophone priority issue is fixed on the Platform-land
 *   https://discuss.lipsurf.com/t/homophones-must-be-a-lower-priority-than-other-plugins-command/297/3
 */

/// <reference types="lipsurf-types/extension"/>
declare const PluginBase: IPluginBase;

// Messaging

const LIPSURF_BOOT_SCRIPT_ID = "lipsurf-netflix-script";
const TO_PAGE_PROOF_KEY = PluginBase.util.getNoCollisionUniqueAttr();
const FROM_PAGE_PROOF_KEY = PluginBase.util.getNoCollisionUniqueAttr();

type Message<T> = { proofKey: string; payload: T };

const sendMessage = (payload: Command) =>
  (window as any).postMessage(
    JSON.stringify({ proofKey: TO_PAGE_PROOF_KEY, payload } as Message<Command>)
  );

// Utilities

const parseJsonOrNull = <T>(maybeJSONString: string): Message<T> | null => {
  try {
    return JSON.parse(maybeJSONString);
  } catch {
    return null;
  }
};

const consumeMessageStringAsCommand = (
  messageStr: string,
  proofKey: string,
  callback: (command: Command) => unknown
) => {
  const message = parseJsonOrNull<Command>(messageStr);
  if (message && message.proofKey === proofKey) {
    callback(message.payload);
  }
};

const navigateToSearch = (title: string) => {
  window.location.href = `https://www.netflix.com/search?q=${encodeURIComponent(
    title
  )}`;
};

const navigateToWatch = (videoId: string) => {
  window.location.href = `https://www.netflix.com/watch/${videoId}`;
};

// Context

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
      case pathname.startsWith("/search"):
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
type WatchCommand = {
  key: "watch";
  sub:
    | { key: "ask-videos"; query: string }
    | { key: "answer-matches"; query: string; videos: VideoBase[] };
};
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

type VideoBase = {
  title: string;
  videoId: string;
};

/**
 * Videos that are queried from anchor elements in the page
 */
type InPageVideo = VideoBase & {
  anchorElement: HTMLAnchorElement;
};

/**
 * Videos that are queried from NetflixCache
 */
type InCacheVideo = VideoBase & {
  data: {
    title?: {
      value: string;
    };
  };
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
    homophones: {
      /**
       * Override Google plugin's search homophones
       * TODO: Remove once homophone priority issue is fixed
       */
      search: "search"
    },
    contexts: {
      [NetflixPluginContextEnum.watch]: {
        commands: [
          "Pause Video",
          "Play Video",
          "Volume Up",
          "Volume Down",
          "Volume Full",
          "Volume Zero",
          "Volume Half",
          "Volume Set In Percentage",
          "Change Audio",
          "Change Subtitle",
          "Seek To By Minute and Second",
          "Seek To By Second",
          "Seek Ahead By Second",
          "Seek Ahead By Second",
          "Seek Behind By Second",
          "Seek Behind By Second"
        ]
      },
      [NetflixPluginContextEnum.browse]: {
        commands: ["Watch By Title", "Watch Random Show", "Search Show"]
      }
    },
    commands: [
      {
        name: "Override::Netflix",
        match: "netflix",
        /* Empty to override global netflix command*/
        pageFn: () => {}
      },
      {
        name: "Pause Video",
        match: ["pause", "stop"],
        pageFn: () => sendMessage({ key: "pause" }),
        normal: false
      },
      {
        name: "Play Video",
        match: "play",
        pageFn: () => sendMessage({ key: "play" }),
        normal: false
      },
      {
        name: "Volume Up",
        match: "[volume/sound level] up",
        pageFn: () => sendMessage({ key: "volume", sub: { key: "up" } }),
        normal: false
      },
      {
        name: "Volume Down",
        match: "[volume/sound level] down",
        pageFn: () => sendMessage({ key: "volume", sub: { key: "down" } }),
        normal: false
      },
      {
        name: "Volume Full",
        match: "[volume/sound level] full",
        pageFn: () => sendMessage({ key: "volume", sub: { key: "full" } }),
        normal: false
      },
      {
        name: "Volume Zero",
        match: "[volume/sound level] zero",
        pageFn: () => sendMessage({ key: "volume", sub: { key: "zero" } }),
        normal: false
      },
      {
        name: "Volume Half",
        match: "[volume/sound level] half",
        pageFn: () => sendMessage({ key: "volume", sub: { key: "half" } }),
        normal: false
      },
      {
        name: "Volume Set In Percentage",
        match: "set [volume/sound level] to # percent",
        pageFn: (_: string, volumePercentage: number) =>
          sendMessage({
            key: "volume",
            sub: { key: "setPercent", percentage: volumePercentage / 100 }
          }),
        normal: false
      },
      {
        name: "Change Audio",
        match: ["[/change/switch] audio to *"],
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
        name: "Change Subtitle",
        match: ["[/change/switch] [text/subtitle] to *"],
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
        name: "Seek To By Minute and Second",
        match: ["skip to minute #", "skip to minute # second #"],
        pageFn: (_: string, minute: number, second = 0) =>
          sendMessage({
            key: "skip",
            sub: { key: "to", timestamp: (60 * minute + second) * 1000 }
          }),
        normal: false
      },
      {
        name: "Seek To By Second",
        match: ["skip to second #"],
        pageFn: (_: string, second: number) =>
          sendMessage({
            key: "skip",
            sub: { key: "to", timestamp: second * 1000 }
          }),
        normal: false
      },
      {
        name: "Seek Ahead By Second",
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
        name: "Seek Ahead By Second",
        match: ["skip ahead # [second/seconds]"],
        pageFn: (_: string, second: number) =>
          sendMessage({
            key: "skip",
            sub: { key: "ahead", duration: second * 1000 }
          }),
        normal: false
      },
      {
        name: "Seek Behind By Second",
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
        name: "Seek Behind By Second",
        match: ["skip behind # [second/seconds]"],
        pageFn: (_: string, second: number) =>
          sendMessage({
            key: "skip",
            sub: { key: "behind", duration: second * 1000 }
          }),
        normal: false
      },

      {
        name: "Watch By Title",
        match: ["[watch/play] *"],
        pageFn: (_: string, query: string) =>
          sendMessage({
            key: "watch",
            sub: {
              key: "ask-videos",
              query
            }
          }),
        normal: false
      },
      {
        name: "Watch Random Show",
        match: ["random"],
        pageFn: (_: string) => sendMessage({ key: "watchRandom" }),
        normal: false
      },
      {
        name: "Search Show",
        match: ["search *"],
        pageFn: (_: string, title: string) => navigateToSearch(title),
        normal: false
      }
    ]
  }
};

/**
 * Receive Message
 */
(() => {
  window.addEventListener("message", ev => receiveMessage(ev.data));
  const receiveMessage = (messageStr: string) =>
    consumeMessageStringAsCommand(messageStr, FROM_PAGE_PROOF_KEY, command => {
      switch (command.key) {
        case "changeText":
          return handleChangeTextAnswer(command);
        case "changeAudio":
          return handleChangeAudioAnswer(command);
        case "watch":
          return handleWatchAnswer(command);
      }
    });
})();

const handleWatchAnswer = async (command: WatchCommand) => {
  const { sub } = command;
  if (sub.key !== "answer-matches") return;
  const videos = sub.videos;

  // This exact title matching video works well because LipSurf scans for ariaLabel which
  // actually matches the videos title queried
  const exactVideo = videos.find(video => video.title === sub.query);
  if (exactVideo) {
    return navigateToWatch(exactVideo.videoId);
  }

  // Filter out videos which title are empty string
  const filteredVideos = videos.filter(video => !!video.title.trim());

  /**
   * Sort descending. fuzzyHighScore somehow does not return the same value
   * as these sequence below. If it turns out a bug, then
   * TODO: replace these sequence with fuzzyHighScore
   */
  const results = (
    await Promise.all(
      filteredVideos.map(video =>
        PluginBase.util.fuzzyHighScore(sub.query, [video.title], 0, true)
      )
    )
  )
    .map(([_, score], index) => ({
      score,
      index
    }))
    .sort(({ score: scoreA }, { score: scoreB }) => scoreB - scoreA);

  const highScore = results[0];

  if (highScore.score > 0.8) {
    const fuzzyVideo = filteredVideos[highScore.index];
    if (fuzzyVideo) {
      return navigateToWatch(fuzzyVideo.videoId);
    }
  }

  /**
   * When no match comes up, watch will search the query instead
   */
  return navigateToSearch(sub.query);
};

const handleChangeTextAnswer = async (command: ChangeTextCommand) => {
  const { sub } = command;
  if (sub.key !== "answer") return;
  const tracks = sub.texts;
  const [index] = await PluginBase.util.fuzzyHighScore(
    sub.query,
    tracks.map(track => track.displayName),
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
    tracks.map(track => track.displayName),
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
  // Utilities

  const parseJsonOrNull = <T>(maybeJSONString: string): Message<T> | null => {
    try {
      return JSON.parse(maybeJSONString);
    } catch {
      return null;
    }
  };

  const consumeMessageStringAsCommand = (
    messageStr: string,
    proofKey: string,
    callback: (command: Command) => unknown
  ) => {
    const message = parseJsonOrNull<Command>(messageStr);
    if (message && message.proofKey === proofKey) {
      callback(message.payload);
    }
  };

  const navigateToWatch = (videoId: string) => {
    window.location.href = `https://www.netflix.com/watch/${videoId}`;
  };

  // Messaging

  const sendMessage = (payload: Command) =>
    (window as any).postMessage(
      JSON.stringify({ proofKey: fromPageProofKey, payload } as Message<
        Command
      >)
    );

  const receiveMessage = (messageStr: string) => {
    consumeMessageStringAsCommand(messageStr, toPageProofKey, command => {
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
    });
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
    switch (command.sub.key) {
      case "ask-videos": {
        return sendMessage({
          key: "watch",
          sub: {
            key: "answer-matches",
            query: command.sub.query,
            videos: [...getInPageVideos(), ...getInCacheVideo()].map(
              ({ videoId, title }) => ({
                videoId,
                title
              })
            )
          }
        } as WatchCommand);
      }
    }
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

  // Netflix specific

  const withCurrentPlayer = (fn: (player: any) => unknown) => {
    const currentPlayer = getCurrentPlayer();
    if (currentPlayer) return fn(currentPlayer);
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

  const getCurrentWatchSession = () =>
    withNetflix(netflix => {
      const [session] = netflix.appContext
        .getPlayerApp()
        .getAPI()
        .getOpenPlaybackSessions();
      if (!session) return null;
      if (session.playbackInitiator !== "USER") return null;
      return session;
    });

  const getVideoPlayerObject = () =>
    withNetflix(
      netflix => netflix.appContext.state.playerApp.getAPI().videoPlayer
    );

  /**
   * Netflix cache stores cached netflix-related data
   * cache.videos for example stores videos that are either loaded or are going
   * to be loaded into the page
   */
  const withCache = (fn: (cache: any) => any) =>
    withNetflix(netflix =>
      fn(netflix.appContext.getState().pathEvaluator.getCache())
    );

  /**
   * Netflix publicize its appContext via `window.netflix`
   */
  const withNetflix = (fn: (netflix: any) => any) =>
    tryCatch(() => fn((window as any).netflix));

  const tryCatch = <T>(fn: () => T) => {
    try {
      return fn();
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
