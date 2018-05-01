<slide>
	<div ref="card" class="card hide">
	<yield/>
	<div class="control-bar">
		<div if={ !this.finalSlide } class="voice-btn">
			Say <a ref={this.finalSlide ? '' : 'pulser'} class="pulsate" href={`#slide/${this.slideNum + 1}`}>&quot;next&quot;</a> to continue
		</div>
		<div if={ this.slideNum > 1 } class="voice-btn small">
			Say <a href={`#slide/${this.slideNum - 1}`}>&quot;previous&quot;</a> or "back" to go back
		</div>
		<a class="voice-btn {small: !this.finalSlide, first: this.finalSlide}" onclick={ exitTutorial }>
			Say <span class="pulsate" ref={this.finalSlide ? 'pulser' : ''} >&quot;close tab&quot;</span> to {this.slideNum == 1 ? 'skip' : 'finish'} the tutorial
		</a>
		<a style="display: none" href={`#slide/${this.slideNum - 1}`}>prev</a>
	</div>
	<div class="slide-num small">Page {this.slideNum}/{parent.totalSlides}</div>
	</div>
	<style>
		.card {
			max-width: 800px;
			margin: 0 auto;
			background-color: #fff;
			padding: 25px;
			box-shadow: #b3b3b3 2px 8px 8px 2px;
		}

		.first {
			order: -1;
		}

		.hide {
			display: none;
		}

		.slide-num {
			text-align: right;
			color: #8a8a8a;
		}

		.small {
			font-size: 0.8rem;
		}

		.voice-btn {
			color: orange;
			font-weight: bold;
			margin: 5px;
		}

		.voice-btn a {
			color: orange;
			font-weight: bold;
			text-decoration: none;
		}

		.visible {
			display: block;
		}

		.control-bar {
			text-align: center;
			margin-top: 3em;
			display: flex;
			flex-direction: column;
		}

		.slide-in-left {
			-webkit-animation: slide-in-left 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
					animation: slide-in-left 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
		}

		.slide-in-right {
			-webkit-animation: slide-in-right 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
					animation: slide-in-right 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
		}

		.slide-out-left {
			-webkit-animation: slide-out-left 0.5s cubic-bezier(0.550, 0.085, 0.680, 0.530) both;
							animation: slide-out-left 0.5s cubic-bezier(0.550, 0.085, 0.680, 0.530) both;
		}

		.slide-out-right {
			-webkit-animation: slide-out-right 0.5s cubic-bezier(0.550, 0.085, 0.680, 0.530) both;
							animation: slide-out-right 0.5s cubic-bezier(0.550, 0.085, 0.680, 0.530) both;
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

		@-webkit-keyframes slide-in-left {
		  0% {
			-webkit-transform: translateX(-1000px);
					transform: translateX(-1000px);
			opacity: 0;
		  }
		  100% {
			-webkit-transform: translateX(0);
					transform: translateX(0);
			opacity: 1;
		  }
		}
		@keyframes slide-in-left {
		  0% {
			-webkit-transform: translateX(-1000px);
					transform: translateX(-1000px);
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

@-webkit-keyframes slide-out-right {
  0% {
    -webkit-transform: translateX(0);
            transform: translateX(0);
    opacity: 1;
  }
  100% {
    -webkit-transform: translateX(1000px);
            transform: translateX(1000px);
    opacity: 0;
  }
}
@keyframes slide-out-right {
  0% {
    -webkit-transform: translateX(0);
            transform: translateX(0);
    opacity: 1;
  }
  100% {
    -webkit-transform: translateX(1000px);
            transform: translateX(1000px);
    opacity: 0;
  }
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
		import { storage } from '../common/browser-interface';
		let pulseStartTime = +this.opts.timing;
		let animTime = 500;
		this.active = false;
		this.slideNum = +this.opts.ref.replace('slide', '');
		this.finalSlide = this.slideNum == this.parent.totalSlides;

		this.slideIn = async (left = false) => {
			let rt = this.refs.card;
			rt.classList.remove('hide');
			rt.classList.add(`slide-in-${left ? 'left' : 'right'}`);
			this.active = true;

			if (pulseStartTime && this.refs.pulser) {
				setTimeout(() => {
					this.refs.pulser.classList.add('pulsate-fwd');
				}, pulseStartTime * 1000);
			}

			return new Promise((resolve, reject) => {
				setTimeout(() => {
					rt.classList.remove(`slide-in-${left ? 'left' : 'right'}`);
					resolve();
				}, animTime);
			});
		};

		this.slideOut = async (left = true) => {
			let rt = this.refs.card;
			rt.classList.add(`slide-out-${left ? 'left' : 'right'}`);
			this.active = false;

			if (pulseStartTime && this.refs.pulser) {
				this.refs.pulser.classList.remove('pulsate-fwd');
			}

			return new Promise((resolve, reject) => {
				setTimeout(() => {
					rt.classList.remove(`slide-out-${left ? 'left' : 'right'}`);
					rt.classList.add('hide');
					resolve();
				}, animTime);
			});
		};

		this.exitTutorial = () => {
			window.close();
		};	
	
		this.on('route', function(a, b, c) {
			console.log('hello');
		});

	</script>
</slide>
