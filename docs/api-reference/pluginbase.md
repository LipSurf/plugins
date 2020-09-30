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

- Type: `ICommand[]` 

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

### context 

- Optional
- Type: [`IContext`](/api-reference/pluginbase.md#icontext) 

For advanced use cases of [contexts](/contexts.md). <br><br>See [`IContext`](/api-reference/pluginbase.md#icontext).

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



## IPluginTranslation

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

- Type: `{ [key: string]: `[`ILocalizedCommand`](/api-reference/command.md#ilocalizedcommand)`}`              

 The keys of this object should map to the names of commands in the base (English) plugin. 


## PluginBase.util

The following API exists on `PluginBase.util` for interacting with the extension and convenience. It can be used within plugins - some utilities are only available in the context of the page (will only work in [`init`](#init), [`destroy`](#destroy), [`commands::pageFn`](/commands.md#pageFn)) others only in the context of the extension ([`fn`](/commands.md#fn)).


### enterContext

- Arguments: 
    - `contexts: string | string[]`
- Returns: `void`

Enter a context.

Also see: [Contexts](/contexts.md).

### isInView

- Arguments: 
    - `ele: HTMLElement`
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
- Returns: `IOptions` 

 Get all the user-set options (Used by the "Help" command for example to generate the list of possible commands).

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


## IContext

### extends                         

- Optional
- Type: `string`

 If a context extends another, all the commands in the context it extends can also be used.

### external                        

- Type: `string[]`
- Default: `[]`

 List of additional, external commands to allow in this context. Use format [plugin id].[command name]eg. (LipSurf.Open Help)

### raw                             

- Type: `boolean`
- Default: `false`

 If true, no trimming, lowercasing, hypen removal etc. is done on the transcripts that come down to be checked by match commands. Useful for eg. <span class="voice-cmd">Dictation Mode</span>.