# Match Patterns

::: warning NOTE
It's recommended that you go through the [5 Minute Quick Start](/quick-start.md) first to understand how to create and install your plugin.
:::

## Compact Form

Instead of writing out potentially 100s of forms for a command's [match](/api-reference/command.md#match) property, you can use compact form syntax.

eg. `'[delete/remove] [/the ]previous [word/# words]'` expands to:

* delete previous word
* remove previous word
* delete the previous word
* remove the previous word
* delete previous # words
* remove previous # words
* delete the previous # words
* remove the previous # words

::: tip TIPS
* You cannot nest brackets.
* Priority is respected by the order in the brackets.
:::

## Wildcard Matching

What if we want a plugin that accepts an arbitrary argument after some key words (AKA a slot)?

Let's make a plugin that shows the weather for any city when user says: <span class="voice-cmd">weather for [city name]</span> (eg. <span class="voice-cmd">weather for Chiang Mai</span>)

_Easy peasy._

Use `*` in your `match` string to greedily match any words.

<<< @/assets/Weather.ts{17}

## Numeral Matching

_Ain't nothin' to it._

Use `#` in your `match` string to match numerals or ordinals including ones that are spelled-out (ie. <span class="voice-cmd">four-thousand</span>)

Let's write a plugin that opens a tab with URL x for y minutes so that we can limit it's time wasting-ness. This might be useful if we need to check Facebook but don't want to get sucked into the feed for too long.

<<< @/assets/AntiProcrastination.ts{18}

## Match Function

For the most advanced cases, you can write a function that takes in transcripts as they come down the wire and return `undefined` when there's *no match*, or an array of arguments to pass to the `pageFn` when there *is* a match.

Use cases include:
 * Match based on something on the page
 * Match based on some internal plugin state
 * Regex matching

_Cake walk._

We need to make `match` an object of type [`DynamicMatch`](/api-reference/command.md#dynamicmatch)

How about a plugin for Gmail that moves the currently selected messages to a folder that the user commands to?

::: tip
We could use the wildcard matching for this (eg. "move to *") but then we cant limit the user's choices to valid folders.
:::

<<< @/assets/GmailMoveFolder.ts


::: tip NOTE
The match function needs to check the whole transcript for matches and then return indexes for which parts it used.
This way the transcript can have the proper section success highlighted (in green) that matches a command, and command chaining will work.
:::
