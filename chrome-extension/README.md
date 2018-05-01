TODO
===
v1.0
- [ ] Fix reddit commands
- [ ] Polish up slides
- [ ] Put license on code
- [ ] Tutorial Page
-- auto reload tabs when plugin is first installed
- [ ] stop goes to top of page
- [ ] Get build pipeline optimized (obfuscate output)
- [ ] Fix fullscreen
- [ ] Return iframe positioning data from queryAllIframes so a choice can be made based on the position of the element in the page -- easy trade-off would be to only query frames that are visible within the page
- [ ] Make full screen black out background
- [ ] `silent` -- only valid commands are shown mode when audio is on in the tab, or detected video playing
- [ ] Live text not showing when command errors (eg. command not loaded)
- [ ] 2 full days of testing?

v1.1
* Use this for annotations? https://developer.chrome.com/extensions/automation
* Standardize extension urls instead of hardcoding them
* Shadow DOM for annotations
* Faster annotations -- study link heavy reddit
* Better live text animation?
* Beep when error building
* Improve help pop up -- more, details, etc.
* Per-plugin settings -- auto annotate?
* Don't just use highest match for recognizer, look at all output from google STT
* Integrate with other add-ons. Eg. "ad-blocker off" would turn off addblocker. Make docs on how to do this.
* Not seeing where the click is happening is disorienting -- highlight element just before clicking?
* Cleanup iframe recursive code
* try namespaces for IPluginDefHomo... etc
* Use dict lookup on static match words to make command-transcript matching faster
* Turn on plugin for set time via context menu
* Reddit Sorting by best/all etc.
* undo?
* mute video
* Improve speed

vNext
* If mic is accidently blocked by user, link them to chrome://settings/content/microphone (necessary?)
* Reddit login
* Text mode allows users to type commands (and they work in the browser)
* Click live text when there's no match to add a correction
* Allow sites to embed commands in the markup?

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
Make a game where you use your voice to play. Eg. make a funny noise to move a pong paddle left -- another funny noise to move it right.

Other successfull payed chrome extensions:
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

API
===
cs --{ bubbleDown: msg }-->  background.js
cs --loadPlugins--> background.js
cs <--{cmdName: cmd name}-- backgronud.js
cs <--{liveText: live text}-- backgronud.js
cs <--{toggleActivated: boolean}-- background.js


Known Issues:
[1] Infinite loading when extension is activated. Some workarounds implemented in tests so that
    we don't wait for selenium indefinitely to consider a page "loaded".
[2] Clicking the extension and immediately turning it off leaves behind "ready" and help text


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



