# LipSurf.js

LipSurf.js is a standalone script version of LipSurf that works entirely in-page without a supporting Chrome Extension.
Plugins may be bundled with the LipSurf.js script.

## Including LipSurf.js
```html
<script src="/path/to/lipsurf.js"></script>
```

## Quick Start
```js
var lipsurf = LipSurf();
var i = 0;
lipsurf.start();
lipsurf.handleTranscript('hello world', 0.99, true, i++, +new Date())
```

## Initializing LipSurf.js
```typescript
var lipsurf = LipSurf({
  // default `true`
  liveTs?: boolean,
});
```

## Methods
### `handleTranscript`
Sends STT generated transcript to LipSurf for processing and command execution.
```typescript
/**
  * 
  * @param transcript
  * @param confidence between 0 and 1, 1 being the highest level of confidence
  * @param isFinal set to true if there will not be any subsequent adjustments 
  *     to this transcript
  * @param segmentId so we can identify if we're updating a previous 
  *     transcript (eg. with a higher confidence), or if we're adding newly said 
  *     things
  * @param recgTime when the transcript was generated in milliseconds since 
  *     UNIX epoch
  */
handleTranscript(
		transcript: string,
		confidence: number,
		isFinal: boolean, 
		segmentId: number,
		recgTime: number
	): void;
```

### `start`
Start listening.
### `pause`
Pauses LipSurf from listening, but does not turn it completely off (useful for keeping LipSurf generated UI on the screen).
### `shutdown`
Stops listening and all LipSurf generated UI removed.