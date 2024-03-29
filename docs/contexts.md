# Contexts

Contexts are groups of commands that can be combined to determine which commands are relevant or valid for the page's current state. By default, if a command does not have a context, it is in the `PluginBase.constants.contexts.Normal` context where most default commands live. LipSurf is always in <b>one or more</b> contexts. 

Example use cases:
 * Allowing certain commands only in certain situations.
    * e.g. When we're watching a Netflix show, we want <span class="voice-cmd">play</span>, <span class="voice-cmd">pause</span> etc. available. When we're browsing the Netflix catalogue, we don't want player commands, but we do want things like <span class="voice-cmd">next page</span>. To handle this, we could watch for URL changes, and if we're on a page to watch a show, we could use [`prependContext('Player Controls')`](/api-reference/pluginbase-util.md#prependContext) to add the context that the player controls are under. 
    
    ::: tip NOTE
    Because we used [`prependContext`](/api-reference/pluginbase-util.md#prependContext) the default commands will still work, because the Normal context remains in the context list. 
    :::

 * Limiting which commands are valid.
    * e.g. In the "Dictation" context, we don't want <span class="voice-cmd">youtube</span> to take us to youtube.com, we want it to literally write "youtube" where we're composing our text. In this case we don't want the "Normal" context, so we would [`enterContext(["Dictation"])`](/api-reference/pluginbase-util.md#enterContext) to replace the current context with only "Dictation".


Contexts are per-tab. So the user may be in a dictation mode in one tab, and normal mode in another. 

::: warning 
* Make sure to remove a context if it's specific to the plugin in the plugin's [destroy](/api-reference/plugin.md#destroy) function.
:::

## Context Order
Context order matters. If there are two <span class="voice-cmd">search *</span> commands, the one from the context earlier in the context list gets chosen. 

## Designating a Context
A context is "created" by designating:
- A command's [`enterContext` property](/api-reference/command.md#entercontext)
- A plugin's [`contexts` property](api-reference/plugin.md#contexts)

---------------------

Context can be manipulated programmatically using:
* [`PluginBase.util.enterContext`](api-reference/pluginbase-util.md#entercontext) 
* [`PluginBase.util.prependContext`](api-reference/pluginbase-util.md#prependContext)
* [`PluginBase.util.appendContext`](api-reference/pluginbase-util.md#appendContext)
* [`PluginBase.util.removeContext`](api-reference/pluginbase-util.md#removecontext)
* [`PluginBase.util.getContext`](api-reference/pluginbase-util.md#getcontext)

## Commands Outside of Normal Mode

By default, a command is in the `PluginBase.constants.contexts.Normal` (default) context unless [`normal: false`](api-reference/command.md#normal) is specified or a [`context`](api-reference/command.md#context) is specified that doesn't include `PluginBase.constants.contexts.Normal`.