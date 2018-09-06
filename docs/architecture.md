# Architecture

## Overview

All LipSurf commands are written in plugins.

The fact that even the primary browser functionality is written as a _regular ol'_ plugin should attest to the power of LipSurf's extensibility.

Each website has it's idiosyncrasies and some can benefit from custom commands. LipSurf functionality does not begin and end with the what it comes installed with. A subset of plugins come installed by default (the Browser, Google, and Reddit plugins) and additional plugins can be installed by users from within the extension. Plugins abstract the commands so they can be shared with all users and evolve separately from the extensions foundation — evolving fluidly with changing websites.

Lastly, of course plugins can be shared easily with the community or kept private if desired.

#### Examples
 * If you want to use DuckDuckGo instead of Google, you can write a plugin for that.
 * If you find that annotations are broken on a certain website you frequent, you can submit a PR to upgrade just the browser plugin which is separate from the core codebase.
 * If you want to give users of your own site voice command functionality, you can write a plugin for your site.

> NOTE: Plugins are usually for a specific site (such as the google search command for that searches when the user says "google ...") but they can also be for a specific set of functionality — like making all annotations in Kanji so you can save screen space and practice Japanese reading.
>
> Plugins should aim to: "Do one thing, and do it well." &trade;

!> Plugins must meet a high minimum standard of quality before being accepted as community plugins for the general public.

---
## Anatomy

Plugins are JavaScript classes with a few special attributes. It is recommended to write in [TypeScript](https://www.typescriptlang.org/) to take advantage of the `PluginBase` for inheritance and type checking.

> NOTE: All relevant examples will be given in TypeScript.

Here is an example of a simple plugin:

[GmailPlugin.ts](assets/GmailPlugin.ts ':include')
