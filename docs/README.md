# Overview
_[LipSurf](https://www.lipsurf.com) plugins are like [UserScripts](https://en.wikipedia.org/wiki/Userscript) (eg. GreaseMonkey et al.) for voice._

Firstly, _**prohst**_ to you! By nature of being on this page, I can tell you have exquisite taste for software!

### What are you talking about?

[LipSurf](https://chrome.google.com/webstore/detail/lipsurf/lnnmjmalakahagblkkcnjkoaihlfglon) is a Google Chrome extension that enables users to browse with their voice — augmenting the mouse/keyboard paradigm, enabling hands-free productivity. This serves many purposes:

 - Using the computer while your hands are dirty or busy (eating, cleaning etc.)
 - Enabling those with physical impairments or those wishing to prevent repetitive strain injury ([RSI](https://www.nhs.uk/conditions/repetitive-strain-injury-rsi/)) of the hands
 - Creating quick shortcuts for complex motions (eg. <span class="voice-cmd">compose mail to John</span> can open up a prefilled email message on Gmail faster than traditional browser navigation)
 - Enabling one to be far from the computer keyboard/mouse (eg. media center PCs)

### Features
 - Extensible architecture
 - Simple, declarative plugins
 - Command chaining
 - Supports [100+ languages](/langs.md)
 - Testing is built-in

### Quick Complete Example Plugin
Writing your own plugins for LipSurf is *pleasureably* straightforward.

<<< @/docs/assets/Gmail.ts

