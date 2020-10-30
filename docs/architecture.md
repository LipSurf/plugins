# Architecture

> The fact that even the core LipSurf functionality is written as plugins should attest to the power of LipSurf's extensibility.

## Overview

LipSurf [Plugins](api-reference/plugin.md) add global or site-level voice functionality.

Every LipSurf [Command](api-reference/command.md) must be a member of a [Plugin](api-reference/plugin.md).


Each website has its idiosyncrasies and many can benefit from custom commands. LipSurf functionality does not begin and end with the what it comes installed with. A subset of plugins come installed by default (plugins for the browser, Google, Reddit etc.) and additional plugins can be installed by users from within the extension. Plugins abstract the commands so they can stay separate from the extensions foundation — evolving fluidly with website updates.

Lastly, of course plugins [can be shared](https://github.com/lipsurf/plugins) easily with the community or kept private if desired.

#### Examples
 * If you want to write power commands for a website you use, you can write a plugin for that.
 * If you want to use an internal web-based company tool with LipSurf, you can write a plugin for that.
 * If you find that annotations are broken on a certain website you frequent, you can submit a PR to upgrade just the Navigation plugin which is separate from the core codebase.
 * If you want to give users of your own site voice command functionality, you can write a plugin for your site.

::: tip NOTE
Plugins are usually for a specific site (such as the Reddit plugin for upvoting, going to subreddits, viewing comments etc.) but they can also be for a specific set of functionality — like making all LipSurf tags in kanji so you can save screen space and practice Japanese reading.

 Plugins should aim to: "Do one thing, and do it well." &trade;
:::

::: danger
Plugins must meet a high minimum standard of quality before being accepted as community plugins for the general public.
:::

---
## Anatomy

Plugins are JavaScript objects that extend a [PluginBase](/api-reference/plugin.md#pluginbase) object and adhere to an [`Plugin`](api-reference/plugin.md) contract. It is recommended to write in [TypeScript](https://www.typescriptlang.org/) to have more confidence that your plugin is implemented correctly.

::: tip NOTE
All relevant examples will be given in TypeScript.
:::

Here is an example of a simple, complete plugin:

<<< @/docs/assets/Gmail.ts
