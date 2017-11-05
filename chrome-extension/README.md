TODO
===
*Install FZY
*Technique for cd'ing dirs? Working on projects?

Release to fam:
* Opening reddit when add-on is already activated
* Turning on plugin while page is still loading
* Tests for speaking (use speech API outside of chrome?)

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

hacks
===
When this is available: `navigator.permissions.query({name: 'microphone'})` use it instead of
`navigator.mediaDevices.getUserMedia` so we can query for permission without requesting it
from both the background and option pages.

marketing
===
*send to the guy who couldn't use his hands and posted the video of the spoon on the magnet that he could feed himself with
*Alexa, Google Home, Apple ?

dev reqs
===
Sikulix
