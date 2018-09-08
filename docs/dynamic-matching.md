# Dynamic Match Patterns

::: warning NOTE
It's recommended that you go through the [5 Minute Quick Start](/quick-start) first to understand how to install and test your plugins.
:::

## Wilcard Matching

What if we want a plugin that accepts an arbitrary argument after some key words?

Let's make a plugin that shows the weather for any city when user's say "weather for [city name]" (eg. <span class="voice-cmd">weather for Chiang Mai</span>)

_Easy peasy._

Use `*` in the match str to greedily match any words.

<<< @/docs/assets/Weather.ts{14}

## Numeral Matching

_Ain't nothin' to it._

Use `#` in the match str to match numerals or ordinals including ones that are spelled-out (ie. <span class="voice-cmd">four thousand</span>)

Let's write a plugin that opens x tab for y minutes so that we can limit it's time wasting-ness. This might be useful if we need to check facebook but don't want to get sucked into the feed for too long.

<<< @/docs/assets/AntiProcrastination.ts{14}

## Matching Function

For the most advanced cases, you can write a function that takes in transcripts as they come down the wire and returns `undefined` when there's *no match*, or an array of arguments to pass to the `pageFn` when there *is* a match.

Use cases include:
 * Match based on something on the page
 * Match based on some internal state
 * Regex matching

_Cake walk._

We need to make `match` an object of type [`IDynamicMatch`](/api-reference/command.md#idynamicmatch)

How about a plugin for GMail that moves the currently selected messages to a folder that the user says aloud.

::: tip
We could use the wildcard matching for this (eg. "move to *") but then we cant limit the user's choices to valid folders.
:::

<<< @/docs/assets/GmailMoveFolder.ts
