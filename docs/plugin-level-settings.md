# Plugin-level Settings

You can have settings on the plugin-level. This allows plugins to persist their own data, share data with other plugins 
or for the user to configure plugins (using the LipSurf options under the plugin's settings).

Example use cases:
 * Search plugin that lets you choose a search engine.
 * Tabs and windows plugin that lets you choose the default URL for new tabs.

A top-level plugin property determines settings:

``` TypeScript
    // page to load on new tab and new window
    ...
    settings: [
        {
            name: 'New Tab/Window URL',
            // determines the widget to use in the LipSurf options
            type: 'url',
            default: 'https://www.google.com',
        }
    ],
    ...
```

Settings can be set or gotten within the plugin like so:

``` TypeScript
await PluginBase.setPluginOption('TabsAndWindows', 'New Tab/Window URL', 'www.duckduckgo.com');
PluginBase.getPluginOption('TabsAndWindows', 'New Tab/Window URL');
```

See [`setPluginOption`](api-reference/plugin.md#setpluginoption) and [`getPluginOption`](api-reference/plugin.md#getpluginoption) for details.


