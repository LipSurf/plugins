# Commands
## ICommand
Each plugin can have multiple commands.

Also see [`ILocalizedCommand`](/api-reference/command.md#ilocalizedcommand).

Each command has the following properties:

|Member |    Type    | Description|
|-------|------------|-------------|
|name | `string`   | Friendly-name of the command (not necessarily the words used to call it). Should be title-cased.|
|match| `string | string[] | `[`IDynamicMatch`](/api-reference/command.md#idynamicmatch) | The word(s) the user can say to execute this command. <br><br>Make sure it's completely lowercase and without any punctuation. Use "#" in the string as an ordinal place holder. Use "*" as a wildcard placeholder. Lastly, a function [`IDynamicMatch`](/api-reference/command.md#idynamicmatch) can be used for the most advanced cases.
|description | `string` | _(optional)_ Detailed description visible in the options page.|
|global | `boolean` |  _(default: false)_ let the command match on any page (not restricted by the `match` of the Plugin)|
pageFn | `(transcript: string, ...matchOutput: any) => Promise<void>` | _(optional)_ An async function to run on the page when the command is called. Special matches (`*` and `#`) will be arguments after the transcript string argument, and will come in the order they are specified in the match property. There will be a number argument if the match string accepts an ordinal (eg. has a `#`) in it, or a string argument if the match string accepts a wildcard (eg. has a `*` in it).<br><br>Optionally resolve the promise when this function is finished to help chaining work. Eg. we can use `return await PluginBase.util.sleep(500);` if we know a command will take no longer than 500ms to finish, and to only execute the next command in the chain after that 500ms delay.<br><br> Also see [fn vs. pageFn](/api-reference/command.md#fn-vs-pagefn).
|nice | [`INiceCommand`](/api-reference/command.md#inicecommand) |  _(optional)_ See [`INiceCommand`](/api-reference/command.md#inicecommand).|
|fn | `(transcript: string, ...matchOutput: any) => Promise<void>` | _(optional)_ An async function that runs in the Chrome extension context when the command is called. First arg is the transcript that matched, rest of arguments are what's returned from the match command. <br><br>Resolve this promise when the command is done executing in order for chaining to work properly (if desired).<br><br> Also see [fn vs. pageFn](/api-reference/command.md#fn-vs-pagefn).|
|context| `string | string[]` | _(default: 'default')_  What context(s) this command works in. <br><br> See [Contexts](/contexts.md) for details.|
|enterContext| `string` | _(optional)_ What context to enter if this command matches.<br><br> See [Contexts](/contexts.md) for details.|
|minConfidence |`number`| _(optional)_ A decimal between 0.0 and 1.0 that specifies the minimum confidence needed for this command to be considered a match. <br><br> Useful for lowering sensitivity of specific commands if they are relatively "dangerous" to execute, for example.|
|delay | `number | number[]` | _(optional)_ How long to wait for additional input for before executing this command. Overrides delay that is built-in for commands with match strings that end in ordinals or wildcards. <br><br> Useful for when you want to allow time for more words to come through. <br><br> Use an array with indices that correspond to the different match strings if you should have different delays based on the match string.<br><br>Use 0 to override dynamically calculated delay and to execute command immediately on match.|
|activeDocument | `boolean` | _(default: false)_ whether to execute this command in the focused frame or iFrame.|
|test | `(t: ExecutionContext<ICommandTestContext>, say: (s?: string) => Promise<void>, client: WebdriverIOAsync.BrowserObject) => void` | _(optional but recommended)_ <a href="https://github.com/avajs/ava">AVA</a> integration test for this command.|

### `fn` vs. `pageFn`
::: tip NOTE
`pageFn` runs in the context of the page so it has access to the DOM, but doesn't have access to Chrome extension APIs like `chrome.tabs`. `fn` on the other hand runs in the (sandboxed) context of the Chrome extension; it doesn't have access to the page or it's DOM but it does have access to the Chrome extension APIs.
:::


## IDynamicMatch

A function that decides whether a command matches based on a transcript input for more dynamic command word possibilities.

Member | Type | Description
-------|------|---------------
fn | `(transcript: string) => `[`DynamicMatchFnResp`](/api-reference/command.md#dynamicmatchfnresp)`| undefined` | A function that takes in the transcript and returns a [`DynamicMatchFnResp`](/api-reference/command.md#dynamicmatchfnresp)if the command should execute on the given transcript.
description | `string` | Used to decribe to the user what command words match. Seen in plugins list in options.

## DynamicMatchFnResp

**Type:** `[number, number, any[]?]|undefined|false` or a `Promise` with the same result type.

The start match index, the end match index and an array of `any` type args to pass over to `pageFn` as the `...matchOutput[]` arguments. Don't include the transcript argument, as it's automatically included (and trimmed depending on the start and end match indices).


Return `false` or `Promise<false>` if there is a partial match. If there is a partial match we will delay other commands that might already want to execute.

::: tip E.g.
Imagine there's a command word for <span class="voice-cmd">reddit</span> and a [dynamic match command](/api-reference/command.md#idynamicmatch) for <span class="voice-cmd">reddit message</span> that are both valid on a given page. If the user says <span class="voice-cmd">reddit message</span> the transcripts will come down the wire something like this:

 - red
 - reddit
 - read it
 - read it mess
 - reddit mess
 - reddit message

 Can you see the problem? Our "reddit" command will execute even though we only want "reddit" message to.
:::

If you don't want the first "reddit" command to match, return `false` when there is a partial match for the dynamic <span class="voice-cmd">reddit</span> command for transcripts that start with "reddit".

## ILocalizedCommand

See also [`ICommand`](/api-reference/command.md#icommand) and [`IPluginTranslation`](/api-reference/pluginbase.md#iplugintranslation).


Member | Type       | Description
-------|------------|-------------
name   | `string`   | The original name of the command to match this localized version with.
description | `string` | _(optional)_
match  | `string | string[] |`[`IDynamicMatch`](/api-reference/command.md#idynamicmatch) | The way localized version of command match can be completely different from the base English version.
delay | `number | number[]` | _(optional)_ Delays for a localized version of a command can be completely different from the base English version.
nice | [`INiceCommand`](/api-reference/command.md#inicecommand) | _(optional)_ See [`INiceCommand`](/api-reference/command.md#inicecommand).

## INiceCommand

**Type:** `string | ((transcript: string, ...matchOutput: any[]) => string)`


Sometimes we want to adjust the transcript as it is shown on the live transcript. For example if the user says <span class="voice-cmd">go to are meal time videos</span> we would want to show that as <span class="voice-cmd">go to r/mealtimevideos</span>.

Returns the complete "live transcript" that should be shown. `rawInput` is the transcript (eg. "go to are meal time videos") `matchOutput` is an array returned from the match command if [`IDynamicMatch`](/api-reference/command.md#idynamicmatch)is used.

