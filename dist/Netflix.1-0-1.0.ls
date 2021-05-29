import PluginBase from 'chrome-extension://lnnmjmalakahagblkkcnjkoaihlfglon/dist/modules/plugin-base.js';import ExtensionUtil from 'chrome-extension://lnnmjmalakahagblkkcnjkoaihlfglon/dist/modules/extension-util.js';// dist/tmp/Netflix/Netflix.js
var LIPSURF_BOOT_SCRIPT_ID = "lipsurf-netflix-script", TO_PAGE_PROOF_KEY = PluginBase.util.getNoCollisionUniqueAttr(), FROM_PAGE_PROOF_KEY = PluginBase.util.getNoCollisionUniqueAttr(), sendMessage = (payload) => window.postMessage(JSON.stringify({proofKey: TO_PAGE_PROOF_KEY, payload})), parseJsonOrNull = (maybeJSONString) => {
  try {
    return JSON.parse(maybeJSONString);
  } catch (_a) {
    return null;
  }
}, consumeMessageStringAsCommand = (messageStr, proofKey, callback) => {
  let message = parseJsonOrNull(messageStr);
  message && message.proofKey === proofKey && callback(message.payload);
}, navigateToSearch = (title) => {
  window.location.href = `https://www.netflix.com/search?q=${encodeURIComponent(title)}`;
}, navigateToWatch = (videoId) => {
  window.location.href = `https://www.netflix.com/watch/${videoId}`;
}, NetflixPluginContextEnum = {
  watch: "Netflix Video Player Controls",
  browse: "Browse Netflix"
}, contextManager = (() => {
  let enabled = !0, createContextFromUrl = (url) => {
    let {pathname} = url;
    switch (!0) {
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
  }, setContext = (context) => {
    let currentContextSet = new Set(PluginBase.util.getContext());
    switch (currentContextSet.delete(PluginBase.constants.contexts.Normal), currentContextSet.delete(NetflixPluginContextEnum.watch), currentContextSet.delete(NetflixPluginContextEnum.browse), !0) {
      case context === NetflixPluginContextEnum.browse: {
        PluginBase.util.enterContext([
          NetflixPluginContextEnum.browse,
          PluginBase.constants.contexts.Normal,
          ...Array.from(currentContextSet)
        ]);
        return;
      }
      case context === NetflixPluginContextEnum.watch: {
        PluginBase.util.enterContext([
          NetflixPluginContextEnum.watch,
          ...Array.from(currentContextSet)
        ]);
        return;
      }
      default: {
        PluginBase.util.removeContext(NetflixPluginContextEnum.watch), PluginBase.util.removeContext(NetflixPluginContextEnum.browse), PluginBase.util.addContext(PluginBase.constants.contexts.Normal);
        return;
      }
    }
  }, refreshCurrentContext = () => {
    try {
      setContext(createContextFromUrl(new URL(window.location.href)));
    } catch (error) {
      console.error(error);
    }
  };
  return {
    enable: async () => {
      for (enabled = !0; enabled; )
        refreshCurrentContext(), await new Promise((resolve) => setTimeout(resolve, 1e3));
    },
    disable: () => {
      enabled = !1, PluginBase.util.enterContext([PluginBase.constants.contexts.Normal]);
    }
  };
})(), Netflix_default = {
  ...PluginBase,
  languages: {},
  niceName: "Netflix",
  description: "A Netflix plugin to assist audience in operating the video player and navigating through netflix web application",
  match: /.*\.netflix.com/,
  version: "1.0.1",
  authors: "Alan, Miko",
  init: () => {
    if (!document.getElementById(LIPSURF_BOOT_SCRIPT_ID)) {
      let script = document.createElement("script");
      script.id = LIPSURF_BOOT_SCRIPT_ID, script.textContent = `(${injectables.toString()})("${TO_PAGE_PROOF_KEY}","${FROM_PAGE_PROOF_KEY}");`, (document.head || document.documentElement).appendChild(script), script.remove();
    }
    contextManager.enable();
  },
  destroy: () => contextManager.disable(),
  homophones: {
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
      pageFn: () => {
      }
    },
    {
      name: "Pause Video",
      match: ["pause", "stop"],
      pageFn: () => sendMessage({key: "pause"}),
      normal: !1
    },
    {
      name: "Play Video",
      match: "play",
      pageFn: () => sendMessage({key: "play"}),
      normal: !1
    },
    {
      name: "Volume Up",
      match: "[volume/sound level] up",
      pageFn: () => sendMessage({key: "volume", sub: {key: "up"}}),
      normal: !1
    },
    {
      name: "Volume Down",
      match: "[volume/sound level] down",
      pageFn: () => sendMessage({key: "volume", sub: {key: "down"}}),
      normal: !1
    },
    {
      name: "Volume Full",
      match: "[volume/sound level] full",
      pageFn: () => sendMessage({key: "volume", sub: {key: "full"}}),
      normal: !1
    },
    {
      name: "Volume Zero",
      match: "[volume/sound level] zero",
      pageFn: () => sendMessage({key: "volume", sub: {key: "zero"}}),
      normal: !1
    },
    {
      name: "Volume Half",
      match: "[volume/sound level] half",
      pageFn: () => sendMessage({key: "volume", sub: {key: "half"}}),
      normal: !1
    },
    {
      name: "Volume Set In Percentage",
      match: "set [volume/sound level] to # percent",
      pageFn: (_, volumePercentage) => sendMessage({
        key: "volume",
        sub: {key: "setPercent", percentage: volumePercentage / 100}
      }),
      normal: !1
    },
    {
      name: "Change Audio",
      match: ["[/change/switch] audio to *"],
      pageFn: (_, audioName) => !!audioName && sendMessage({
        key: "changeAudio",
        sub: {
          key: "ask",
          query: audioName
        }
      }),
      normal: !1
    },
    {
      name: "Change Subtitle",
      match: ["[/change/switch] [text/subtitle] to *"],
      pageFn: (_, textName) => !!textName && sendMessage({
        key: "changeText",
        sub: {
          key: "ask",
          query: textName
        }
      }),
      normal: !1
    },
    {
      name: "Seek To By Minute and Second",
      match: ["skip to minute #", "skip to minute # second #"],
      pageFn: (_, minute, second = 0) => sendMessage({
        key: "skip",
        sub: {key: "to", timestamp: (60 * minute + second) * 1e3}
      }),
      normal: !1
    },
    {
      name: "Seek To By Second",
      match: ["skip to second #"],
      pageFn: (_, second) => sendMessage({
        key: "skip",
        sub: {key: "to", timestamp: second * 1e3}
      }),
      normal: !1
    },
    {
      name: "Seek Ahead By Second",
      match: [
        "skip ahead # [minute/minutes]",
        "skip ahead # [minute/minutes] # [second/seconds]"
      ],
      pageFn: (_, minute, second = 0) => sendMessage({
        key: "skip",
        sub: {key: "ahead", duration: (60 * minute + second) * 1e3}
      }),
      normal: !1
    },
    {
      name: "Seek Ahead By Second",
      match: ["skip ahead # [second/seconds]"],
      pageFn: (_, second) => sendMessage({
        key: "skip",
        sub: {key: "ahead", duration: second * 1e3}
      }),
      normal: !1
    },
    {
      name: "Seek Behind By Second",
      match: [
        "skip behind # [minute/minutes]",
        "skip behind # [minute/minutes] # [second/seconds]"
      ],
      pageFn: (_, minute, second = 0) => sendMessage({
        key: "skip",
        sub: {key: "behind", duration: (60 * minute + second) * 1e3}
      }),
      normal: !1
    },
    {
      name: "Seek Behind By Second",
      match: ["skip behind # [second/seconds]"],
      pageFn: (_, second) => sendMessage({
        key: "skip",
        sub: {key: "behind", duration: second * 1e3}
      }),
      normal: !1
    },
    {
      name: "Watch By Title",
      match: ["[watch/play] *"],
      pageFn: (_, query) => sendMessage({
        key: "watch",
        sub: {
          key: "ask-videos",
          query
        }
      }),
      normal: !1
    },
    {
      name: "Watch Random Show",
      match: ["random"],
      pageFn: (_) => sendMessage({key: "watchRandom"}),
      normal: !1
    },
    {
      name: "Search Show",
      match: ["search *"],
      pageFn: (_, title) => navigateToSearch(title),
      normal: !1
    }
  ]
};
(() => {
  window.addEventListener("message", (ev) => receiveMessage(ev.data));
  let receiveMessage = (messageStr) => consumeMessageStringAsCommand(messageStr, FROM_PAGE_PROOF_KEY, (command) => {
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
  let {sub} = command;
  if (sub.key !== "answer-matches")
    return;
  let videos = sub.videos, exactVideo = videos.find((video) => video.title === sub.query);
  if (exactVideo)
    return navigateToWatch(exactVideo.videoId);
  let filteredVideos = videos.filter((video) => !!video.title.trim()), highScore = (await Promise.all(filteredVideos.map((video) => PluginBase.util.fuzzyHighScore(sub.query, [video.title], 0, !0)))).map(([_, score], index) => ({
    score,
    index
  })).sort(({score: scoreA}, {score: scoreB}) => scoreB - scoreA)[0];
  if (highScore.score > 0.8) {
    let fuzzyVideo = filteredVideos[highScore.index];
    if (fuzzyVideo)
      return navigateToWatch(fuzzyVideo.videoId);
  }
  return navigateToSearch(sub.query);
}, handleChangeTextAnswer = async (command) => {
  let {sub} = command;
  if (sub.key !== "answer")
    return;
  let tracks = sub.texts, [index] = await PluginBase.util.fuzzyHighScore(sub.query, tracks.map((track2) => track2.displayName), void 0, !0), track = tracks[index];
  !track || sendMessage({
    key: "changeText",
    sub: {
      key: "to",
      trackId: track.trackId
    }
  });
}, handleChangeAudioAnswer = async (command) => {
  let {sub} = command;
  if (sub.key !== "answer")
    return;
  let tracks = sub.audios, [index] = await PluginBase.util.fuzzyHighScore(sub.query, tracks.map((track2) => track2.displayName), void 0, !0), track = tracks[index];
  !track || sendMessage({
    key: "changeAudio",
    sub: {
      key: "to",
      trackId: track.trackId
    }
  });
}, injectables = (toPageProofKey, fromPageProofKey) => {
  let parseJsonOrNull2 = (maybeJSONString) => {
    try {
      return JSON.parse(maybeJSONString);
    } catch (_a) {
      return null;
    }
  }, consumeMessageStringAsCommand2 = (messageStr, proofKey, callback) => {
    let message = parseJsonOrNull2(messageStr);
    message && message.proofKey === proofKey && callback(message.payload);
  }, navigateToWatch2 = (videoId) => {
    window.location.href = `https://www.netflix.com/watch/${videoId}`;
  }, sendMessage2 = (payload) => window.postMessage(JSON.stringify({
    proofKey: fromPageProofKey,
    payload
  })), receiveMessage = (messageStr) => {
    consumeMessageStringAsCommand2(messageStr, toPageProofKey, (command) => {
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
  }, handleChangeText = (command) => {
    let {sub} = command;
    switch (sub.key) {
      case "ask":
        return withCurrentPlayer((player) => sendMessage2({
          key: "changeText",
          sub: {
            key: "answer",
            texts: player.getTextTrackList(),
            query: sub.query
          }
        }));
      case "to":
        return withCurrentPlayer((player) => {
          let track = player.getTextTrackList().find((track2) => track2.trackId === sub.trackId);
          !track || player.setTextTrack(track);
        });
    }
  }, handleChangeAudio = (command) => {
    let {sub} = command;
    switch (sub.key) {
      case "ask":
        return withCurrentPlayer((player) => sendMessage2({
          key: "changeAudio",
          sub: {
            key: "answer",
            audios: player.getAudioTrackList(),
            query: sub.query
          }
        }));
      case "to":
        return withCurrentPlayer((player) => {
          let track = player.getAudioTrackList().find((track2) => track2.trackId === sub.trackId);
          !track || player.setAudioTrack(track);
        });
    }
  }, handleVolumeCommand = (command) => withCurrentPlayer((player) => {
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
      case "setPercent":
        return player.setVolume(command.sub.percentage);
    }
  }), handleSeekCommand = (command) => withCurrentPlayer((player) => {
    switch (command.sub.key) {
      case "to":
        return player.seek(command.sub.timestamp);
      case "ahead":
        return player.seek(player.getCurrentTime() + command.sub.duration);
      case "behind":
        return player.seek(player.getCurrentTime() - command.sub.duration);
    }
  }), handleWatch = (command) => {
    switch (command.sub.key) {
      case "ask-videos":
        return sendMessage2({
          key: "watch",
          sub: {
            key: "answer-matches",
            query: command.sub.query,
            videos: [...getInPageVideos(), ...getInCacheVideo()].map(({videoId, title}) => ({
              videoId,
              title
            }))
          }
        });
    }
  }, getInCacheVideo = () => withCache((cache) => {
    let videos = cache.videos;
    return videos ? Object.entries(videos).map(([videoId, video]) => ({
      videoId,
      title: video.title && video.title.value || "",
      data: video
    })).filter((video) => video.title !== "") : null;
  }) || [], getInPageVideos = () => Array.from(document.querySelectorAll("a")).map((anchorElement) => {
    if (!anchorElement.href)
      return null;
    let url = new URL(anchorElement.href, window.location.origin);
    if (url.pathname.startsWith("/watch/")) {
      let ariaLabel = anchorElement.getAttribute("aria-label") || "";
      return {
        anchorElement,
        title: ariaLabel,
        videoId: url.pathname.slice("/watch/".length)
      };
    }
    return null;
  }).filter((result) => result !== null), handleWatchRandom = () => {
    let videoIds = Array.from(new Set([
      ...getInCacheVideo().map(({videoId: videoId2}) => videoId2),
      ...getInPageVideos().map(({videoId: videoId2}) => videoId2)
    ])), videoId = videoIds[Math.round(Math.random() * (videoIds.length - 1))];
    !videoId || navigateToWatch2(videoId);
  }, withCurrentPlayer = (fn) => {
    let currentPlayer = getCurrentPlayer();
    if (currentPlayer)
      return fn(currentPlayer);
  }, getCurrentPlayer = () => {
    let videoPlayer = getVideoPlayerObject();
    if (!videoPlayer)
      return null;
    let session = getCurrentWatchSession();
    return session && videoPlayer.getVideoPlayerBySessionId(session.sessionId) || null;
  }, getCurrentWatchSession = () => withNetflix((netflix) => {
    let [session] = netflix.appContext.getPlayerApp().getAPI().getOpenPlaybackSessions();
    return !session || session.playbackInitiator !== "USER" ? null : session;
  }), getVideoPlayerObject = () => withNetflix((netflix) => netflix.appContext.state.playerApp.getAPI().videoPlayer), withCache = (fn) => withNetflix((netflix) => fn(netflix.appContext.getState().pathEvaluator.getCache())), withNetflix = (fn) => tryCatch(() => fn(window.netflix)), tryCatch = (fn) => {
    try {
      return fn();
    } catch (error) {
      return console.error(error), null;
    }
  };
  window.addEventListener("message", (ev) => receiveMessage(ev.data));
}, dumby_default = Netflix_default;
export {
  dumby_default as default
};
LS-SPLIT// dist/tmp/Netflix/Netflix.js
allPlugins.Netflix = (() => {
  var LIPSURF_BOOT_SCRIPT_ID = "lipsurf-netflix-script", TO_PAGE_PROOF_KEY = PluginBase.util.getNoCollisionUniqueAttr(), FROM_PAGE_PROOF_KEY = PluginBase.util.getNoCollisionUniqueAttr(), sendMessage = (payload) => window.postMessage(JSON.stringify({proofKey: TO_PAGE_PROOF_KEY, payload})), parseJsonOrNull = (maybeJSONString) => {
    try {
      return JSON.parse(maybeJSONString);
    } catch (_a) {
      return null;
    }
  }, consumeMessageStringAsCommand = (messageStr, proofKey, callback) => {
    let message = parseJsonOrNull(messageStr);
    message && message.proofKey === proofKey && callback(message.payload);
  }, navigateToSearch = (title) => {
    window.location.href = `https://www.netflix.com/search?q=${encodeURIComponent(title)}`;
  }, navigateToWatch = (videoId) => {
    window.location.href = `https://www.netflix.com/watch/${videoId}`;
  }, NetflixPluginContextEnum = {
    watch: "Netflix Video Player Controls",
    browse: "Browse Netflix"
  }, contextManager = (() => {
    let enabled = !0, createContextFromUrl = (url) => {
      let {pathname} = url;
      switch (!0) {
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
    }, setContext = (context) => {
      let currentContextSet = new Set(PluginBase.util.getContext());
      switch (currentContextSet.delete(PluginBase.constants.contexts.Normal), currentContextSet.delete(NetflixPluginContextEnum.watch), currentContextSet.delete(NetflixPluginContextEnum.browse), !0) {
        case context === NetflixPluginContextEnum.browse: {
          PluginBase.util.enterContext([
            NetflixPluginContextEnum.browse,
            PluginBase.constants.contexts.Normal,
            ...Array.from(currentContextSet)
          ]);
          return;
        }
        case context === NetflixPluginContextEnum.watch: {
          PluginBase.util.enterContext([
            NetflixPluginContextEnum.watch,
            ...Array.from(currentContextSet)
          ]);
          return;
        }
        default: {
          PluginBase.util.removeContext(NetflixPluginContextEnum.watch), PluginBase.util.removeContext(NetflixPluginContextEnum.browse), PluginBase.util.addContext(PluginBase.constants.contexts.Normal);
          return;
        }
      }
    }, refreshCurrentContext = () => {
      try {
        setContext(createContextFromUrl(new URL(window.location.href)));
      } catch (error) {
        console.error(error);
      }
    };
    return {
      enable: async () => {
        for (enabled = !0; enabled; )
          refreshCurrentContext(), await new Promise((resolve) => setTimeout(resolve, 1e3));
      },
      disable: () => {
        enabled = !1, PluginBase.util.enterContext([PluginBase.constants.contexts.Normal]);
      }
    };
  })();
  return {...PluginBase, init: () => {
    if (!document.getElementById(LIPSURF_BOOT_SCRIPT_ID)) {
      let script = document.createElement("script");
      script.id = LIPSURF_BOOT_SCRIPT_ID, script.textContent = `(${injectables.toString()})("${TO_PAGE_PROOF_KEY}","${FROM_PAGE_PROOF_KEY}");`, (document.head || document.documentElement).appendChild(script), script.remove();
    }
    contextManager.enable();
  }, destroy: () => contextManager.disable(), commands: {"Override::Netflix": {pageFn: () => {
  }}, "Pause Video": {pageFn: () => sendMessage({key: "pause"})}, "Play Video": {pageFn: () => sendMessage({key: "play"})}, "Volume Up": {pageFn: () => sendMessage({key: "volume", sub: {key: "up"}})}, "Volume Down": {pageFn: () => sendMessage({key: "volume", sub: {key: "down"}})}, "Volume Full": {pageFn: () => sendMessage({key: "volume", sub: {key: "full"}})}, "Volume Zero": {pageFn: () => sendMessage({key: "volume", sub: {key: "zero"}})}, "Volume Half": {pageFn: () => sendMessage({key: "volume", sub: {key: "half"}})}, "Volume Set In Percentage": {pageFn: (_, volumePercentage) => sendMessage({
    key: "volume",
    sub: {key: "setPercent", percentage: volumePercentage / 100}
  })}, "Change Audio": {pageFn: (_, audioName) => !!audioName && sendMessage({
    key: "changeAudio",
    sub: {
      key: "ask",
      query: audioName
    }
  })}, "Change Subtitle": {pageFn: (_, textName) => !!textName && sendMessage({
    key: "changeText",
    sub: {
      key: "ask",
      query: textName
    }
  })}, "Seek To By Minute and Second": {pageFn: (_, minute, second = 0) => sendMessage({
    key: "skip",
    sub: {key: "to", timestamp: (60 * minute + second) * 1e3}
  })}, "Seek To By Second": {pageFn: (_, second) => sendMessage({
    key: "skip",
    sub: {key: "to", timestamp: second * 1e3}
  })}, "Seek Ahead By Second": {pageFn: (_, second) => sendMessage({
    key: "skip",
    sub: {key: "ahead", duration: second * 1e3}
  })}, "Seek Behind By Second": {pageFn: (_, second) => sendMessage({
    key: "skip",
    sub: {key: "behind", duration: second * 1e3}
  })}, "Watch By Title": {pageFn: (_, query) => sendMessage({
    key: "watch",
    sub: {
      key: "ask-videos",
      query
    }
  })}, "Watch Random Show": {pageFn: (_) => sendMessage({key: "watchRandom"})}, "Search Show": {pageFn: (_, title) => navigateToSearch(title)}}};
  var handleWatchAnswer, handleChangeTextAnswer, handleChangeAudioAnswer, injectables;
})();
LS-SPLIT// dist/tmp/Netflix/Netflix.js
allPlugins.Netflix = (() => {
  var LIPSURF_BOOT_SCRIPT_ID = "lipsurf-netflix-script", TO_PAGE_PROOF_KEY = PluginBase.util.getNoCollisionUniqueAttr(), FROM_PAGE_PROOF_KEY = PluginBase.util.getNoCollisionUniqueAttr(), sendMessage = (payload) => window.postMessage(JSON.stringify({proofKey: TO_PAGE_PROOF_KEY, payload})), parseJsonOrNull = (maybeJSONString) => {
    try {
      return JSON.parse(maybeJSONString);
    } catch (_a) {
      return null;
    }
  }, consumeMessageStringAsCommand = (messageStr, proofKey, callback) => {
    let message = parseJsonOrNull(messageStr);
    message && message.proofKey === proofKey && callback(message.payload);
  }, navigateToSearch = (title) => {
    window.location.href = `https://www.netflix.com/search?q=${encodeURIComponent(title)}`;
  }, navigateToWatch = (videoId) => {
    window.location.href = `https://www.netflix.com/watch/${videoId}`;
  }, NetflixPluginContextEnum = {
    watch: "Netflix Video Player Controls",
    browse: "Browse Netflix"
  }, contextManager = (() => {
    let enabled = !0, createContextFromUrl = (url) => {
      let {pathname} = url;
      switch (!0) {
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
    }, setContext = (context) => {
      let currentContextSet = new Set(PluginBase.util.getContext());
      switch (currentContextSet.delete(PluginBase.constants.contexts.Normal), currentContextSet.delete(NetflixPluginContextEnum.watch), currentContextSet.delete(NetflixPluginContextEnum.browse), !0) {
        case context === NetflixPluginContextEnum.browse: {
          PluginBase.util.enterContext([
            NetflixPluginContextEnum.browse,
            PluginBase.constants.contexts.Normal,
            ...Array.from(currentContextSet)
          ]);
          return;
        }
        case context === NetflixPluginContextEnum.watch: {
          PluginBase.util.enterContext([
            NetflixPluginContextEnum.watch,
            ...Array.from(currentContextSet)
          ]);
          return;
        }
        default: {
          PluginBase.util.removeContext(NetflixPluginContextEnum.watch), PluginBase.util.removeContext(NetflixPluginContextEnum.browse), PluginBase.util.addContext(PluginBase.constants.contexts.Normal);
          return;
        }
      }
    }, refreshCurrentContext = () => {
      try {
        setContext(createContextFromUrl(new URL(window.location.href)));
      } catch (error) {
        console.error(error);
      }
    };
    return {
      enable: async () => {
        for (enabled = !0; enabled; )
          refreshCurrentContext(), await new Promise((resolve) => setTimeout(resolve, 1e3));
      },
      disable: () => {
        enabled = !1, PluginBase.util.enterContext([PluginBase.constants.contexts.Normal]);
      }
    };
  })();
  return {...PluginBase, init: () => {
    if (!document.getElementById(LIPSURF_BOOT_SCRIPT_ID)) {
      let script = document.createElement("script");
      script.id = LIPSURF_BOOT_SCRIPT_ID, script.textContent = `(${injectables.toString()})("${TO_PAGE_PROOF_KEY}","${FROM_PAGE_PROOF_KEY}");`, (document.head || document.documentElement).appendChild(script), script.remove();
    }
    contextManager.enable();
  }, destroy: () => contextManager.disable(), commands: {}};
  var handleWatchAnswer, handleChangeTextAnswer, handleChangeAudioAnswer, injectables;
})();
