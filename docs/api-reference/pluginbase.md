# PluginBase

## PluginBase

Extend `PluginBase` to create a LipSurf plugin.

Member | Type | Description
------|------|------------
name | `string` | Friendly-name of the plugin. Used in help and in the plugin list in options.
match | <code>RegExp &#124; RegExp[]</code> | The URL gets matched against this. The plugin commands only run on pages that match (unless the command is marked global).
commands | `ICommand[]` | The meat of the plugin. Described in [Command](/api-reference/command.md).
homophones | `{ [s: string]: string }` | _(optional)_ "clothes" sounds like "close". If you have a "close" command, you should define a homophone. The key is the misheard part and the value is the command it should run/map-to. This can also include synonyms in some cases. <br> <br> Chaining works. You can do "1000" -> "one thousand" and "one thousand" -> "thousand" to match "1000" in that order.
description| `string` | _(optional)_ Shown in the plugin list in options.
init | `() => void` | _(optional)_ Called in the context of the page when LipSurf is activated and the plugin matches the current URL. Useful for setting up custom styling on the page that all the commands use, or initializing data that commands share. Also called each time the page is brought back into focus while LipSurf is activated.
destroy | `() => void` | _(optional)_ Clean-up after things potentially created in `init`. Called when LipSurf is turned off.
version | `string` | _(optional)_ Not being used yet.
apiVersion | `string` | _(optional)_ Not being used yet.

## PluginBase.util
The following API exists on `PluginBase.util` for interacting with the extension and convenience. It can be used in `init()`, `destroy()`, `test()` or `runOnPage()` functions of the commands (eg. `PluginBase.util.getOptions()`)


|           Member               |       Type           | Description  |
|-----------------------------|---------------------------|--------------|
|getOptions | `() => IOptions` | Get all the user-set options (Used by the "Help" command for example to generate the list of possible commands).|
|addOverlay              |`(contents, id?: string, domLoc?:HTMLElement=document.body, hold?: boolean=false) => HTMLDivElement` | Add a div with a shadow DOM and return it. The overlay will be automatically removed when LipSurf is deactivated so you don't need to clean it up yourself. |
|queryAllFrames|`(tagName: string, attrs: string[]) => Promise<any[]>`|Query all frames includes IFrames.|
|postToAllFrames|<code>(id, fnNames: string \&#124; string[], selector?) => void</code>|Send a message to the frame beacon of all frames.|
|isInView|`(ele: HTMLElement) => boolean`|Checks if an element is in the viewport.|
|getNoCollisionUniqueAttr|`() => string`|Use the string returned from here to keep everything under the LipSurf namespace and prevent page pollution/plugin collisions.|

## IPluginTranslation

|           Member               |       Type           | Description  |
|--------------------------------|----------------------|--------------|
|niceName                        | `string`             | Translated friendly name of the plugin. |
|authors                         |`string`               | _(optional)_ Authors of the plugin translation. |
|description                     | `string`              | _(optional)_ Translated long description of the plugin. |
|homophones                      | `{ [s: string]: string }`              | _(optional)_ Synonyms and/or homophones built-in by default for the translation. Left side should be what was recognized, and the right side should be what it maps to. There cannot be duplicates on the left side (keys). |
|commands                        | `{ [key: string]: `[`ILocalizedCommand`](/api-reference/command.md#ilocalizedcommand)`}`              | The keys of this object should map to the names of commands in the base (English) plugin. |

