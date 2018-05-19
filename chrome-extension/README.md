TODO
===
v0.3
- [x] blink annotation when clicked
- [x] Make sure all annotations work nicely
- [ ] "Voice Control for Google Chrome" landing page
- [ ] Portal/documentation for plugins
- [ ] Languages
- [ ] Change "no headphone mode" to "headphones mode" and have it on by default?
- [ ] Plugins aren't updating for existing users
- [ ] https://stackoverflow.com/questions/26223401/show-css3-animate-for-2-times#comment41128302_26223401
- [ ] make plugins compile in dev watch

v0.4
- [ ] annotations change when initially turned on after first highlight
- [ ] special notification to remind user about no headphones mode?
- [ ] sometimes clicking a post number goes wrong
- [ ] say "you imbecile" or "you idiot" after a command to correct the command by adding a homophone of what you meant
- [ ] Live text not showing when command errors (eg. command not loaded)
- [ ] Fix fullscreen
- [ ] Make full screen black out background
- [ ] slow scroll down
- [ ] Return iframe positioning data from queryAllIframes so a choice can be made based on the position of the element in the page -- easy trade-off would be to only query frames that are visible within the page
- [ ] context menu - on for 10m, on for 20m, options
- [ ] scroll based on window height
- [ ] Use this for annotations? https://developer.chrome.com/extensions/automation
- [ ] Standardize extension urls instead of hardcoding them
- [ ] Better live text animation?
- [ ] Beep when error building
- [ ] Improve help pop up -- more, details, etc.
- [ ] Per-plugin settings -- auto annotate?
- [ ] Don't just use highest match for recognizer, look at all output from google STT
- [ ] Integrate with other add-ons. Eg. "ad-blocker off" would turn off addblocker. Make docs on how to do this.
- [ ] Not seeing where the click is happening is disorienting -- highlight element just before clicking?
- [ ] Cleanup iframe recursive code
- [ ] try namespaces for IPluginDefHomo... etc
- [ ] Use dict lookup on static match words to make command-transcript matching faster
- [ ] Turn on plugin for set time via context menu
- [ ] Reddit Sorting by best/all etc.
- [ ] undo?
- [ ] Improve speed

vNext
- [ ] If mic is accidently blocked by user, link them to chrome://settings/content/microphone (necessary?)
- [ ] Reddit login
- [ ] Text mode allows users to type commands (and they work in the browser)
- [ ] Click live text when there's no match to add a correction
- [ ] Allow sites to embed commands in the markup?
- [ ] Faster annotations -- study link heavy reddit

plugins
===
`matches`: array of match patterns.
	Should be in order of what should match first (likely want matches with optional parameters first)
 Why not always regx? User-friendly presentation to in options is important.
`delay`: can be single value or array if different matches should have different delays (indexes correspond to matches)
`test`: async function. The tests have every match phrase tested against.

Design rationale:
* Typescript classes converted into js
    * Biggest current downside is the static members, and the fact
    that the static members need to be functions...
    * We don't convert into a special parseable JSON as that adds an extra step -- without being justified by extra convenience.

testing
===
* testing:
    record requests: ./mitmproxy --save-stream-file ~/workspace/no-hands-man/tests.stream
    replay requests: ./mitmproxy --server-replay /home/mikob/workspace/no-hands-man/tests.stream --server-replay-nopop --server-replay-kill-extra

hacks
===
When this is available: `navigator.permissions.query({name: 'microphone'})` use it instead of
`navigator.mediaDevices.getUserMedia` so we can query for permission without requesting it
from both the background and option pages.

marketing/profit
===
* Make a game where you use your voice to play. Eg. make a funny noise to move a pong paddle left -- another funny noise to move it right.

* Insta video posts:
  -- someone eating while controlling the browser
  -- someone typing a report on one screen then saying commands to another screen with the browser open to control the page without moving their hands to the mouse
  -- a grafana dashboard on a tv screen in a meeting room -- people can talk to it to show metrics

Other successfull payed chrome extensions:
  * https://checkbot.io
    SEO checking with a pro version

  * https://www.streak.com/pricing
  CRM for gmail targets biz users

  * https://momentumdash.com/
☆☆☆ Featured in Tim Ferriss’ Tools of Titans, BuzzFeed, TheNextWeb, Lifehacker, Reddit, Product Hunt, Hootsuite, Zapier, and TheDailyMuse! ☆☆☆

  * https://chrome.google.com/webstore/detail/vidiq-vision-for-youtube/pachckjkecffpdphbpmfolblodfkgbhl?hl=en

  * https://www.diigo.com/premium
  bookmark manager
The browser extensions for Dragon are apparently atrocious. Make a better chrome extension and take a piece of that market.
Stats: 231k users
![chrome extension reviews](./res/dragon-chrome-ext-reviews.png)

  * Get people recommending it in the comments
  * Put "dragon" tags and keywords so it shows up in search results next to dragon
  * r/speechrecognition
  * A distinguishing point of advantage over dragon would be crowd-sourced plugins -- dragon will never be able to handle hugely productive edge-cases like "forward 10s" for a video on say -- vimeo
    * + Works cross-OS

TobiiDynavox is made for disabled users:
  * Costs ~10k USD
  https://twitter.com/TobiiDynavox?ref_src=twsrc%5Etfw&ref_url=http%3A%2F%2Fwww2.tobiidynavox.com%2Fmy-tobii-dynavox-overview%2F

---
*send to the guy who couldn't use his hands and posted the video of the spoon on the magnet that he could feed himself with
*Alexa, Google Home, Apple ?
*payed apps
*payed pro version that allows composing comments and custom commands?

dev reqs
===
Sikulix

stretch goals
===
support undo/redo
discourse forum

Paid Version
===
* Wake word (lipsurf on)
 https://www.reddit.com/r/speechrecognition/comments/8699hk/porcupine_a_selfservice_highlyaccurate_and/


Competitors?
===
*Annyang is for developers to add voice commands to their own sites, not for controlling the whole browser
https://ourcodeworld.com/articles/read/163/top-7-best-voice-commands-and-speech-recognition-related-javascript-libraries

References
===
typehint generation:
https://github.com/philc/vimium/blob/master/content_scripts/link_hints.coffee

Letter to W3C:
===
Hi all,

As the SpeechRecognition spec stands, there's no way to distinguish recognized speech output as additional newly recognized utterances vs. corrected (but previously outputted) words.



