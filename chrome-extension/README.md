TODO
===

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
* Options
* Sorting by best/all etc.
* undo
* login
* mute video

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
