# Recipes

## Cross-tab Communication

You can send a message to another tab/window using `chrome.runtime.sendMessage` and `init`.

```ts
export default <IPluginBase & IPlugin>{
    ...PluginBase, ...{
        niceName: 'Spotify',
        init: function () {
            // since we have a global command, init will be run on every page,
            // but we don't want this listener on non-spotify pages
            if (spotifyPlayerUrlRegexMatch.test(window.location.origin)) {
                chrome.runtime.onMessage.addListener((msg) => {
                    if (msg.type === 'lsSpotify') {
                        switch (msg.control) {
                            case SpotifyControlButtons.Play: {
                                clickButton(SpotifyControlButtons.Play);
                                break;
                            }
                        }
                    }
                });
            }
        },

        commands: [
            {
                name: 'spotify play',
                description: 'Play the Spotify web player.',
                global: true,
                match: 'spotify play',
                fn: function () {
                    const control = SpotifyControlButtons.Play; 
                    return new Promise(resolve => {
                        chrome.tabs.query({url: spotifyPlayerUrlMatch}, (tabs) => {
                            const tab = tabs.length ? tabs[0] : null;
                            if (tab) {
                                chrome.tabs.sendMessage(tab.id, {type: 'lsSpotify', control}, () => {
                                    resolve();
                                });
                            } else {
                                resolve();
                            }
                        });
                    });
                }
            },
        ]
    }
}
```

keywords: talking with another tab, inactive tab, message passing