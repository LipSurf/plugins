# Plugin-level Settings

You can have settings on the plugin-level. This lets the user configure some things without needing to write a whole new plugin.

Example use cases:
 * Search plugin that lets you choose a search engine.
 * Tabs and Windows plugin that lets you choose the default URL to open in new tabs.

A top-level plugin property determines settings:

``` TypeScript
    // page to load on new tab and new window
    ...
    settings: [
        {
            name: 'New Tab/Window URL',
            type: 'url',
            default: 'https://www.google.com',
        }
    ],
    ...
```

Settings can be accessed within the plugin like so:
``` TypeScript
PluginBase.getPluginOption('TabsAndWindows', 'New Tab/Window URL');
```


