# Contexts

Contexts are states that LipSurf can enter, which limit the scope of commands that are valid. By default, if a command does not have a context, it is in the "Normal" context where most default commands live. LipSurf is always in <b>one or more</b> contexts. 

Use cases include:
 * Making different commands available on different pages.
    * eg. When we're watching a Netflix show, we want <span class="voice-cmd">play</span>, <span class="voice-cmd">pause</span> etc. available. When we're browsing the Netflix catalogue, we don't want player commands, but we do want things like <span class="voice-cmd">next page</span>.
 * Allowing certain commands only in certain situations.
    * eg. <span class="voice-cmd">slower</span> and <span class="voice-cmd">faster</span> for <span class="voice-cmd">auto scroll</span> only makes sense after the user has said <span class="voice-cmd">auto scroll</span>.
 * Limiting which commands are valid.
    * eg. In the "Dictation" context, we don't want "youtube" to take us to youtube.com, we want it to literally write "youtube" where we're composing our text.

 To make a context, simply designate a context as a part of an [ICommand's](/api-reference/command.md#icommand) `context` or `enterContext` property
 <br>
 <center>-or-</center>
 <br>
 for more advanced cases, declare the context in a [plugin's context's property](api-reference/pluginbase.md#pluginbase-2).

---------------------

You can use [`PluginBase.util.enterContext`](api-reference/pluginbase.md#pluginbase-util) to programmatically enter a context. To exit the context, simply enter the 'Normal' context.

::: tip NOTE
The first use case has a context that _extends_ the Normal context, because in the "Auto Scroll" context, it is still valid to use other commands eg. for clicking links.

On the other hand, the second use case involves a context that does
not extend the Normal context, so only commands specified in the context will work.
:::
