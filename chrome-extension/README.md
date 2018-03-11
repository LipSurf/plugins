TODO
===
* If mic is accidently blocked by user, link them to chrome://settings/content/microphone
* middletown -- homonym is not translated in live text
* testing:
    record requests: ./mitmproxy --save-stream-file ~/workspace/no-hands-man/tests.stream
    replay requests: ./mitmproxy --server-replay /home/mikob/workspace/no-hands-man/tests.stream --server-replay-nopop --server-replay-kill-extra

* close tab isn't working
* get test probe thing working so non-audio talkingbot can work
* Cleanup iframe recursive code
* postToIframe needs to check if the message has already been processed -- the msg "click" getting sent multiple times is likely preventing video from playing
* Return iframe positioning data from queryAllIframes so a choice can be made based on the position of the element in the page -- easy trade-off would be to only query frames that are visible within the page

Release to fam:
* Fix isSuccess rendering
* Don't use synonyms on subreddit names
* Make full screen black out background
* Next page/prev page
* Fix play command to play currently expanded video
* Error red text when command fails?
* `silent` -- only valid commands are shown mode when audio is on in the tab, or detected video playing
* youtube, streamable, twitch support
* reddit.com/domain/youtube.com

v1.1
* Turn on plugin for set time
* Auto turn off plugin after x amount of inactivity time
* Options
* Reddit Sorting by best/all etc.
* undo
* mute video

v1.2
* Reddit login


nhm script spec
===
`matches`: array of match patterns.
	Should be in order of what should match first (likely want matches with optional parameters first)
 Why not always regx? User-friendly presentation to in options is important.
`delay`: can be single value or array if different matches should have different delays (indexes correspond to matches)
`test`: async function. The tests have every match phrase tested against.

hacks
===
When this is available: `navigator.permissions.query({name: 'microphone'})` use it instead of
`navigator.mediaDevices.getUserMedia` so we can query for permission without requesting it
from both the background and option pages.

marketing/profit
===
The browser extensions for Dragon are apparently atrocious. Make a better chrome extension and take a piece of that market.
Stats: 231k users
![chrome extension reviews](./res/dragon-chrome-ext-reviews.png)

  * Get people recommending it in the comments
  * Put "dragon" tags and keywords so it shows up in search results next to dragon
  * r/speechrecognition
  * A distinguishing point of advantage over dragon would be crowd-sourced plugins -- dragon will never be able to handle hugely productive edge-cases like "forward 10s" for a video on say -- vimeo
    * + Works cross-OS

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

API
===
cs --{ bubbleDown: msg }-->  background.js
cs --loadPlugins--> background.js
cs <--{cmdName: cmd name}-- backgronud.js
cs <--{liveText: live text}-- backgronud.js
cs <--{toggleActivated: boolean}-- background.js

Storage Schema
activated [boolean] -- whether extension is activated


Known Issues:
[1] Infinite loading when extension is activated. Some workarounds implemented in tests so that
    we don't wait for selenium indefinitely to consider a page "loaded".
[2] Clicking the extension and immediately turning it off leaves behind "ready" and help text
