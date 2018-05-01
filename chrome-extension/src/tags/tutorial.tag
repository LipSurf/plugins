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

	</style>
	<slide ref="slide1" timing="2">
		<img class="logo" src="../assets/icon-128.png" />
		<h1 class="cowabunga">cowabunga.</h1>
		<div if={ !parent.activated }>
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
		<h4>Only One Person at a Time!</h4>
		<ul>
			<li>
				If you want your friend to try saying a command, switch LipSurf off then on again first.
				<ul>
					<li>Otherwise your friend will just be considered background noise.</li>
				</ul>
			</li>
		</ul>
	</slide>
	<slide ref="slide3" timing="5">
		<h4>Commands are made via Plugins</h4>
		<ul>
			<li>Anybody can create a plugin and submit it to the LipSurf officials &nbsp;<i>(*cough* just me *cough*)</i> &nbsp;for review.</li>
			<li>You can control which plugins, commands, and homophones are enabled in the
				<a target="_blank" href={parent.optionsUrl}>Options</a>.
			</li>
			<li>Plugins are usually for specific site functionality, but can be for all sites.</li> 
			<li>The philosophy is: power to the plugins.
				<ul>
					<li>Even browser control functionality is implemented as a plugin!</li>
				</ul>
			</li>
		</ul>
	</slide>
	<slide ref="slide4" timing="6">
		<h4>When there isn't a Plugin for Site-Specific Functionality...</h4>
		<ul>
			<li>Global commands are still available for all pages.</li>
			<li>Say "Annotate" to highlight all clickable elements on the page and navigate any page.</li>
			<li>To click any clickable thing with your voice simply say what's in the yellow annotation on the upper left of the clickable thing!</span>
		</ul>
		<div class="note">
			<i class="material-icons warning">warning</i> &nbsp;Annotations stay on every page until you say "annotate off"
		</div>
	</slide>
	<slide ref="slide5" timing="4">
		<h4>When in Doubt, Just Say "HELP"</h4>
		<ul>
			<li>"Help" shows all the available commands for the <i>current page</i> that you are on!</li>
			<li>Say "Close help" to get rid of the pesky help box.</li>
		</ul>
	</slide>
	<slide ref="slide6" timing="4">
		<h2 class="center">Dude, you made it to the end of the tutorial. Enjoy LipSurf!</h2>
		<h4>Final Notes</h4>
		<ul>
			<li>LipSurf will automatically deactivate after 25 minutes by default.
				<ul>
					<li>Default auto. off time can be adjusted in the <a target="_blank" href={parent.optionsUrl}>options</a>.</li>
				</ul>
			</li>
			<li>If audio is detected on the page and you're not using headphones, LipSurf will have trouble understanding you.
				<ul>
					<li>Use "No headphones" mode to suppress the live text feedback when audio is detected on the page.</li>
					<li>"No headphones" mode will only show live text feedback for valid commands, like when you say "pause".</li>
				</ul>
			</li>
		</ul>
	</slide>
	<script>
		console.log('hi from tutorial');
		import route from 'riot-route';
		import { storage } from '../common/browser-interface';
		let curSlide;
		this.totalSlides = 6;
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
			await newRt.slideIn(curSlide <= id ? false : true);
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

	</script>
</tutorial>