TODO
===
Release to fam:

* Make new json plugs work!
* Reload all reddit tabs on install
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
`matches`: array of match patterns
 Why not always regx? User-friendly presentation to in options is important.
`delay`: can be single value or array if different matches should have different delays (indexes correspond to matches)