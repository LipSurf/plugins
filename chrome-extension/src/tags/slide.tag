<slide>
	<div class="card slide-in-right">
	<yield/>
	<div class="control-bar">
		<a class="voice-btn" onclick={ nextSlide }>
			Say <span class="pulsate">&quot;next&quot;</span> to continue
		</a>
		<div>-or-</div>
		<a class="voice-btn small" onclick={ exitTutorial }>
			Say &quot;close tab&quot; to close the tutorial
		</a>
	</div>
	</div>
	<style>
		.card {
			max-width: 800px;
			margin: 0 auto;
			background-color: #fff;
			padding: 25px;
			box-shadow: #b3b3b3 2px 8px 8px 2px;
		}

		.small {
			font-size: 0.8rem;
		}

		.voice-btn {
			color: orange;
			font-weight: bold;
			text-decoration: none;
			cursor: pointer;
		}

		.visible {
			display: block;
		}

		.control-bar {
			text-align: center;
		}

		.slide-in-right {
			-webkit-animation: slide-in-right 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
					animation: slide-in-right 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
		}

		@-webkit-keyframes slide-in-right {
		  0% {
			-webkit-transform: translateX(1000px);
					transform: translateX(1000px);
			opacity: 0;
		  }
		  100% {
			-webkit-transform: translateX(0);
					transform: translateX(0);
			opacity: 1;
		  }
		}
		@keyframes slide-in-right {
		  0% {
			-webkit-transform: translateX(1000px);
					transform: translateX(1000px);
			opacity: 0;
		  }
		  100% {
			-webkit-transform: translateX(0);
					transform: translateX(0);
			opacity: 1;
		  }
		}

@-webkit-keyframes slide-out-left {
  0% {
    -webkit-transform: translateX(0);
            transform: translateX(0);
    opacity: 1;
  }
  100% {
    -webkit-transform: translateX(-1000px);
            transform: translateX(-1000px);
    opacity: 0;
  }
}
@keyframes slide-out-left {
  0% {
    -webkit-transform: translateX(0);
            transform: translateX(0);
    opacity: 1;
  }
  100% {
    -webkit-transform: translateX(-1000px);
            transform: translateX(-1000px);
    opacity: 0;
  }
}

.slide-out-left {
	-webkit-animation: slide-out-left 0.5s cubic-bezier(0.550, 0.085, 0.680, 0.530) both;
	        animation: slide-out-left 0.5s cubic-bezier(0.550, 0.085, 0.680, 0.530) both;
}

pulsating-btn.small {
	font-size: 0.7rem;
}

.pulsate-fwd {
	display: inline-block;
	-webkit-animation: pulsate-fwd 0.5s ease-in-out infinite both;
	        animation: pulsate-fwd 0.5s ease-in-out infinite both;
}
@keyframes pulsate-fwd {
  0% {
    -webkit-transform: scale(1);
            transform: scale(1);
			background-color: transparent;
  }
  50% {
    -webkit-transform: scale(1.1);
            transform: scale(1.1);
			background-color: #bfffbf8f;
  }
  100% {
    -webkit-transform: scale(1);
            transform: scale(1);
			background-color: transparent;
  }
}


	</style>
	<script>
		import route from 'riot-route/lib/tag';
		let pulseStartTime = +this.opts.timing;
		let slideRegx = /\/?slide\/(\d+)/;
		if (pulseStartTime) {
			setTimeout(() => {
				let pulsers = document.querySelector('.pulsate');
				pulsers.classList.add('pulsate-fwd');
			}, pulseStartTime * 1000);
		}

		this.nextSlide = () => {
			let curSlide = document.location.hash.match(slideRegx);
			route(`/slide/${+curSlide[1] + 1}`);
		};

		this.exitTutorial = () => {
			window.close();
		};
	</script>
</slide>
