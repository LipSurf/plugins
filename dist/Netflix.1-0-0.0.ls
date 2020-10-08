import PluginBase from 'chrome-extension://lnnmjmalakahagblkkcnjkoaihlfglon/dist/modules/plugin-base.js';import ExtensionUtil from 'chrome-extension://lnnmjmalakahagblkkcnjkoaihlfglon/dist/modules/extension-util.js';/// <reference types="lipsurf-types/extension"/>
// Messaging
const LIPSURF_BOOT_SCRIPT_ID = "lipsurf-netflix-script";
const TO_PAGE_PROOF_KEY = String(Math.floor(Math.random() * 1000));
const FROM_PAGE_PROOF_KEY = String(Math.floor(Math.random() * 1000));
const sendMessage = (payload) => window.postMessage(JSON.stringify({ proofKey: TO_PAGE_PROOF_KEY, payload }));
/**
 * Receive Message
 */
(() => {
    window.addEventListener("message", ev => receiveMessage(ev.data));
    const receiveMessage = (messageStr) => {
        try {
            const message = JSON.parse(messageStr);
            if (message.proofKey === FROM_PAGE_PROOF_KEY) {
                const command = message.payload;
                switch (command.key) {
                    case "changeText":
                        return handleChangeTextAnswer(command);
                    case "changeAudio":
                        return handleChangeAudioAnswer(command);
                }
            }
        }
        catch (_a) {
            // Silent catch
            // This try catch is used only to catch JSON.parse failure
            // Which is impossible to happen within Netflix Plugin scope
        }
    };
})();
// Utilities
const stripNonAlphaNumericAndTrim = (someString) => someString
    .split(" ")
    .map(someString => someString.replace(/[^\w\s]/gi, "").trim())
    .join(" ");
const navigateToSearch = (title) => {
    window.location.href = `https://www.netflix.com/search?q=${encodeURIComponent(title)}`;
};
// Context
/**
 * Context is currently disabled becacuse some weird behavior with non-normal
 * context
 */
var NetflixPluginContextEnum;
(function (NetflixPluginContextEnum) {
    NetflixPluginContextEnum["watch"] = "Netflix Video Player Controls";
    NetflixPluginContextEnum["browse"] = "Browse Netflix";
})(NetflixPluginContextEnum || (NetflixPluginContextEnum = {}));
const contextManager = (() => {
    let enabled = true;
    /**
     * Patch context to avoid context duplication
     */
    const patchContext = (fn) => {
        const contextSet = new Set(PluginBase.util.getContext());
        const contextPatcher = {
            add: (context) => {
                if (!contextSet.has(context)) {
                    PluginBase.util.addContext(context);
                }
            },
            remove: (context) => {
                if (contextSet.has(context)) {
                    PluginBase.util.removeContext(context);
                }
            }
        };
        return fn(contextPatcher);
    };
    const createContextFromUrl = (url) => {
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
    const setContext = (context) => {
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
    };
    const refreshCurrentContext = () => {
        try {
            setContext(createContextFromUrl(new URL(window.location.href)));
        }
        catch (error) {
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
var Netflix = {
    ...PluginBase,
    ...{
        niceName: "Netflix",
        languages: {},
        description: "A Netflix plugin to assist audience in operating the video player and navigating through netflix web application",
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
                pageFn: () => { }
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
                pageFn: (_, volumePercentage) => sendMessage({
                    key: "volume",
                    sub: { key: "setPercent", percentage: volumePercentage / 100 }
                }),
                normal: false
            },
            {
                name: "ChangeAudio",
                match: ["[change/switch] audio to *", "audio to *"],
                pageFn: (_, audioName) => !!audioName &&
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
                pageFn: (_, textName) => !!textName &&
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
                pageFn: (_, minute, second = 0) => sendMessage({
                    key: "skip",
                    sub: { key: "to", timestamp: (60 * minute + second) * 1000 }
                }),
                normal: false
            },
            {
                name: "Seek::To::Second",
                match: ["skip to second #"],
                pageFn: (_, second) => sendMessage({
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
                pageFn: (_, minute, second = 0) => sendMessage({
                    key: "skip",
                    sub: { key: "ahead", duration: (60 * minute + second) * 1000 }
                }),
                normal: false
            },
            {
                name: "Seek::Ahead::Second",
                match: ["skip ahead # [second/seconds]"],
                pageFn: (_, second) => sendMessage({
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
                pageFn: (_, minute, second = 0) => sendMessage({
                    key: "skip",
                    sub: { key: "behind", duration: (60 * minute + second) * 1000 }
                }),
                normal: false
            },
            {
                name: "Seek::Behind::Second",
                match: ["skip behind # [second/seconds]"],
                pageFn: (_, second) => sendMessage({
                    key: "skip",
                    sub: { key: "behind", duration: second * 1000 }
                }),
                normal: false
            },
            {
                name: "Watch::Title",
                match: ["watch *"],
                pageFn: (_, title) => sendMessage({ key: "watch", title: title.toLowerCase() }),
                normal: false
            },
            {
                name: "Watch::Random",
                match: ["random"],
                pageFn: (_) => sendMessage({ key: "watchRandom" }),
                normal: false
            },
            {
                name: "Search",
                match: ["search *"],
                pageFn: (_, title) => navigateToSearch(title),
                normal: false
            }
        ]
    }
};
const handleChangeTextAnswer = async (command) => {
    const { sub } = command;
    if (sub.key !== "answer")
        return;
    const tracks = sub.texts;
    const [index] = await PluginBase.util.fuzzyHighScore(sub.query, tracks.map(track => track.displayName).map(stripNonAlphaNumericAndTrim), undefined, true);
    const track = tracks[index];
    if (!track)
        return;
    sendMessage({
        key: "changeText",
        sub: {
            key: "to",
            trackId: track.trackId
        }
    });
};
const handleChangeAudioAnswer = async (command) => {
    const { sub } = command;
    if (sub.key !== "answer")
        return;
    const tracks = sub.audios;
    const [index] = await PluginBase.util.fuzzyHighScore(sub.query, tracks.map(track => track.displayName).map(stripNonAlphaNumericAndTrim), undefined, true);
    const track = tracks[index];
    if (!track)
        return;
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
const injectables = (toPageProofKey, fromPageProofKey) => {
    const sendMessage = (payload) => window.postMessage(JSON.stringify({ proofKey: fromPageProofKey, payload }));
    const receiveMessage = (messageStr) => {
        try {
            const message = JSON.parse(messageStr);
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
        }
        catch (_a) {
            // Silent catch
            // This try catch is used only to catch JSON.parse failure
            // Which is impossible to happen within Netflix Plugin scope
        }
    };
    const handleChangeText = (command) => {
        const { sub } = command;
        switch (sub.key) {
            case "ask":
                return withCurrentPlayer(player => sendMessage({
                    key: "changeText",
                    sub: {
                        key: "answer",
                        texts: player.getTextTrackList(),
                        query: sub.query
                    }
                }));
            case "to":
                return withCurrentPlayer(player => {
                    const track = player.getTextTrackList().find(track => track.trackId === sub.trackId);
                    if (!track)
                        return;
                    player.setTextTrack(track);
                });
        }
    };
    const handleChangeAudio = (command) => {
        const { sub } = command;
        switch (sub.key) {
            case "ask":
                return withCurrentPlayer(player => sendMessage({
                    key: "changeAudio",
                    sub: {
                        key: "answer",
                        audios: player.getAudioTrackList(),
                        query: sub.query
                    }
                }));
            case "to":
                return withCurrentPlayer(player => {
                    const track = player.getAudioTrackList().find(track => track.trackId === sub.trackId);
                    if (!track)
                        return;
                    player.setAudioTrack(track);
                });
        }
    };
    const handleVolumeCommand = (command) => withCurrentPlayer(player => {
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
    const handleSeekCommand = (command) => withCurrentPlayer(player => {
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
        const videos = [...getInPageVideos(), ...getInCacheVideo()];
        const anchors = videos.find(({ title }) => {
            return title.toLowerCase().trim() === command.title.trim();
        });
        if (!anchors)
            return;
        navigateToWatch(anchors.videoId);
    };
    const getInCacheVideo = () => withCache(cache => {
        const videos = cache.videos;
        if (!videos)
            return null;
        return Object.entries(videos)
            .map(([videoId, video]) => ({
            videoId,
            title: (video.title && video.title.value) || "",
            data: video
        }))
            .filter(video => video.title !== "");
    }) || [];
    const getInPageVideos = () => Array.from(document.querySelectorAll("a"))
        .map((anchorElement) => {
        if (!anchorElement.href)
            return null;
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
        .filter((result) => result !== null);
    const handleWatchRandom = () => {
        const videoIds = Array.from(new Set([
            ...getInCacheVideo().map(({ videoId }) => videoId),
            ...getInPageVideos().map(({ videoId }) => videoId)
        ]));
        const videoId = videoIds[Math.round(Math.random() * (videoIds.length - 1))];
        if (!videoId)
            return;
        navigateToWatch(videoId);
    };
    const navigateToWatch = (videoId) => {
        window.location.href = `https://www.netflix.com/watch/${videoId}`;
    };
    const withCurrentPlayer = (fn) => {
        const currentPlayer = getCurrentPlayer();
        if (currentPlayer)
            fn(currentPlayer);
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
    const getCurrentWatchSession = () => {
        try {
            const [session] = window.netflix.appContext
                .getPlayerApp()
                .getAPI()
                .getOpenPlaybackSessions();
            if (!session)
                return null;
            if (session.playbackInitiator !== "USER")
                return null;
            return session;
        }
        catch (error) {
            console.error(error);
            return null;
        }
    };
    const getVideoPlayerObject = () => {
        try {
            return (window.netflix.appContext.state.playerApp.getAPI()
                .videoPlayer || null);
        }
        catch (error) {
            console.error(error);
            return null;
        }
    };
    const getCache = () => withNetflix(netflix => netflix.appContext.getState().pathEvaluator.getCache());
    const withCache = (fn) => {
        try {
            const cache = getCache();
            if (!cache)
                return null;
            return fn(cache);
        }
        catch (error) {
            console.error(error);
        }
    };
    const withNetflix = (fn) => {
        try {
            const netflix = window.netflix;
            if (!netflix)
                return null;
            return fn(netflix);
        }
        catch (error) {
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
    (document.head || document.documentElement).appendChild(script);
    script.remove();
}

export default Netflix;
export { injectables };LS-SPLITallPlugins.Netflix = (() => { /// <reference types="lipsurf-types/extension"/>
// Messaging
const LIPSURF_BOOT_SCRIPT_ID = "lipsurf-netflix-script";
const TO_PAGE_PROOF_KEY = String(Math.floor(Math.random() * 1000));
const FROM_PAGE_PROOF_KEY = String(Math.floor(Math.random() * 1000));
const sendMessage = (payload) => window.postMessage(JSON.stringify({ proofKey: TO_PAGE_PROOF_KEY, payload }));
/**
 * Receive Message
 */
(() => {
    window.addEventListener("message", ev => receiveMessage(ev.data));
    const receiveMessage = (messageStr) => {
        try {
            const message = JSON.parse(messageStr);
            if (message.proofKey === FROM_PAGE_PROOF_KEY) {
                const command = message.payload;
                switch (command.key) {
                    case "changeText":
                        return handleChangeTextAnswer(command);
                    case "changeAudio":
                        return handleChangeAudioAnswer(command);
                }
            }
        }
        catch (_a) {
            // Silent catch
            // This try catch is used only to catch JSON.parse failure
            // Which is impossible to happen within Netflix Plugin scope
        }
    };
})();
// Utilities
const stripNonAlphaNumericAndTrim = (someString) => someString
    .split(" ")
    .map(someString => someString.replace(/[^\w\s]/gi, "").trim())
    .join(" ");
const navigateToSearch = (title) => {
    window.location.href = `https://www.netflix.com/search?q=${encodeURIComponent(title)}`;
};
// Context
/**
 * Context is currently disabled becacuse some weird behavior with non-normal
 * context
 */
var NetflixPluginContextEnum;
(function (NetflixPluginContextEnum) {
    NetflixPluginContextEnum["watch"] = "Netflix Video Player Controls";
    NetflixPluginContextEnum["browse"] = "Browse Netflix";
})(NetflixPluginContextEnum || (NetflixPluginContextEnum = {}));
const contextManager = (() => {
    let enabled = true;
    /**
     * Patch context to avoid context duplication
     */
    const patchContext = (fn) => {
        const contextSet = new Set(PluginBase.util.getContext());
        const contextPatcher = {
            add: (context) => {
                if (!contextSet.has(context)) {
                    PluginBase.util.addContext(context);
                }
            },
            remove: (context) => {
                if (contextSet.has(context)) {
                    PluginBase.util.removeContext(context);
                }
            }
        };
        return fn(contextPatcher);
    };
    const createContextFromUrl = (url) => {
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
    const setContext = (context) => {
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
    };
    const refreshCurrentContext = () => {
        try {
            setContext(createContextFromUrl(new URL(window.location.href)));
        }
        catch (error) {
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
var Netflix = {
    ...PluginBase,
    ...{
        init: () => contextManager.enable(),
        destroy: () => contextManager.disable(),

        commands: {
            "Override::Netflix": {
                /* Empty to override netflix */
                pageFn: () => { }
            },

            "Watch::Pause": {
                pageFn: () => sendMessage({ key: "pause" }),
                normal: false
            },

            "Watch::Play": {
                pageFn: () => sendMessage({ key: "play" }),
                normal: false
            },

            "Volume::Up": {
                pageFn: () => sendMessage({ key: "volume", sub: { key: "up" } }),
                normal: false
            },

            "Volume::Down": {
                pageFn: () => sendMessage({ key: "volume", sub: { key: "down" } }),
                normal: false
            },

            "Volume::Full": {
                pageFn: () => sendMessage({ key: "volume", sub: { key: "full" } }),
                normal: false
            },

            "Volume::Zero": {
                pageFn: () => sendMessage({ key: "volume", sub: { key: "zero" } }),
                normal: false
            },

            "Volume::Half": {
                pageFn: () => sendMessage({ key: "volume", sub: { key: "half" } }),
                normal: false
            },

            "Volume::SetPercent": {
                pageFn: (_, volumePercentage) => sendMessage({
                    key: "volume",
                    sub: { key: "setPercent", percentage: volumePercentage / 100 }
                }),

                normal: false
            },

            "ChangeAudio": {
                pageFn: (_, audioName) => !!audioName &&
                    sendMessage({
                        key: "changeAudio",
                        sub: {
                            key: "ask",
                            query: audioName
                        }
                    }),

                normal: false
            },

            "ChangeText": {
                pageFn: (_, textName) => !!textName &&
                    sendMessage({
                        key: "changeText",
                        sub: {
                            key: "ask",
                            query: textName
                        }
                    }),

                normal: false
            },

            "Seek::To::Minute+Second": {
                pageFn: (_, minute, second = 0) => sendMessage({
                    key: "skip",
                    sub: { key: "to", timestamp: (60 * minute + second) * 1000 }
                }),

                normal: false
            },

            "Seek::To::Second": {
                pageFn: (_, second) => sendMessage({
                    key: "skip",
                    sub: { key: "to", timestamp: second * 1000 }
                }),

                normal: false
            },

            "Seek::Ahead::Minute+Second": {
                pageFn: (_, minute, second = 0) => sendMessage({
                    key: "skip",
                    sub: { key: "ahead", duration: (60 * minute + second) * 1000 }
                }),

                normal: false
            },

            "Seek::Ahead::Second": {
                pageFn: (_, second) => sendMessage({
                    key: "skip",
                    sub: { key: "ahead", duration: second * 1000 }
                }),

                normal: false
            },

            "Seek::Behind::Minute+Second": {
                pageFn: (_, minute, second = 0) => sendMessage({
                    key: "skip",
                    sub: { key: "behind", duration: (60 * minute + second) * 1000 }
                }),

                normal: false
            },

            "Seek::Behind::Second": {
                pageFn: (_, second) => sendMessage({
                    key: "skip",
                    sub: { key: "behind", duration: second * 1000 }
                }),

                normal: false
            },

            "Watch::Title": {
                pageFn: (_, title) => sendMessage({ key: "watch", title: title.toLowerCase() }),
                normal: false
            },

            "Watch::Random": {
                pageFn: (_) => sendMessage({ key: "watchRandom" }),
                normal: false
            },

            "Search": {
                pageFn: (_, title) => navigateToSearch(title),
                normal: false
            }
        }
    }
};
const handleChangeTextAnswer = async (command) => {
    const { sub } = command;
    if (sub.key !== "answer")
        return;
    const tracks = sub.texts;
    const [index] = await PluginBase.util.fuzzyHighScore(sub.query, tracks.map(track => track.displayName).map(stripNonAlphaNumericAndTrim), undefined, true);
    const track = tracks[index];
    if (!track)
        return;
    sendMessage({
        key: "changeText",
        sub: {
            key: "to",
            trackId: track.trackId
        }
    });
};
const handleChangeAudioAnswer = async (command) => {
    const { sub } = command;
    if (sub.key !== "answer")
        return;
    const tracks = sub.audios;
    const [index] = await PluginBase.util.fuzzyHighScore(sub.query, tracks.map(track => track.displayName).map(stripNonAlphaNumericAndTrim), undefined, true);
    const track = tracks[index];
    if (!track)
        return;
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
const injectables = (toPageProofKey, fromPageProofKey) => {
    const sendMessage = (payload) => window.postMessage(JSON.stringify({ proofKey: fromPageProofKey, payload }));
    const receiveMessage = (messageStr) => {
        try {
            const message = JSON.parse(messageStr);
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
        }
        catch (_a) {
            // Silent catch
            // This try catch is used only to catch JSON.parse failure
            // Which is impossible to happen within Netflix Plugin scope
        }
    };
    const handleChangeText = (command) => {
        const { sub } = command;
        switch (sub.key) {
            case "ask":
                return withCurrentPlayer(player => sendMessage({
                    key: "changeText",
                    sub: {
                        key: "answer",
                        texts: player.getTextTrackList(),
                        query: sub.query
                    }
                }));
            case "to":
                return withCurrentPlayer(player => {
                    const track = player.getTextTrackList().find(track => track.trackId === sub.trackId);
                    if (!track)
                        return;
                    player.setTextTrack(track);
                });
        }
    };
    const handleChangeAudio = (command) => {
        const { sub } = command;
        switch (sub.key) {
            case "ask":
                return withCurrentPlayer(player => sendMessage({
                    key: "changeAudio",
                    sub: {
                        key: "answer",
                        audios: player.getAudioTrackList(),
                        query: sub.query
                    }
                }));
            case "to":
                return withCurrentPlayer(player => {
                    const track = player.getAudioTrackList().find(track => track.trackId === sub.trackId);
                    if (!track)
                        return;
                    player.setAudioTrack(track);
                });
        }
    };
    const handleVolumeCommand = (command) => withCurrentPlayer(player => {
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
    const handleSeekCommand = (command) => withCurrentPlayer(player => {
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
        const videos = [...getInPageVideos(), ...getInCacheVideo()];
        const anchors = videos.find(({ title }) => {
            return title.toLowerCase().trim() === command.title.trim();
        });
        if (!anchors)
            return;
        navigateToWatch(anchors.videoId);
    };
    const getInCacheVideo = () => withCache(cache => {
        const videos = cache.videos;
        if (!videos)
            return null;
        return Object.entries(videos)
            .map(([videoId, video]) => ({
            videoId,
            title: (video.title && video.title.value) || "",
            data: video
        }))
            .filter(video => video.title !== "");
    }) || [];
    const getInPageVideos = () => Array.from(document.querySelectorAll("a"))
        .map((anchorElement) => {
        if (!anchorElement.href)
            return null;
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
        .filter((result) => result !== null);
    const handleWatchRandom = () => {
        const videoIds = Array.from(new Set([
            ...getInCacheVideo().map(({ videoId }) => videoId),
            ...getInPageVideos().map(({ videoId }) => videoId)
        ]));
        const videoId = videoIds[Math.round(Math.random() * (videoIds.length - 1))];
        if (!videoId)
            return;
        navigateToWatch(videoId);
    };
    const navigateToWatch = (videoId) => {
        window.location.href = `https://www.netflix.com/watch/${videoId}`;
    };
    const withCurrentPlayer = (fn) => {
        const currentPlayer = getCurrentPlayer();
        if (currentPlayer)
            fn(currentPlayer);
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
    const getCurrentWatchSession = () => {
        try {
            const [session] = window.netflix.appContext
                .getPlayerApp()
                .getAPI()
                .getOpenPlaybackSessions();
            if (!session)
                return null;
            if (session.playbackInitiator !== "USER")
                return null;
            return session;
        }
        catch (error) {
            console.error(error);
            return null;
        }
    };
    const getVideoPlayerObject = () => {
        try {
            return (window.netflix.appContext.state.playerApp.getAPI()
                .videoPlayer || null);
        }
        catch (error) {
            console.error(error);
            return null;
        }
    };
    const getCache = () => withNetflix(netflix => netflix.appContext.getState().pathEvaluator.getCache());
    const withCache = (fn) => {
        try {
            const cache = getCache();
            if (!cache)
                return null;
            return fn(cache);
        }
        catch (error) {
            console.error(error);
        }
    };
    const withNetflix = (fn) => {
        try {
            const netflix = window.netflix;
            if (!netflix)
                return null;
            return fn(netflix);
        }
        catch (error) {
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
    (document.head || document.documentElement).appendChild(script);
    script.remove();
}

return Netflix;
 })()LS-SPLIT