<tutorial>
	<style>
		.cowabunga {
			font-family: "Special elite";
			font-size: 4rem;
			line-height: 100px;
		}

		.logo {
			float: right;
		}

	</style>
	<slide ref="slide1" timing="2">
		<img class="logo" src="../assets/icon-128.png" />
		<h1 class="cowabunga">cowabunga.</h1>
		<h2>You just installed LipSurf?</h2>
		<h2>Well aren't you just a dashingly bold experimentalist!</h2>
		<h3>Let's start by activating LipSurf by pressing it's icon in the Google Chrome toolbar.</h3>
	</slide>
	<slide ref="slide2">
		<h4>Only one person can talk at a time!</h4>
		<span>If you want your friend to try saying a command, switch LipSurf off then on again first. Otherwise your friend will just
			be considered background noise -- between you and me though... that's not far from the truth!
			<i>shhhhh...</i>
		</span>
	</slide>
	<slide ref="slide3">
		<h4>Commands are made via plugins. Anybody can create a plugin and submit it to the LipSurf officials (*cough* just me *cough*)
			for review.</h4>
		<span>Plugins are usually for specific site functionality, but can be for all sites -- the browser control functionality is implemented
			as a plugin just like the rest!</span>
	</slide>
	<slide ref="slide4">
		<h4>Say "HELP" to see all the available commands for the
			<i>current page</i> that you are on!</h4>
		<span>Try to not be so forgetful and just remember them, OK?</span>
	</slide>
	<slide ref="slide5">
		<h4>You can control which plugins, commands, homophones are enabled on the
			<a href="">Options Page</a>
		</h4>
		<span>To click the link with your voice first say "annotate" then say what's in the yellow bow on the upper left of the link.</span>
	</slide>
	<slide ref="slide6">
		<h4>If audio is detected on the page and you're not using headphones, LipSurf will have trouble understanding you.</h4>
		<h4>Use "No headphones" mode to suppress the live text feedback when audio is detected on the page.</h4>
		<span>"No headphones" mode will only show live text feedback for valid commands, like when you say "pause".</span>
	</slide>
	<script>
		console.log('hi from tutorial');
		import route from 'riot-route';
		let curSlide;
		let totalSlides = 6;
		let hasMicPerm = false;

		this.next_slide = () => {
			if (curSlide < totalSlides)
			route(`/slide/${+curSlide + 1}`);
		};

		this.prev_slide = () => {
			if (curSlide > 1)
				route(`/slide/${+curSlide - 1}`);
		};

		route(async (collection, id, action) => {
			let prevRt, newRt;
			if (!id) {
				id = 1;
			} 
			if (curSlide) {
				prevRt = this.refs[`slide${curSlide}`];
				await prevRt.slideOut();
			} 
			curSlide = id;
			newRt = this.refs[`slide${curSlide}`];
			await newRt.slideIn();
		});

		route.start(true);
	</script>
</tutorial>