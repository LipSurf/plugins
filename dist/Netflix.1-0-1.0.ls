import PluginBase from 'chrome-extension://lnnmjmalakahagblkkcnjkoaihlfglon/dist/modules/plugin-base.js';import ExtensionUtil from 'chrome-extension://lnnmjmalakahagblkkcnjkoaihlfglon/dist/modules/extension-util.js';// dist/tmp/Netflix/Netflix.js
var TO_PAGE_PROOF_KEY = PluginBase.util.getNoCollisionUniqueAttr();
var FROM_PAGE_PROOF_KEY = PluginBase.util.getNoCollisionUniqueAttr();
var NetflixPluginContextEnum = { watch: "Netflix Video Player Controls", browse: "Browse Netflix" };
var contextManager = (() => {
  let enabled = true;
  const createContextFromUrl = (url) => {
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
  const setContext = (context) => {
    const currentContextSet = new Set(PluginBase.util.getContext());
    currentContextSet.delete(PluginBase.constants.contexts.Normal);
    currentContextSet.delete(NetflixPluginContextEnum.watch);
    currentContextSet.delete(NetflixPluginContextEnum.browse);
    switch (true) {
      case context === NetflixPluginContextEnum.browse: {
        PluginBase.util.enterContext([NetflixPluginContextEnum.browse, PluginBase.constants.contexts.Normal, ...Array.from(currentContextSet)]);
        return;
      }
      case context === NetflixPluginContextEnum.watch: {
        PluginBase.util.enterContext([NetflixPluginContextEnum.watch, ...Array.from(currentContextSet)]);
        return;
      }
      default: {
        PluginBase.util.removeContext(NetflixPluginContextEnum.watch);
        PluginBase.util.removeContext(NetflixPluginContextEnum.browse);
        PluginBase.util.appendContext(PluginBase.constants.contexts.Normal);
        return;
      }
    }
  };
  const refreshCurrentContext = () => {
    try {
      setContext(createContextFromUrl(new URL(window.location.href)));
    } catch (error) {
      console.error(error);
    }
  };
  return { enable: async () => {
    enabled = true;
    while (enabled) {
      refreshCurrentContext();
      await new Promise((resolve) => setTimeout(resolve, 1e3));
    }
  }, disable: () => {
    enabled = false;
    PluginBase.util.enterContext([PluginBase.constants.contexts.Normal]);
  } };
})();
var Netflix_default = { "languages": {}, "niceName": "Netflix", "description": "A Netflix plugin to assist audience in operating the video player and navigating through netflix web application", "match": /.*\.netflix.com/, "version": "1.0.1", "apiVersion": 2, "authors": "Alan, Miko", "homophones": { "search": "search" }, "contexts": { "Netflix Video Player Controls": { "commands": ["Pause Video", "Play Video", "Volume Up", "Volume Down", "Volume Full", "Volume Zero", "Volume Half", "Volume Set In Percentage", "Change Audio", "Change Subtitle", "Seek To By Minute and Second", "Seek To By Second", "Seek Ahead By Second", "Seek Ahead By Second", "Seek Behind By Second", "Seek Behind By Second"] }, "Browse Netflix": { "commands": ["Watch By Title", "Watch Random Show", "Search Show"] } }, "commands": [{ "name": "Override::Netflix", "match": "netflix" }, { "name": "Pause Video", "match": ["pause", "stop"], "normal": false }, { "name": "Play Video", "match": "play", "normal": false }, { "name": "Volume Up", "match": "[volume/sound level] up", "normal": false }, { "name": "Volume Down", "match": "[volume/sound level] down", "normal": false }, { "name": "Volume Full", "match": "[volume/sound level] full", "normal": false }, { "name": "Volume Zero", "match": "[volume/sound level] zero", "normal": false }, { "name": "Volume Half", "match": "[volume/sound level] half", "normal": false }, { "name": "Volume Set In Percentage", "match": "set [volume/sound level] to # percent", "normal": false }, { "name": "Change Audio", "match": ["[/change/switch] audio to *"], "normal": false }, { "name": "Change Subtitle", "match": ["[/change/switch] [text/subtitle] to *"], "normal": false }, { "name": "Seek To By Minute and Second", "match": ["skip to minute #", "skip to minute # second #"], "normal": false }, { "name": "Seek To By Second", "match": ["skip to second #"], "normal": false }, { "name": "Seek Ahead By Second", "match": ["skip ahead # [minute/minutes]", "skip ahead # [minute/minutes] # [second/seconds]"], "normal": false }, { "name": "Seek Ahead By Second", "match": ["skip ahead # [second/seconds]"], "normal": false }, { "name": "Seek Behind By Second", "match": ["skip behind # [minute/minutes]", "skip behind # [minute/minutes] # [second/seconds]"], "normal": false }, { "name": "Seek Behind By Second", "match": ["skip behind # [second/seconds]"], "normal": false }, { "name": "Watch By Title", "match": ["[watch/play] *"], "normal": false }, { "name": "Watch Random Show", "match": ["random"], "normal": false }, { "name": "Search Show", "match": ["search *"], "normal": false }] };
export {
  Netflix_default as default
};
LS-SPLIT// dist/tmp/Netflix/Netflix.js
allPlugins.Netflix = (() => {
  var LIPSURF_BOOT_SCRIPT_ID = "lipsurf-netflix-script";
  var TO_PAGE_PROOF_KEY = PluginBase.util.getNoCollisionUniqueAttr();
  var FROM_PAGE_PROOF_KEY = PluginBase.util.getNoCollisionUniqueAttr();
  var sendMessage = (payload) => window.postMessage(JSON.stringify({ proofKey: TO_PAGE_PROOF_KEY, payload }));
  var parseJsonOrNull = (maybeJSONString) => {
    try {
      return JSON.parse(maybeJSONString);
    } catch (e) {
      return null;
    }
  };
  var consumeMessageStringAsCommand = (messageStr, proofKey, callback) => {
    const message = parseJsonOrNull(messageStr);
    if (message && message.proofKey === proofKey) {
      callback(message.payload);
    }
  };
  var navigateToSearch = (title) => {
    window.location.href = `https://www.netflix.com/search?q=${encodeURIComponent(title)}`;
  };
  var navigateToWatch = (videoId) => {
    window.location.href = `https://www.netflix.com/watch/${videoId}`;
  };
  var NetflixPluginContextEnum = { watch: "Netflix Video Player Controls", browse: "Browse Netflix" };
  var contextManager = (() => {
    let enabled = true;
    const createContextFromUrl = (url) => {
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
    const setContext = (context) => {
      const currentContextSet = new Set(PluginBase.util.getContext());
      currentContextSet.delete(PluginBase.constants.contexts.Normal);
      currentContextSet.delete(NetflixPluginContextEnum.watch);
      currentContextSet.delete(NetflixPluginContextEnum.browse);
      switch (true) {
        case context === NetflixPluginContextEnum.browse: {
          PluginBase.util.enterContext([NetflixPluginContextEnum.browse, PluginBase.constants.contexts.Normal, ...Array.from(currentContextSet)]);
          return;
        }
        case context === NetflixPluginContextEnum.watch: {
          PluginBase.util.enterContext([NetflixPluginContextEnum.watch, ...Array.from(currentContextSet)]);
          return;
        }
        default: {
          PluginBase.util.removeContext(NetflixPluginContextEnum.watch);
          PluginBase.util.removeContext(NetflixPluginContextEnum.browse);
          PluginBase.util.appendContext(PluginBase.constants.contexts.Normal);
          return;
        }
      }
    };
    const refreshCurrentContext = () => {
      try {
        setContext(createContextFromUrl(new URL(window.location.href)));
      } catch (error) {
        console.error(error);
      }
    };
    return { enable: async () => {
      enabled = true;
      while (enabled) {
        refreshCurrentContext();
        await new Promise((resolve) => setTimeout(resolve, 1e3));
      }
    }, disable: () => {
      enabled = false;
      PluginBase.util.enterContext([PluginBase.constants.contexts.Normal]);
    } };
  })();
  var Netflix_default = { ...PluginBase, ...{ "init": () => {
    if (!document.getElementById(LIPSURF_BOOT_SCRIPT_ID)) {
      const script = document.createElement("script");
      script.id = LIPSURF_BOOT_SCRIPT_ID;
      script.textContent = `(${injectables.toString()})("${TO_PAGE_PROOF_KEY}","${FROM_PAGE_PROOF_KEY}");`;
      (document.head || document.documentElement).appendChild(script);
      script.remove();
    }
    contextManager.enable();
  }, "destroy": void 0, "commands": { "Override::Netflix": { "pageFn": () => {
  } }, "Pause Video": { "pageFn": () => sendMessage({ key: "pause" }) }, "Play Video": { "pageFn": () => sendMessage({ key: "play" }) }, "Volume Up": { "pageFn": () => sendMessage({ key: "volume", sub: { key: "up" } }) }, "Volume Down": { "pageFn": () => sendMessage({ key: "volume", sub: { key: "down" } }) }, "Volume Full": { "pageFn": () => sendMessage({ key: "volume", sub: { key: "full" } }) }, "Volume Zero": { "pageFn": () => sendMessage({ key: "volume", sub: { key: "zero" } }) }, "Volume Half": { "pageFn": () => sendMessage({ key: "volume", sub: { key: "half" } }) }, "Volume Set In Percentage": { "pageFn": (transcript, volumePercentage) => sendMessage({ key: "volume", sub: { key: "setPercent", percentage: volumePercentage / 100 } }) }, "Change Audio": { "pageFn": (transcript, audioName) => sendMessage({ key: "changeAudio", sub: { key: "ask", query: audioName.normTs } }) }, "Change Subtitle": { "pageFn": (transcript, textName) => sendMessage({ key: "changeText", sub: { key: "ask", query: textName.normTs } }) }, "Seek To By Minute and Second": { "pageFn": (transcript, minute, second = 0) => sendMessage({ key: "skip", sub: { key: "to", timestamp: (60 * minute + second) * 1e3 } }) }, "Seek To By Second": { "pageFn": (transcript, second) => sendMessage({ key: "skip", sub: { key: "to", timestamp: second * 1e3 } }) }, "Seek Ahead By Second": { "pageFn": (transcript, second) => sendMessage({ key: "skip", sub: { key: "ahead", duration: second * 1e3 } }) }, "Seek Behind By Second": { "pageFn": (transcript, second) => sendMessage({ key: "skip", sub: { key: "behind", duration: second * 1e3 } }) }, "Watch By Title": { "pageFn": (transcript, query) => sendMessage({ key: "watch", sub: { key: "ask-videos", query: query.normTs } }) }, "Watch Random Show": { "pageFn": () => sendMessage({ key: "watchRandom" }) }, "Search Show": { "pageFn": (transcript, title) => navigateToSearch(title.normTs) } } } };
  (() => {
    window.addEventListener("message", (ev) => receiveMessage(ev.data));
    const receiveMessage = (messageStr) => consumeMessageStringAsCommand(messageStr, FROM_PAGE_PROOF_KEY, (command) => {
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
  var handleWatchAnswer = async (command) => {
    const { sub } = command;
    if (sub.key !== "answer-matches")
      return;
    const videos = sub.videos;
    const exactVideo = videos.find((video) => video.title === sub.query);
    if (exactVideo) {
      return navigateToWatch(exactVideo.videoId);
    }
    const filteredVideos = videos.filter((video) => !!video.title.trim());
    const results = (await Promise.all(filteredVideos.map((video) => PluginBase.util.fuzzyHighScore(sub.query, [video.title], 0, true)))).map(([_, score], index) => ({ score, index })).sort(({ score: scoreA }, { score: scoreB }) => scoreB - scoreA);
    const highScore = results[0];
    if (highScore.score > 0.8) {
      const fuzzyVideo = filteredVideos[highScore.index];
      if (fuzzyVideo) {
        return navigateToWatch(fuzzyVideo.videoId);
      }
    }
    return navigateToSearch(sub.query);
  };
  var handleChangeTextAnswer = async (command) => {
    const { sub } = command;
    if (sub.key !== "answer")
      return;
    const tracks = sub.texts;
    const [index] = await PluginBase.util.fuzzyHighScore(sub.query, tracks.map((track) => track.displayName), void 0, true);
    const track1 = tracks[index];
    if (!track1)
      return;
    sendMessage({ key: "changeText", sub: { key: "to", trackId: track1.trackId } });
  };
  var handleChangeAudioAnswer = async (command) => {
    const { sub } = command;
    if (sub.key !== "answer")
      return;
    const tracks = sub.audios;
    const [index] = await PluginBase.util.fuzzyHighScore(sub.query, tracks.map((track) => track.displayName), void 0, true);
    const track2 = tracks[index];
    if (!track2)
      return;
    sendMessage({ key: "changeAudio", sub: { key: "to", trackId: track2.trackId } });
  };
  var injectables = (toPageProofKey, fromPageProofKey) => {
    const parseJsonOrNull1 = (maybeJSONString) => {
      try {
        return JSON.parse(maybeJSONString);
      } catch (e) {
        return null;
      }
    };
    const consumeMessageStringAsCommand1 = (messageStr, proofKey, callback) => {
      const message = parseJsonOrNull1(messageStr);
      if (message && message.proofKey === proofKey) {
        callback(message.payload);
      }
    };
    const navigateToWatch1 = (videoId) => {
      window.location.href = `https://www.netflix.com/watch/${videoId}`;
    };
    const sendMessage1 = (payload) => window.postMessage(JSON.stringify({ proofKey: fromPageProofKey, payload }));
    const receiveMessage = (messageStr) => {
      consumeMessageStringAsCommand1(messageStr, toPageProofKey, (command) => {
        switch (command.key) {
          case "play":
            return withCurrentPlayer((player) => player.play());
          case "pause":
            return withCurrentPlayer((player) => player.pause());
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
    const handleChangeText = (command) => {
      const { sub } = command;
      switch (sub.key) {
        case "ask":
          return withCurrentPlayer((player) => sendMessage1({ key: "changeText", sub: { key: "answer", texts: player.getTextTrackList(), query: sub.query } }));
        case "to":
          return withCurrentPlayer((player) => {
            const track3 = player.getTextTrackList().find((track) => track.trackId === sub.trackId);
            if (!track3)
              return;
            player.setTextTrack(track3);
          });
      }
    };
    const handleChangeAudio = (command) => {
      const { sub } = command;
      switch (sub.key) {
        case "ask":
          return withCurrentPlayer((player) => sendMessage1({ key: "changeAudio", sub: { key: "answer", audios: player.getAudioTrackList(), query: sub.query } }));
        case "to":
          return withCurrentPlayer((player) => {
            const track4 = player.getAudioTrackList().find((track) => track.trackId === sub.trackId);
            if (!track4)
              return;
            player.setAudioTrack(track4);
          });
      }
    };
    const handleVolumeCommand = (command) => withCurrentPlayer((player) => {
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
    const handleSeekCommand = (command) => withCurrentPlayer((player) => {
      switch (command.sub.key) {
        case "to":
          return player.seek(command.sub.timestamp);
        case "ahead":
          return player.seek(player.getCurrentTime() + command.sub.duration);
        case "behind":
          return player.seek(player.getCurrentTime() - command.sub.duration);
      }
    });
    const handleWatch = (command) => {
      switch (command.sub.key) {
        case "ask-videos": {
          return sendMessage1({ key: "watch", sub: { key: "answer-matches", query: command.sub.query, videos: [...getInPageVideos(), ...getInCacheVideo()].map(({ videoId, title }) => ({ videoId, title })) } });
        }
      }
    };
    const getInCacheVideo = () => withCache((cache) => {
      const videos = cache.videos;
      if (!videos)
        return null;
      return Object.entries(videos).map(([videoId, video]) => ({ videoId, title: video.title && video.title.value || "", data: video })).filter((video) => video.title !== "");
    }) || [];
    const getInPageVideos = () => Array.from(document.querySelectorAll("a")).map((anchorElement) => {
      if (!anchorElement.href)
        return null;
      const url = new URL(anchorElement.href, window.location.origin);
      if (url.pathname.startsWith("/watch/")) {
        const ariaLabel = anchorElement.getAttribute("aria-label") || "";
        return { anchorElement, title: ariaLabel, videoId: url.pathname.slice("/watch/".length) };
      }
      return null;
    }).filter((result) => result !== null);
    const handleWatchRandom = () => {
      const videoIds = Array.from(/* @__PURE__ */ new Set([...getInCacheVideo().map(({ videoId }) => videoId), ...getInPageVideos().map(({ videoId }) => videoId)]));
      const videoId1 = videoIds[Math.round(Math.random() * (videoIds.length - 1))];
      if (!videoId1)
        return;
      navigateToWatch1(videoId1);
    };
    const withCurrentPlayer = (fn) => {
      const currentPlayer = getCurrentPlayer();
      if (currentPlayer)
        return fn(currentPlayer);
    };
    const getCurrentPlayer = () => {
      const videoPlayer = getVideoPlayerObject();
      if (!videoPlayer)
        return null;
      const session = getCurrentWatchSession();
      if (!session)
        return null;
      const playerElement = videoPlayer.getVideoPlayerBySessionId(session.sessionId);
      return playerElement || null;
    };
    const getCurrentWatchSession = () => withNetflix((netflix) => {
      const [session] = netflix.appContext.getPlayerApp().getAPI().getOpenPlaybackSessions();
      if (!session)
        return null;
      if (session.playbackInitiator !== "USER")
        return null;
      return session;
    });
    const getVideoPlayerObject = () => withNetflix((netflix) => netflix.appContext.state.playerApp.getAPI().videoPlayer);
    const withCache = (fn) => withNetflix((netflix) => fn(netflix.appContext.getState().pathEvaluator.getCache()));
    const withNetflix = (fn) => tryCatch(() => fn(window.netflix));
    const tryCatch = (fn) => {
      try {
        return fn();
      } catch (error) {
        console.error(error);
        return null;
      }
    };
    window.addEventListener("message", (ev) => receiveMessage(ev.data));
  };
  return Netflix_default;
})();
LS-SPLIT// dist/tmp/Netflix/Netflix.js
allPlugins.Netflix = (() => {
  var LIPSURF_BOOT_SCRIPT_ID = "lipsurf-netflix-script";
  var TO_PAGE_PROOF_KEY = PluginBase.util.getNoCollisionUniqueAttr();
  var FROM_PAGE_PROOF_KEY = PluginBase.util.getNoCollisionUniqueAttr();
  var sendMessage = (payload) => window.postMessage(JSON.stringify({ proofKey: TO_PAGE_PROOF_KEY, payload }));
  var parseJsonOrNull = (maybeJSONString) => {
    try {
      return JSON.parse(maybeJSONString);
    } catch (e) {
      return null;
    }
  };
  var consumeMessageStringAsCommand = (messageStr, proofKey, callback) => {
    const message = parseJsonOrNull(messageStr);
    if (message && message.proofKey === proofKey) {
      callback(message.payload);
    }
  };
  var navigateToSearch = (title) => {
    window.location.href = `https://www.netflix.com/search?q=${encodeURIComponent(title)}`;
  };
  var navigateToWatch = (videoId) => {
    window.location.href = `https://www.netflix.com/watch/${videoId}`;
  };
  var NetflixPluginContextEnum = { watch: "Netflix Video Player Controls", browse: "Browse Netflix" };
  var contextManager = (() => {
    let enabled = true;
    const createContextFromUrl = (url) => {
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
    const setContext = (context) => {
      const currentContextSet = new Set(PluginBase.util.getContext());
      currentContextSet.delete(PluginBase.constants.contexts.Normal);
      currentContextSet.delete(NetflixPluginContextEnum.watch);
      currentContextSet.delete(NetflixPluginContextEnum.browse);
      switch (true) {
        case context === NetflixPluginContextEnum.browse: {
          PluginBase.util.enterContext([NetflixPluginContextEnum.browse, PluginBase.constants.contexts.Normal, ...Array.from(currentContextSet)]);
          return;
        }
        case context === NetflixPluginContextEnum.watch: {
          PluginBase.util.enterContext([NetflixPluginContextEnum.watch, ...Array.from(currentContextSet)]);
          return;
        }
        default: {
          PluginBase.util.removeContext(NetflixPluginContextEnum.watch);
          PluginBase.util.removeContext(NetflixPluginContextEnum.browse);
          PluginBase.util.appendContext(PluginBase.constants.contexts.Normal);
          return;
        }
      }
    };
    const refreshCurrentContext = () => {
      try {
        setContext(createContextFromUrl(new URL(window.location.href)));
      } catch (error) {
        console.error(error);
      }
    };
    return { enable: async () => {
      enabled = true;
      while (enabled) {
        refreshCurrentContext();
        await new Promise((resolve) => setTimeout(resolve, 1e3));
      }
    }, disable: () => {
      enabled = false;
      PluginBase.util.enterContext([PluginBase.constants.contexts.Normal]);
    } };
  })();
  var Netflix_default = { ...PluginBase, ...{ "init": () => {
    if (!document.getElementById(LIPSURF_BOOT_SCRIPT_ID)) {
      const script = document.createElement("script");
      script.id = LIPSURF_BOOT_SCRIPT_ID;
      script.textContent = `(${injectables.toString()})("${TO_PAGE_PROOF_KEY}","${FROM_PAGE_PROOF_KEY}");`;
      (document.head || document.documentElement).appendChild(script);
      script.remove();
    }
    contextManager.enable();
  }, "destroy": void 0, "commands": {} } };
  (() => {
    window.addEventListener("message", (ev) => receiveMessage(ev.data));
    const receiveMessage = (messageStr) => consumeMessageStringAsCommand(messageStr, FROM_PAGE_PROOF_KEY, (command) => {
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
  var handleWatchAnswer = async (command) => {
    const { sub } = command;
    if (sub.key !== "answer-matches")
      return;
    const videos = sub.videos;
    const exactVideo = videos.find((video) => video.title === sub.query);
    if (exactVideo) {
      return navigateToWatch(exactVideo.videoId);
    }
    const filteredVideos = videos.filter((video) => !!video.title.trim());
    const results = (await Promise.all(filteredVideos.map((video) => PluginBase.util.fuzzyHighScore(sub.query, [video.title], 0, true)))).map(([_, score], index) => ({ score, index })).sort(({ score: scoreA }, { score: scoreB }) => scoreB - scoreA);
    const highScore = results[0];
    if (highScore.score > 0.8) {
      const fuzzyVideo = filteredVideos[highScore.index];
      if (fuzzyVideo) {
        return navigateToWatch(fuzzyVideo.videoId);
      }
    }
    return navigateToSearch(sub.query);
  };
  var handleChangeTextAnswer = async (command) => {
    const { sub } = command;
    if (sub.key !== "answer")
      return;
    const tracks = sub.texts;
    const [index] = await PluginBase.util.fuzzyHighScore(sub.query, tracks.map((track) => track.displayName), void 0, true);
    const track1 = tracks[index];
    if (!track1)
      return;
    sendMessage({ key: "changeText", sub: { key: "to", trackId: track1.trackId } });
  };
  var handleChangeAudioAnswer = async (command) => {
    const { sub } = command;
    if (sub.key !== "answer")
      return;
    const tracks = sub.audios;
    const [index] = await PluginBase.util.fuzzyHighScore(sub.query, tracks.map((track) => track.displayName), void 0, true);
    const track2 = tracks[index];
    if (!track2)
      return;
    sendMessage({ key: "changeAudio", sub: { key: "to", trackId: track2.trackId } });
  };
  var injectables = (toPageProofKey, fromPageProofKey) => {
    const parseJsonOrNull1 = (maybeJSONString) => {
      try {
        return JSON.parse(maybeJSONString);
      } catch (e) {
        return null;
      }
    };
    const consumeMessageStringAsCommand1 = (messageStr, proofKey, callback) => {
      const message = parseJsonOrNull1(messageStr);
      if (message && message.proofKey === proofKey) {
        callback(message.payload);
      }
    };
    const navigateToWatch1 = (videoId) => {
      window.location.href = `https://www.netflix.com/watch/${videoId}`;
    };
    const sendMessage1 = (payload) => window.postMessage(JSON.stringify({ proofKey: fromPageProofKey, payload }));
    const receiveMessage = (messageStr) => {
      consumeMessageStringAsCommand1(messageStr, toPageProofKey, (command) => {
        switch (command.key) {
          case "play":
            return withCurrentPlayer((player) => player.play());
          case "pause":
            return withCurrentPlayer((player) => player.pause());
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
    const handleChangeText = (command) => {
      const { sub } = command;
      switch (sub.key) {
        case "ask":
          return withCurrentPlayer((player) => sendMessage1({ key: "changeText", sub: { key: "answer", texts: player.getTextTrackList(), query: sub.query } }));
        case "to":
          return withCurrentPlayer((player) => {
            const track3 = player.getTextTrackList().find((track) => track.trackId === sub.trackId);
            if (!track3)
              return;
            player.setTextTrack(track3);
          });
      }
    };
    const handleChangeAudio = (command) => {
      const { sub } = command;
      switch (sub.key) {
        case "ask":
          return withCurrentPlayer((player) => sendMessage1({ key: "changeAudio", sub: { key: "answer", audios: player.getAudioTrackList(), query: sub.query } }));
        case "to":
          return withCurrentPlayer((player) => {
            const track4 = player.getAudioTrackList().find((track) => track.trackId === sub.trackId);
            if (!track4)
              return;
            player.setAudioTrack(track4);
          });
      }
    };
    const handleVolumeCommand = (command) => withCurrentPlayer((player) => {
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
    const handleSeekCommand = (command) => withCurrentPlayer((player) => {
      switch (command.sub.key) {
        case "to":
          return player.seek(command.sub.timestamp);
        case "ahead":
          return player.seek(player.getCurrentTime() + command.sub.duration);
        case "behind":
          return player.seek(player.getCurrentTime() - command.sub.duration);
      }
    });
    const handleWatch = (command) => {
      switch (command.sub.key) {
        case "ask-videos": {
          return sendMessage1({ key: "watch", sub: { key: "answer-matches", query: command.sub.query, videos: [...getInPageVideos(), ...getInCacheVideo()].map(({ videoId, title }) => ({ videoId, title })) } });
        }
      }
    };
    const getInCacheVideo = () => withCache((cache) => {
      const videos = cache.videos;
      if (!videos)
        return null;
      return Object.entries(videos).map(([videoId, video]) => ({ videoId, title: video.title && video.title.value || "", data: video })).filter((video) => video.title !== "");
    }) || [];
    const getInPageVideos = () => Array.from(document.querySelectorAll("a")).map((anchorElement) => {
      if (!anchorElement.href)
        return null;
      const url = new URL(anchorElement.href, window.location.origin);
      if (url.pathname.startsWith("/watch/")) {
        const ariaLabel = anchorElement.getAttribute("aria-label") || "";
        return { anchorElement, title: ariaLabel, videoId: url.pathname.slice("/watch/".length) };
      }
      return null;
    }).filter((result) => result !== null);
    const handleWatchRandom = () => {
      const videoIds = Array.from(/* @__PURE__ */ new Set([...getInCacheVideo().map(({ videoId }) => videoId), ...getInPageVideos().map(({ videoId }) => videoId)]));
      const videoId1 = videoIds[Math.round(Math.random() * (videoIds.length - 1))];
      if (!videoId1)
        return;
      navigateToWatch1(videoId1);
    };
    const withCurrentPlayer = (fn) => {
      const currentPlayer = getCurrentPlayer();
      if (currentPlayer)
        return fn(currentPlayer);
    };
    const getCurrentPlayer = () => {
      const videoPlayer = getVideoPlayerObject();
      if (!videoPlayer)
        return null;
      const session = getCurrentWatchSession();
      if (!session)
        return null;
      const playerElement = videoPlayer.getVideoPlayerBySessionId(session.sessionId);
      return playerElement || null;
    };
    const getCurrentWatchSession = () => withNetflix((netflix) => {
      const [session] = netflix.appContext.getPlayerApp().getAPI().getOpenPlaybackSessions();
      if (!session)
        return null;
      if (session.playbackInitiator !== "USER")
        return null;
      return session;
    });
    const getVideoPlayerObject = () => withNetflix((netflix) => netflix.appContext.state.playerApp.getAPI().videoPlayer);
    const withCache = (fn) => withNetflix((netflix) => fn(netflix.appContext.getState().pathEvaluator.getCache()));
    const withNetflix = (fn) => tryCatch(() => fn(window.netflix));
    const tryCatch = (fn) => {
      try {
        return fn();
      } catch (error) {
        console.error(error);
        return null;
      }
    };
    window.addEventListener("message", (ev) => receiveMessage(ev.data));
  };
  return Netflix_default;
})();
