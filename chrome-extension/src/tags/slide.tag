<slide>
	<div ref="card" class="card hide">
	<yield/>
	<div class="control-bar">
		<div if={ !this.finalSlide } class="voice-btn">
			Say <a ref={this.finalSlide ? '' : 'pulser'} class="pulsate voice-cmd" href={`#slide/${this.slideNum + 1}`}>next</a> to continue
		</div>
		<div if={ this.slideNum > 1 } class="voice-btn small">
			Say <a href={`#slide/${this.slideNum - 1}`} class="voice-cmd">previous</a> or <span class="voice-cmd">back</span> to go back
		</div>
		<div class="voice-btn {small: !this.finalSlide, first: this.finalSlide}">
			Say <a onclick={ parent.exitTutorial } href="#" class="pulsate voice-cmd" ref={this.finalSlide ? 'pulser' : ''} >close tab</a> to {this.slideNum == 1 ? 'skip' : 'finish'} the tutorial
		</div>
		<a style="display: none" href={`#slide/${this.slideNum - 1}`}>prev</a>
	</div>
	<div class="slide-num small">Page {this.slideNum}/{parent.totalSlides}</div>
	</div>
	<style>
		.card {
			max-width: 800px;
			margin: 0 auto;
			background-color: #ffffffd6;
			padding: 25px;
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

		.voice-btn a{
			color: orange;
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
				this.refs.pulser.classList.remove('pulsate-fwd');
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

			return new Promise((resolve, reject) => {
				setTimeout(() => {
					rt.classList.remove(`slide-out-${left ? 'left' : 'right'}`);
					rt.classList.add('hide');
					resolve();
				}, animTime);
			});
		};

	</script>
</slide>
