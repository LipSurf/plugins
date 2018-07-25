<template>
  <div>
    <div ref="bg" id="bg"></div>
    <transition :name="`slide-${slideLeft ? 'left' : 'right'}`" mode="out-in" appear>
      <!-- HACK: throw in hasMicPerm prop to all slides, otherwise it won't get updated using $parent.hasMicPerm !-->
    <Slide key="slide1" timing="1" v-if="$route.params.slideNum == 1" :has-mic-perm="hasMicPerm">
      <img class="logo" src="/assets/icon-128.png" />
      <h1 class="cowabunga">cowabunga.</h1>
      <div>
        <span>Allow LipSurf to access your microphone to begin the tutorial by clicking "allow" in the upper left where chrome prompts you.</span>
      </div>
      <div class="perms" ref="perms">
        <div style="display: inline-block;" class="notice" :class="{success: hasMicPerm, failure: hasMicPerm === false}">
          <i class="icon" :class="{'check-circle': hasMicPerm, error: !hasMicPerm}"></i>&nbsp;
          <span>{{ hasMicPerm ? 'Has microphone permission.' : 'Needs microphone permission.' }}</span>
        </div>
        <p class="mute left">Privacy: the speech recognizer is only on for the active tab when you click the LipSurf icon in the extensions toolbar.</p>
      </div>
      <span>After you've given access...</span>
    </Slide>
    <Slide key="slide2" timing="4" v-if="$route.params.slideNum == 2" :has-mic-perm="hasMicPerm">
      <h4>Working Around Chrome Shortcomings</h4>
      <ul>
        <li>
          Change the "Autoplay policy" to "No user gesture is required"
          <a href="#/slide/2" @click="openFlags">in your flags</a> if you're using Chrome 66 or newer.
          <ul>
            <li>Chrome must be restarted for the changes to take effect</li>
            <li>This will allow you to use video controls with your voice like
              <span class="voice-cmd">play</span>,
              <span class="voice-cmd">pause</span>,
              <span class="voice-cmd">resume</span> etc. </li>
          </ul>
        </li>
      </ul>
      <div class="small">
        <a href="https://developers.google.com/web/updates/2017/09/autoplay-policy-changes#iframe">More Details</a>
      </div>
    </Slide>
    <Slide key="slide3" timing="4" v-if="$route.params.slideNum == 3" :has-mic-perm="hasMicPerm">
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
    </Slide>
    <Slide key="slide4" timing="4" v-if="$route.params.slideNum == 4" :has-mic-perm="hasMicPerm">
      <h4>
        <i class="icon headphones"></i> Use Headphones when Playing Videos/Music!</h4>
      <ul>
        <li>
          The sound from videos will make it hard for LipSurf to discern your voice, unless you use headphones.
        </li>
        <li>"No Headphones Mode" can be found in the
          <a target="_blank" class="voice-cmd" :href="$parent.optionsUrl">options</a>.
          <ul>
            <li>Does not help LipSurf recognize commands with background noise.</li>
            <li>Suppresses gibberish live text; will only show live text feedback for valid commands, not live text for all of the speech coming from the video you're playing.</li>
          </ul>
        </li>
      </ul>
    </Slide>
    <Slide key="slide5" timing="5" v-if="$route.params.slideNum == 5" :has-mic-perm="hasMicPerm">
      <h4>Endless Commands</h4>
      <ul>
        <li>By default LipSurf has 50-ish commands.</li>
        <li>Additional commands can be installed with more plugins in the future (not yet available).</li>
        <li>A
          <strong>plugin</strong> is a collection of commands for a
          <strong>certain site</strong>
          <ul>
            <li>The commands for a plugin will usually only work for that plugin's site (eg. Reddit plugin commands only work on Reddit.com). Unless...</li>
          </ul>
        </li>
        <li>Commands marked "global" can be run anywhere!</li>
        <li>Anybody can create a plugin for a site and submit it to the LipSurf officials &nbsp;
          <i>(*cough* just me *cough*)</i> &nbsp;for review.</li>
        <li>You can control and see which plugins, commands, and homophones are enabled in the
          <a target="_blank" class="voice-cmd" :href="$parent.optionsUrl">options</a>.
        </li>
      </ul>
    </Slide>
    <Slide key="slide6" timing="6" v-if="$route.params.slideNum == 6" :has-mic-perm="hasMicPerm">
      <h4>How to Click Anything</h4>
      <ul>
        <li>Say
          <span class="voice-cmd">annotate</span> to highlight all clickable things on the page.</li>
        <li>To click any clickable thing with your voice, simply say what's in the yellow annotation on the upper left of the clickable thing!</li>
      </ul>
      <div class="note">
        <i class="icon warning-empty"></i> &nbsp;Annotations stay on every page until you say
        <span class="voice-cmd">turn off annotations</span>.
      </div>
    </Slide>
    <Slide key="slide7" timing="4" v-if="$route.params.slideNum == 7" :has-mic-perm="hasMicPerm">
      <h4>When in Doubt, Just Say HELP</h4>
      <ul>
        <li>
          <span class="voice-cmd">Help</span> shows all the available commands for the
          <i>current page</i> that you're on!</li>
        <li>Say
          <span class="voice-cmd">close help</span> to get rid of the pesky help box.</li>
      </ul>
    </Slide>
    <Slide key="slide8" timing="4" v-if="$route.params.slideNum == 8" :has-mic-perm="hasMicPerm">
      <h2 class="center">Dude, you made it to the end of the tutorial. Enjoy LipSurf!</h2>
      <h4>Final Notes</h4>
      <div>Configure on the
        <a target="_blank" class="voice-cmd" :href="$parent.optionsUrl">options</a> page:</div>
      <ul>
        <li>Automatic Shut-off Time
          <ul>
            <li>LipSurf will automatically deactivate if you don't give it a legit command for 20 minutes (by default).</li>
          </ul>
        </li>
      </ul>
    </Slide>
    </transition>
  </div>
</template>
<style scoped>
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
  animation: fade-in 1s ease-out;
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
  opacity: 1;
}

.notice.failure {
  background-color: #ffe3e0;
  border-color: #e69e9e;
  color: #8c3838;
  opacity: 1;
}

.notice.failure i,
.notice.success i {
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
  background-image: url(/assets/small_wave_pattern.svg);
  background-position: bottom;
  background-repeat-x: repeat;
  background-repeat-y: no-repeat;
  background-position-x: 0px;
  background-size: 438.5px;
  height: 100%;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100%;
  width: 100%;
  z-index: -1;
}

/* Chrome, Safari, Opera */
@-webkit-keyframes fade-in {
  0% {
    opacity: 0;
  }
  50% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

/* Standard syntax */
@keyframes fade-in {
  0% {
    opacity: 0;
  }
  50% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

.fade-in {
  animation: fade-in 1s;
}

.waves-move-left {
  animation: waves-left 1s ease-in-out;
}

.waves-move-right {
  animation: waves-right 1s ease-in-out;
}

@keyframes waves-right {
  0% {
    background-position-x: 0px;
  }
  100% {
    background-position-x: 222px;
  }
}

@keyframes waves-left {
  0% {
    background-position-x: 0px;
  }
  100% {
    background-position-x: -222px;
  }
}

.slide-left-enter-active {
  -webkit-animation: slide-in-left 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
      animation: slide-in-left 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
}

.slide-right-enter-active {
  -webkit-animation: slide-in-right 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
      animation: slide-in-right 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
}

.slide-left-leave-active {
  -webkit-animation: slide-out-left 0.5s cubic-bezier(0.550, 0.085, 0.680, 0.530) both;
          animation: slide-out-left 0.5s cubic-bezier(0.550, 0.085, 0.680, 0.530) both;
}

.slide-right-leave-active {
  -webkit-animation: slide-out-right 0.5s cubic-bezier(0.550, 0.085, 0.680, 0.530) both;
          animation: slide-out-right 0.5s cubic-bezier(0.550, 0.085, 0.680, 0.530) both;
}


@-webkit-keyframes slide-in-left {
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
@keyframes slide-in-left {
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

@-webkit-keyframes slide-in-right {
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
@keyframes slide-in-right {
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
</style>
<script lang="ts">
console.log("hi from tutorial");
import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import Slide from "./slide.vue";
import { storage } from "../../common/browser-interface";

@Component({
  components: {
    Slide
  }
})
export default class Tutorial extends Vue {
  get finalSlide() {
    return +this.$route.params.slideNum === this.totalSlides;
  }
  totalSlides = 8;
  hasMicPerm = false;
  slideLeft = true;

  activated = false;
  optionsUrl = chrome.extension.getURL("views/options.html");

  created() {
    this.checkForPermission();
    // auto activate lipsurf
    storage.local.registerOnChangeCb(changes => {
      if (changes && changes.activated && changes.activated.newValue) {
        this.activated = true;
      }
    });
    storage.local.save({ activated: true });
  }

  mounted() {
    (<Element>this.$refs.bg).classList.add('fade-in');
    setTimeout(() => {
            (<Element>this.$refs.bg).classList.remove('fade-in');
    }, 1000);
  }

  @Watch("$route")
  async routeChanged(newRoute, oldRoute) {
    let prevRt, newRt, left, oldSlideNum;
    let newSlideNum = +newRoute.params.slideNum;
    try {
      oldSlideNum = +oldRoute.params.slideNum;
    } catch (e) { }

    if (!newSlideNum || typeof newSlideNum !== "number" || newSlideNum > this.totalSlides || newSlideNum < 1 || isNaN(newSlideNum)) {
      // redirect
      this.$router.replace({path: '/slide/1'});
    }
    this.slideLeft = oldSlideNum <= newSlideNum ? true : false;

    storage.sync.save({ tutorialMode: newSlideNum });
    if (oldSlideNum) {
      // don't do the waves movement for the initial slide because
      // we fade in
      (<Element>this.$refs.bg).classList.add(`waves-move-${this.slideLeft ? "left" : "right"}`);
      setTimeout(() => {
        (<Element>this.$refs.bg).classList.remove(`waves-move-${this.slideLeft ? "left" : "right"}`);
      }, 1000);
    }
  }

  // cannot open flags with regular anchor tag
  openFlags() {
    chrome.tabs.create({
      active: true,
      url: "chrome://flags/#autoplay-policy"
    });
  }

  async checkForPermission() {
    try {
      // console.log('start check for')
      await navigator.mediaDevices.getUserMedia({ audio: true });
      // console.log('done check for')
      this.hasMicPerm = true;
    } catch (e) {
      console.error(`No mic perm ${e}`);
      this.hasMicPerm = false;
    }
    setTimeout(this.checkForPermission, 600);
  }

  exitTutorial() {
    chrome.runtime.sendMessage("closeTutorial");
    window.close();
  }
}
</script>
