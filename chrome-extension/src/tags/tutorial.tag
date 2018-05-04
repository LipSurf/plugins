<tutorial>
	<style>
		.cowabunga {
			font-family: "Special elite";
			font-size: 4rem;
			line-height: 100px;
		}

		.center {
			text-align: center;
		}

		.logo {
			float: right;
		}

		.mute {
			color: #555;
		}

		.voice-cmd {
			background-color: #bfffbf8f;
			text-decoration: none;
		}

		.notice {
			padding: 9px 10px;
			border-radius: 4px;
			border: 1px #ddd solid;
			opacity: 0;
			transition: opacity 1s ease-out;
		}

		.notice i {
			color: #13bd13;
			vertical-align: middle;
			font-size: 1.5em;
		}

		.note {
			padding: 9px 10px;
			color: #777;
		}

		.notice.success {
			background-color: #f4fff4;
			color: #565656;
			border-color: #cae6ca;
			opacity: 1.0;
		}

		.notice.failure {
			background-color: #ffe3e0;
			border-color: #e69e9e;
			color: #8c3838;
			opacity: 1.0;
		}

		.notice.failure i, .notice.success i {
			opacity: 1;
		}

		.notice.failure i {
			color: #f34040;
		}

		.blocked-mic-instructions {
			color: red;
		}

		.perms {
			margin: 2em 0;
			text-align: center;
		}

		li {
			margin: 20px;
		}

		ul > li > ul {
			color: #666;
			font-size: 0.9em;
		}

		.left {
			text-align: left;
		}

		.warning {
			color: #f1cb00;
			vertical-align: sub;
		} 

        #bg {
            background-image: url(../assets/small_wave_pattern.svg);
            background-position: bottom;
            background-repeat-x: repeat;
            background-repeat-y: no-repeat;
            background-size: 510%;
            height: 100%;
            animation: bgIn 3.5s;
			position: absolute;
			top: 0;
			bottom: 0;
			left: 0;
			right: 0;
			height: 100%;
			width: 100%;
			opacity: 0.7;
			z-index: -1;
        }

        /* Chrome, Safari, Opera */
        @-webkit-keyframes bgIn {
            0% {opacity: 0;}
            50% {opacity: 0;}
            100% {opacity: 0.7;}
        }

        /* Standard syntax */
        @keyframes bgIn {
            0% {opacity: 0;}
            50% {opacity: 0;}
            100% {opacity: 0.7;}
        }

	</style>
	<div id="bg"></div>
	<slide ref="slide1" timing="4">
		<img class="logo" src="../assets/icon-128.png" />
		<h1 class="cowabunga">cowabunga.</h1>
		<div>
			<span>Allow LipSurf to access your microphone to begin the tutorial by clicking "allow" in the upper left where chrome prompts you.</span>
		</div>
		<div class="perms" ref="perms">
			<div rel="mic-perm" style="display: inline-block;" class="notice {success: parent.hasMicPerm, failure: parent.hasMicPerm === false}">
				<i class="material-icons">{parent.hasMicPerm ? 'check_circle' : 'error'}</i>&nbsp; <span>{ parent.hasMicPerm ? 'Has microphone permission.' : 'Needs microphone permission.' }</span>
			</div>
			<p class="mute left">Privacy: the speech recognizer is only on for the active tab when you click the LipSurf icon in the extensions toolbar.</p>
		</div>
		<span>After you've given access...</span>
	</slide>
	<slide ref="slide2" timing="4">
		<h4>Working Around Chrome Shortcomings</h4>
		<ul>
			<li>
				Change the "Autoplay policy" to "No user gesture is required" <a href="#/slide/2" onclick={ parent.openFlags }>in your flags</a> if you're using Chrome 66 or newer.
				<ul>
					<li>Chrome must be restarted for the changes to take effect</li>
					<li>This will allow you to use video controls with your voice like <span class="voice-cmd">play</span>, <span class="voice-cmd">pause</span>, <span class="voice-cmd">resume</span> etc. </li>
				</ul>
			</li>
			<!--  <li><a href="chrome://flags/#autoplay-policy">Change here</a></li>  -->
			<!--  <li><a href="chrome://flags/#autoplay-policy">Change here</a></li>  -->
		</ul>
		<div class="small"><a href="https://developers.google.com/web/updates/2017/09/autoplay-policy-changes#iframe">More Details</a></div>
	</slide>
	<slide ref="slide3" timing="4">
		<h4>Only One Person at a Time!</h4>
		<ul>
			<li>
				Speech recognition will do it's best to listen to the original speaker.
				<ul>
					<li>Switch LipSurf off then on again to change speakers.</li>
					<li>Otherwise other people speaking will just be considered background noise.</li>
				</ul>
			</li>
		</ul>
	</slide>
	<slide ref="slide4" timing="5">
		<h4>Endless Commands</h4>
		<ul>
			<li>By default LipSurf has 50-ish commands.</li>
			<li>Additional commands can be installed with more plugins in the future (not yet available).</li>
			<li>A <strong>plugin</strong> is a collection of commands for a <strong>certain site</strong> 
			<ul><li>The commands for a plugin will usually only work for that plugin's site (eg. Reddit plugin commands only work on Reddit.com). Unless...</li>
			</ul>
			</li>
			<li>Commands marked "global" can be run anywhere!</li>
			<li>Anybody can create a plugin for a site and submit it to the LipSurf officials &nbsp;<i>(*cough* just me *cough*)</i> &nbsp;for review.</li>
			<li>You can control and see which plugins, commands, and homophones are enabled in the
				<a target="_blank" class="voice-cmd" href={parent.optionsUrl}>options</a>.
			</li>
		</ul>
	</slide>
	<slide ref="slide5" timing="6">
		<h4>How to Click Anything</h4>
		<ul>
			<li>Say <span class="voice-cmd">annotate</span> to highlight all clickable things on the page.</li>
			<li>To click any clickable thing with your voice, simply say what's in the yellow annotation on the upper left of the clickable thing!</span>
		</ul>
		<div class="note">
			<i class="material-icons warning">warning</i> &nbsp;Annotations stay on every page until you say <span class="voice-cmd">annotate off</span>
		</div>
	</slide>
	<slide ref="slide6" timing="4">
		<h4>When in Doubt, Just Say HELP</h4>
		<ul>
			<li><span class="voice-cmd">Help</span> shows all the available commands for the <i>current page</i> that you are on!</li>
			<li>Say <span class="voice-cmd">close help</span> to get rid of the pesky help box.</li>
		</ul>
	</slide>
	<slide ref="slide7" timing="4">
		<h2 class="center">Dude, you made it to the end of the tutorial. Enjoy LipSurf!</h2>
		<h4>Final Notes</h4>
		<div>Configure on the <a target="_blank" class="voice-cmd" href={parent.optionsUrl}>options</a> page.</div>
		<ul>
			<li>Automatic Shut-off Time
				<ul>
					<li>LipSurf will automatically deactivate if you don't give it a legit command for 20 minutes (by default).</li>
				</ul>
			</li>
			<li>No Headphones Mode
				<ul>
					<li>If you're playing a video but not using headphones, LipSurf might pick up the speech from the video.</li>
					<li>Use the "no headphones" mode to suppress the live text feedback in these cases.</li>
					<li>This mode will only show live text feedback for valid commands, and not all of the speech coming from the video you're playing.</li>
				</ul>
			</li>
		</ul>
	</slide>
	<script>
		console.log('hi from tutorial');
		import route from 'riot-route';
		import { storage } from '../common/browser-interface';
		let curSlide;
		this.totalSlides = 7;
		this.hasMicPerm = false;
		this.activated = false;
		this.optionsUrl = chrome.extension.getURL("views/options.html");  

		route(async (collection, id, action) => {
			let prevRt, newRt;
			if (!id) {
				id = 1;
			} 
			id = +id;
			if (typeof id !== "number" || id > this.totalSlides || id < 1 || isNaN(id))
				id = 1;
			if (curSlide) {
				prevRt = this.refs[`slide${curSlide}`];
				await prevRt.slideOut(curSlide <= id ? true : false);
			} 

			newRt = this.refs[`slide${id}`];
			if (!curSlide && id == 1) {
				// very first slide
				// TODO: make more special
				await newRt.slideIn(false);
			} else {
				await newRt.slideIn(curSlide <= id ? false : true);
			}
			curSlide = id;
		});

		route.start(true);

		// auto activate lipsurf
        storage.local.registerOnChangeCb((changes) => {
			if (changes && changes.activated && changes.activated.newValue) {
				this.activated = true;
				this.update();
			}
		});
		storage.local.save({activated: true});

		// cannot open flags with regular anchor tag
		this.openFlags = () => {
			chrome.tabs.create({
				active: true,
				url: 'chrome://flags/#autoplay-policy'
			});
		}

		this.checkForPermission = () => {
			navigator.mediaDevices.getUserMedia({
				audio: true,
			}).then((stream) => {
				this.hasMicPerm = true;
				console.log(`hasMicPerm ${this.hasMicPerm}`);
				this.update();
			}, () => {
				// Aw. No permission (or no microphone available).
				this.hasMicPerm = false;
				console.log(`hasMicPerm ${this.hasMicPerm}`);
				this.update();
			});
		}

		this.checkForPermission();
        setInterval(() => {
            this.checkForPermission();
        }, 1500);  

		this.exitTutorial = async () => {
			await storage.sync.save({tutorialMode: false});
			window.close();
		};	

		window.addEventListener('unload', this.exitTutorial);

	</script>
</tutorial>