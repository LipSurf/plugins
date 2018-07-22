TODO
===
Something is seriously wrong with the options page... switch to vue?
v0.4
- [ ] timing: https://jsfiddle.net/xpvt214o/420526/
- [ ] Landing page:
   -- Hands free browser operation while you (eat, do yoga, cook, have dirty hands)
   -- Forum (Discourse), Blog (Ghost)
	<a href="https://chrome.google.com/webstore/detail/dagohlmlhagincbfilmkadjgmdnkjinl" class="btn download-button" onclick="if(window.chrome&amp;&amp;window.chrome.webstore&amp;&amp;window.chrome.webstore.install)return chrome.webstore.install(&quot;https://chrome.google.com/webstore/detail/dagohlmlhagincbfilmkadjgmdnkjinl&quot;,console.log,console.warn),!1" target="_blank"> <img alt="" src="https://d33wubrfki0l68.cloudfront.net/b1bb3a572ed46f4a5069d61dd2cde8dc83b57876/2600e/images/chrome.svg"> <span> Install now for Chrome </span> </a>
- [ ] WK plugin add click "info"
- [x] make interfaces constants and simplify picking properties for store/options
- [ ] the preliminary/bad speech recg. results are showing up after the success one
- [ ] homophones should not check url? Because we have global homophones
- [ ] split/chaining in Japanese... plugins should use ^ $ if they need to not be allowed in a phrase
- [ ] switching from Eng/Japanese is too slow
- [ ] make run, runOnPage, and matchFn more consistently named
- [ ] update plugin documentation
- [ ] Change "no headphone mode" to "headphones mode" and have it on by default?
- [ ] Top Sites Plugin
- [ ] https://stackoverflow.com/questions/26223401/show-css3-animate-for-2-times#comment41128302_26223401
- [ ] annotations in the corner of options page, and changing
- [ ] BUG newly installed close tutorial, open coursera, options page get's opened
- [ ] BUG saying annotate multiple times seems to hide annotations
- [ ] "Voice Control for Google Chrome" landing page
- [ ] More exciting video
- [ ] All banners on google chrome store
- [ ] post on lobsters
- [ ] email back WK about the addon

WK improvements
- [ ] put even the wrong answer in the typeahead box so that the user can see when the voice recognizer is recognizing properly but
      the answer is wrong
- [ ] furigana?
- [ ] show/misete -- shows answer and let's user say right/wrong to decide if it was a speech recg. error
- [ ] let user say kunyomi or onyomi -- put the answer in either way (so they can see the shake too)
- [ ] do a Levenshtein distance check


v0.5
- [ ] make livetext hold the command that's being run
- [ ] make getting/setting options more efficient (make it load defaults but not have to load all plugins -- such as with getLanguage)
- [ ] simplify store serializing/deserializing use this lib: https://github.com/yahoo/serialize-javascript
- [ ] remove jQuery from all frames
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

Paid Version
===
* Wake word (lipsurf on)
 https://www.reddit.com/r/speechrecognition/comments/8699hk/porcupine_a_selfservice_highlyaccurate_and/
* payed pro version that allows composing comments and custom commands?

Possible Biz plans
  A. Premium Version allows for > 100 commands
  B. Premium Version has android and iOS apps (echo, alexa?)
X C. Premium Version allows for Premium Plugins (non community plugins) -- recipe sites, youtube... etc.?
   Make WK plugin a premium one
  D. X commands per month

Design rationale:
* Typescript namespaces converted into js
    * We don't convert into a special parseable JSON as that adds an extra step -- without being justified by extra convenience.

testing
===
* Send manual command:
```
  var i = 0;window.postMessage({test_probe: true, cmd: `recg.handleTranscript("down", 0.99, true, ${i + 1})`}, '*')
```
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
* "Free, browser-based alternative to Alexa, Google Home etc."
* Infographic for choosing a home voice speaker
* Tech. blog post about the Serialized<T> fanciness in typescript
* https://www.lifewithoutlimbs.org/
* Appear small. If the extension has something that feels like a small community people will embrace it more, support it more as opposed to one that seems to come from a cold, big soulless enterprise.
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
  * A distinguishing point of advantage over dragon would be crowd-sourced plugins -- dragon will never be able to handle hugely productive edge-cases like "forward 10s" for a video on say -- vimeo
    * + Works cross-OS

TobiiDynavox is made for disabled users:
  * Costs ~10k USD
  https://twitter.com/TobiiDynavox?ref_src=twsrc%5Etfw&ref_url=http%3A%2F%2Fwww2.tobiidynavox.com%2Fmy-tobii-dynavox-overview%2F

---
*send to the guy who couldn't use his hands and posted the video of the spoon on the magnet that he could feed himself with
*Alexa, Google Home, Apple ?

dev reqs
===
Sikulix

stretch goals
===
support undo/redo
discourse forum


Competitors?
===
*Alexa BrowserHelp
--http://browserhelp.me/
--Hasn't been updated since June, 2017
--Apparently company took over the product 4 months ago

* https://dhanush123.github.io/browsercontrol/

*Annyang is for developers to add voice commands to their own sites, not for controlling the whole browser
https://ourcodeworld.com/articles/read/163/top-7-best-voice-commands-and-speech-recognition-related-javascript-libraries

* Programming with voice, eye-tracking for mouse clicks: https://talonvoice.com/


References
===
typehint generation:
https://github.com/philc/vimium/blob/master/content_scripts/link_hints.coffee

font-icon:
http://fluttericon.com/

color icons:
https://icons8.com/icon/set/credit-card/color


Letter to W3C:
===
Hi all,

As the SpeechRecognition spec stands, there's no way to distinguish recognized speech output as additional newly recognized utterances vs. corrected (but previously outputted) words.


Language Resources:
https://support.mozilla.org/ja/kb/keyboard-shortcuts-perform-firefox-tasks-quickly
https://support.google.com/youtube/answer/7631406?hl=ja


