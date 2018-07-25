<template>
	<div ref="card" class="card">
	<slot/>
	<div class="control-bar">
		<div v-if="!$parent.finalSlide" class="voice-btn" :class="{ disabled: !hasMicPerm }">
			Say <router-link class="pulsate voice-cmd" :class="{'pulsate-fwd': pulsate}" :to="{name: 'slide', params: {slideNum: +$route.params.slideNum + 1}}">next</router-link> to continue
		</div>
		<div v-if="+$route.params.slideNum > 1" class="voice-btn small" :class="{ disabled: !hasMicPerm }">
			Say <router-link :to="{name: 'slide', params: {slideNum: +$route.params.slideNum - 1}}" class="voice-cmd">previous</router-link> or <span class="voice-cmd">back</span> to go back
		</div>
		<div class="voice-btn" :class="{small: !$parent.finalSlide, first: $parent.finalSlide, disabled: !hasMicPerm}">
			Say <a @click="$parent.exitTutorial" href="#" class="pulsate voice-cmd" :class="{'pulsate-fwd': pulsate && $parent.finalSlide}">close tab</a> to {{ +$route.params.slideNum == 1 ? 'skip' : 'finish' }} the tutorial
		</div>
		<router-link style="display: none" :to="{name: 'slide', params: {slideNum: +$route.params.slideNum - 1}}">prev</router-link>
	</div>
	<div class="slide-num small">Page {{ +$route.params.slideNum }}/{{ $parent.totalSlides }}</div>
	</div>
</template>
<style scoped>
		.card {
			max-width: 800px;
			margin: 0 auto;
			background-color: #ffffffd6;
			padding: 25px;
		}

		.disabled {
			color: #d0d0d0 !important;
		}
		.disabled a {
			color: #d0d0d0 !important;
		}
		.disabled .voice-cmd {
			background-color: #f5f5f5;
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
<script lang="ts">
import { Component, Vue, Prop, Watch, } from "vue-property-decorator";
const ANIM_TIME = 500;

@Component
export default class Slide extends Vue {

	@Prop()
	timing!: number;

	// HACK:
	@Prop()
	hasMicPerm!: boolean;

	pulsate = false;

	@Watch('hasMicPerm', {immediate: true})
	nextableChange(newVal, oldVal) {
		if (newVal) {
			this.startPulsing();
		}
	}

	startPulsing() {
		setTimeout(() => {
			this.pulsate = true;
		}, +this.timing * 1000);
	}

}
</script>
