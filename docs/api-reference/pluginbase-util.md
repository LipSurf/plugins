# PluginBase.util

The following API exists on `PluginBase.util` for interacting with the extension and convenience. It can be used within plugins - some utilities are only available in the context of the page (will only work in [`init`](#init), [`destroy`](#destroy), [`commands::pageFn`](/command.md#pagefn)) others only in the context of the extension ([`fn`](/command.md#fn)).

-------------------------------------------------------------

### shutdown

- Arguments:
    - None
- Returns: `void`


### pause

- Arguments:
    - None
- Returns: `void`

Pauses the speech recognizer, but leaves plugins and HUD un-destroyed. Shows a pause icon in the corner of the extension.


### start

- Arguments:
    - None
- Returns: `void`

-------------------------------------------------------------

### getLanguage

- Arguments:
    - None
- Returns: `LanguageCode`


### setLanguage

- Arguments:
    - `lang: LanguageCode`
- Returns: `void`

-------------------------------------------------------------

### enterContext

- Arguments: 
    - `contexts: string[]`
- Returns: `void`

Modifies the context to be exactly what is specified in the argument. The order here matters (commands with a context earlier in the list get priority).

Also see: [Contexts](/contexts.md).

### prependContext

- Arguments: 
    - `contexts: string | string[]`
- Returns: `void`

Add context(s) to the beginning of the list of existing active contexts for this page (giving its commands more priority than contexts that follow) .

See [`appendContext`](/contexts.md#appendContext) to give less priority to the commands.
Also see: [Contexts](/contexts.md).

### appendContext

- Arguments: 
    - `contexts: string | string[]`
- Returns: `void`

Add context(s) to the end of the list of existing active contexts for this page (giving its commands less priority than preceding contexts) .

See [`prependContext`](/contexts.md#prependContext) to give more priority to the commands.
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

-------------------------------------------------------------

### queryAllFrames

- Arguments: 
    - `query: string`
    - `attrs?: string | string[]`
    - `props?: string | string[]`
    - `specialProps?: SpecialProp[]`
- Returns: `Promise<string, ...any[]>`

Query all frames includes IFrames.


### postToAllFrames

- Arguments: 
    - `ids?: string | string[]` 
    - `fnNames?: string | string[]`
    - `selector?`
    - `specialFns?: SpecialFn | SpecialFn[]`
- Returns: `void`

-------------------------------------------------------------

### pick

- Arguments:
    - `obj: object`
    - `...props: string[]`
- Returns: `object`


### deepSetArray

- Arguments:
    - `obj: object`
    - `keys: string[]`
    - `value: any`
- Returns: `object`


### memoize

- Arguments:
    - `...any[]`
- Returns: `any`


-------------------------------------------------------------

### fuzzyHighScore

- Arguments:
    - `query: string`
    - `sources: string[]`
    - `minScore?: number`
    - `partial?: boolean`
    - `skipCanonicalizing?: boolean`
- Returns: `Promise<[idx: number, score: number]>`


### topFuzzyItemMatches&lt;T&gt;

- Arguments:
    - `query: string`
    - `itemWTextColl: {item: T, text: string[]}[]`
    - `minScore?: number`
- Returns: `Promise<T[]>`

`T` is `any`. It is the type of the returned items that have a score greater than minScore.

-------------------------------------------------------------

### highlight

- Arguments:
    - `...els: HTMLElement[]`
- Returns: `void`


### unhighlightAll

- Arguments:
    - None
- Returns: `void`

-------------------------------------------------------------

### disambiguate

- Arguments:
    - `els: HTMLElement[] | FrameElWOffsets[]`
- Returns: `Promise<[number, Promise<void>]>`


-------------------------------------------------------------

### clickOrFocus

- Arguments:
    - `el: HTMLElement`
- Returns: `void`

Intelligently "clicks" an element depending on the element type.


### isInViewAndTakesSpace

- Arguments: 
    - `el: HTMLElement`
- Returns: `boolean`

Checks if an element is in the viewport and takes up view space (not 0x0 pixels)


### getRGB

 - Arguments: 
    - `colorHexOrRgbStr: string`
 - Returns: `[red: number, green: number, blue: number]`

Used for getting color from computed css.

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

### scrollToAnimated

- Arguments:
    - `el: HTMLElement`
    - `offset?: number`
- Returns: `void`

Smooth animated scroll to an element.