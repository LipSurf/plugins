# PluginBase

## PluginBase

Extend `PluginBase` to create a LipSurf plugin.

### name 

- Type: `string` 

 Friendly-name of the plugin. Used in help and in the plugin list in options.

### match 

- Type: <code>RegExp &#124; RegExp[]</code> 

 The URL gets tested against these and commands, [`init`](/api-reference/pluginbase.md#init) only work on pages that match (unless the command is marked global).

### version 

- Type: `string` 

Version of the plugin. 

### commands 

- Type: `Command[]` 

 The meat of the plugin. 
 
 Also see: [Command](/api-reference/command.md).

### homophones

- Type: `{ [key: string]: string }` 
- Default: `{}`

 "Clothes" sounds like "close". If you have a "close" command, you should define a homophone. The key is the misheard part and the value is the command it should run/map-to. This can also include synonyms in some cases. <br> <br> Chaining works. You can do "1000" -> "one thousand" and "one thousand" -> "thousand" to match "1000" in that order.

The transcript has parts replaced by homophones 1-by-1 until a match is found. The live transcript will only reflect used homophones if a matching command was found - otherwise the live transcript shows the transcript before applying homophones. 

### description

- Optional
- Type: `string` 

Shown in the plugin list in options.

### init 

- Optional
- Type: `() => void` 

Called in the context of the page when LipSurf is activated and the plugin matches the current URL. Useful for setting up custom styling on the page that all the commands use, or initializing data that commands share. Also called each time the page is brought back into focus while LipSurf is activated.

### contexts

- Optional
- Type: [`Context`](/api-reference/pluginbase.md#context) 

For advanced use cases of [contexts](/contexts.md). 

### destroy 

- Optional
- Type: `() => void` 

Clean-up after things potentially created in [`init`](#init). Called when LipSurf is turned off.

### deactivatedHook

- Optional
- Type: `() => void` 

Called after destroy.


### apiVersion 

- Optional
- Type: `string` 

Not being used yet.


## Contexts

- Type: 
``` ts
{ 
    [contextName: string]: { 
        commands: [groupName: string, commands: string[]][] | string[],
        raw?: true 
    }
}
```


### commands
Can either be specified as a list of commands, or commands can be grouped (groups shown in the help) in a tuple where the first element is the group name, and the second element is the list of commands.

Use format `[plugin id].[command name]` (eg. `LipSurf.Open Help`) if the command is not in this plugin, otherwise simply the command name for the list of commands.


### raw                             

- Type: `boolean`
- Default: `false`

 If true, no trimming, lowercasing, hypen removal etc. is done on the transcripts that come down to be checked by match commands. Useful for eg. <span class="voice-cmd">Dictation Mode</span>.

 See also: 
   * [Contexts guide](/contexts.md)
   * [enterContext](/api-reference/pluginbase.md#entercontext)
   * [addContext](/api-reference/pluginbase.md#addcontext)
   * [removeContext](/api-reference/pluginbase.md#removecontext)
   * [getContext](/api-reference/pluginbase.md#getcontext)


## PluginTranslation

### niceName                        

- Type:  `string`             

 Translated friendly name of the plugin. 

### authors                         

- Optional
- Type: `string`               

Authors of the plugin translation. Multiple authors may be separated by commas.

### description                     

- Optional
- Type: `string`              

 Translated long description of the plugin. 

### homophones                      

- Optional
- Type: `{ [s: string]: string }`              

 Synonyms and/or homophones built-in by default for the translation. Left side should be what was recognized, and the right side should be what it maps to. There cannot be duplicates on the left side (keys). 

### commands                        

- Type: `{ [key: string]: `[`LocalizedCommand`](/api-reference/command.md#localizedcommand)`}`              

 The keys of this object should map to the names of commands in the base (English) plugin. 


## PluginBase.util

The following API exists on `PluginBase.util` for interacting with the extension and convenience. It can be used within plugins - some utilities are only available in the context of the page (will only work in [`init`](#init), [`destroy`](#destroy), [`commands::pageFn`](/commands.md#pageFn)) others only in the context of the extension ([`fn`](/commands.md#fn)).


### enterContext

- Arguments: 
    - `contexts: string[]`
- Returns: `void`

Modifies the context to be exactly what is specified in the argument.

Also see: [Contexts](/contexts.md).

### addContext

- Arguments: 
    - `contexts: string | string[]`
- Returns: `void`

Add a context to the existing active contexts for this page.

Also see: [Contexts](/contexts.md).

### removeContext

- Arguments: 
    - `contexts: string | string[]`
- Returns: `void`

Removes a context from the active contexts for this page.

Also see: [Contexts](/contexts.md).

### getContext

- Arguments: 
    - None
- Returns: `string[]`

Gets the contexts that we're in on the current page.

Also see: [Contexts](/contexts.md).


### isInView

- Arguments: 
    - `el: HTMLElement`
- Returns: `boolean`

Checks if an element is in the viewport.

### getNoCollisionUniqueAttr

- Arguments: 
    - None
- Returns: `string`

Use the string returned from here to keep everything under the LipSurf namespace and prevent page pollution/plugin collisions.

### getOptions 

- Arguments: 
    - None
- Returns: `Options` 

 Get all the user-set options. 
 
::: tip NOTE
 Used by the "help" command to get the list of commands and generate the help overlay.
:::

### getHUDEl

- Arguments: 
    - `obscureTags: boolean` 
- Returns: `Promise<[hudEl: HTMLElement, hadToReattach: boolean]>`

 Get the shadow DOM element used for most LipSurf HUD elements. The HUD will be automatically removed when LipSurf is deactivated so you don't need to clean it up yourself. 

### queryAllFrames

- Arguments: 
    - `tagName: string`
    - `attrs: string[]`
- Returns: `Promise<any[]>`

Query all frames includes IFrames.

### postToAllFrames

- Arguments: 
    - `id` 
    - `fnNames: string | string[]`
    - `selector?`
- Returns: `void`

Send a message to the frame beacon of all frames.
