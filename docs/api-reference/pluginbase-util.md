# PluginBase.util

The following API exists on `PluginBase.util` for interacting with the extension and convenience. It can be used within plugins - some utilities are only available in the context of the page (will only work in [`init`](#init), [`destroy`](#destroy), [`commands::pageFn`](/command.md#pagefn)) others only in the context of the extension ([`fn`](/command.md#fn)).


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
