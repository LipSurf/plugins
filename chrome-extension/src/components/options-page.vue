<template>
    <div class="container">
        <div style="text-align: left">
			<div class="title-bar">
				<img class="logo" src="/assets/icon-48.png"/>
				<h1>LipSurf Options</h1>
			</div>
        </div>
		<section>
            <h2>Permissions</h2>
            <p>We need permission to use the microphone. Please click "allow" when your browser prompts you for microphone permission. </p>
            <div class="perms" ref="perms">
                <div rel="mic-perm" style="display: inline-block;" class="notice" :class="{success: hasMicPerm, failure: hasMicPerm === false}">
                    <i class="icon" :class="{'check-circle': hasMicPerm, error: !hasMicPerm}"></i>&nbsp; <span>{{ hasMicPerm ? 'Has microphone permission.' : 'Needs microphone permission.' }}</span>
                        <div v-if="!hasMicPerm" class="blocked-mic-instructions">
                            <img align="middle" src="/assets/mic-no-perm.png" style="max-width: 80px"/>
                            Click the blocked media icon in the address bar and click always allow.
                        </div>
                    </div>
            </div>
            <p class="mute">Privacy: the speech recognizer is only activated for the active window when you click the LipSurf icon in your extensions toolbar.</p>
    	</section>
        <section>
            <h2>Support the Project</h2>
            <div class="notice warning">
                <i class="icon warning-empty"></i> &nbsp;&nbsp;LipSurf will always have a free version.
				</div>
			<p>You are on the free trial of <strong>LipSurf Pro</strong>. LipSurf Pro is free while in beta. The free trial will end 1 month after the 1.0 release.</p>
            <div style="text-align: center">
                <button @click="donate" id="donateBtn">Donate as an Early Bird Supporter
					<div>
					<i class="img-icon btc"></i>
					<i class="img-icon eth"></i>
					<i class="img-icon pp"></i>
					<i class="img-icon cc"></i>
					</div>
				</button>
                <p class="mute">Early supporters will be credited 2x the value of their donation when 1.0 is released.</p>
            </div>
        </section>
        <fieldset :disabled="optionsPageStore.busyDownloading">
        <section>
            <h2>General</h2>
            <div class="notice failure spread" v-if="optionsPageStore.missingLangPack && !optionsPageStore.confirmLangPack && !optionsPageStore.busyDownloading">
                <span>
                <i class="icon error"></i> &nbsp;&nbsp;You must download the language pack for this language or change the language option.
                </span>
                <button @click="downloadLangPack">Download Now</button>
            </div>
            <div v-if="optionsPageStore.busyDownloading">
                <p>Downloading language pack... </p>
                <div class="loading-bar"></div>
            </div>
            <div class="option">
                <label title="The languages shown here are the ones supported by the plugins you have installed.">
                    <i class="icon language"></i>
                    Language:
                    <select style="height: 1.5em" @change="langSave" ref="lang">
                        <option v-for="(niceLang, possLang) in possibleLanguages" :key="niceLang" :value="possLang" :selected="optionsPageStore.language == possLang">{{ niceLang }}</option>
                        <option value="add">+ Add a Language</option>
                    </select>
                </label>
            </div>
            <div class="option">
                <label>
                    <i class="icon text"></i>
                    <input type="checkbox" v-model="optionsPageStore.showLiveText" /> Show live text
                </label>
            </div>
            <div class="option">
                <label title="Check the box if you aren't using headphones and live text will be suppressed while audio is playing on the page (unless a valid command is given)">
                    <i class="icon headphones"></i>
                    <input type="checkbox" v-model="optionsPageStore.noHeadphonesMode"/> No headphones mode
                </label>
            </div>
            <div class="option">
            <label>
                <i class="icon timer-off"></i>
                Automatically shut off after &nbsp;&nbsp;<input class="right" style="width: 3.5em" v-model="optionsPageStore.inactivityAutoOffMins" type="number" min="0" max="525600" /> &nbsp;&nbsp;minutes without valid commands (set to 0 to never automatically shut off)
            </label>
            </div>
            <div class="option" style="height: 1.2rem; margin: 20px">
                <div class="btn-bar">
                    <button @click="tutorial">Open Tutorial</button>
                    <button @click="reset">Reset to Factory Defaults</button>
                </div>
            </div>
        </section>
        <section>
            <h2>Plugins</h2>
			<div style="text-align: right">
				<button @click="getMorePlugins" id="getMorePlugins"><i class="icon lib-add"></i> Get More Plugins</button>
			</div>
            <CmdGroup v-for="cmdGroup in optionsPageStore.cmdGroups" class="cmd-group" :key="cmdGroup.name" :languages="cmdGroup.languages" :expanded.sync="cmdGroup.expanded" 
                    :homophones="cmdGroup.homophones" :description="cmdGroup.description" :commands="cmdGroup.commands" :nice-name="cmdGroup.niceName" :version="cmdGroup.version" 
                    :name="cmdGroup.name" :enabled.sync="cmdGroup.enabled" :show-more.sync="cmdGroup.showMore" />
        </section>
        </fieldset>
    </div>
</template>
<style>
    :root {
        --max-homo-list-height: 80px;
        --bg-color: 245, 245, 245;
    }

    fieldset {
        border: none;
    }

    .loading-bar {
  width: 100%;
  height: 20px;
  border: 1px solid #2980b9;
  border-radius: 3px;
  background-image:
    repeating-linear-gradient(
      -45deg,
      #2980b9,
      #2980b9 11px,
      #eee 10px,
      #eee 20px /* determines size */
    );
  background-size: 28px 28px;
  animation: load .5s linear infinite;
}

@keyframes load {
  0% {
    background-position: 0 0;
  }
  100% {
    background-position: 28px 0;
  }
}

    .spread {
        display: flex;
        justify-content: space-between;
    }

    .cmd-group {
        margin: 10px 0;
        clear: both;
    }

	.btn-bar * {
		margin: 0 5px;
	}

	.title-bar {
		font-family: "Special Elite";
		text-align: center;
	}

	.title-bar * {
		display: inline-block;
	}

	.title-bar img {
		vertical-align: text-bottom;
	}

	.img-icon {
		width: 1.2em;
		height: 1.2em;
		display: inline-block;
		background-size: contain;
	}

	.img-icon.eth {
		background-image: url(chrome-extension://lnnmjmalakahagblkkcnjkoaihlfglon/vendor/eth.svg);
	}

	.img-icon.btc {
		background-image: url(chrome-extension://lnnmjmalakahagblkkcnjkoaihlfglon/vendor/btc.svg);
	}

	.img-icon.pp {
		background-image: url(chrome-extension://lnnmjmalakahagblkkcnjkoaihlfglon/vendor/pp.svg);
	}

	.img-icon.cc {
		background-image: url(chrome-extension://lnnmjmalakahagblkkcnjkoaihlfglon/vendor/cc.svg);
	}

	#donateBtn {
		color: white;
		padding: 10px;
		font-family: "Barlow";
		font-weight: bold;
		border-radius: 10px;
		border: 1px solid;
		cursor: pointer;
		background-image: -webkit-linear-gradient(top, #3498db, #2980b9);
		background-image: -moz-linear-gradient(top, #3498db, #2980b9);
		background-image: -ms-linear-gradient(top, #3498db, #2980b9);
		background-image: -o-linear-gradient(top, #3498db, #2980b9);
		background-image: linear-gradient(to bottom, #3498db, #2980b9);
		box-shadow: 1px 1px #828282;
	}

	#donateBtn div {
		filter: drop-shadow( 1px 1px 5px #ffffffcc );
		margin-top: 10px;
		font-size: 1.2em;
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

    .notice.success i {
        color: #13bd13;
        vertical-align: middle;
        font-size: 1.5em;
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

    .notice.warning {
        background-color: #fffad7;
        border-color: #e5dda1;
        color: #615f3b;
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
		text-align: center;
        margin: 10px;
    }

    input[type=checkbox],
    input[type=radio] {
        vertical-align: middle;
        position: relative;
        bottom: 1px;
    }

	.option {
		margin: 1.5em;
		font-size: 1.2em;
	}

	.option i {
		margin-right: 15px;
	}

    input[type=radio] {
        bottom: 2px;
    }

    .container {
        max-width: 900px;
        margin: 0px auto;
        text-align: left;
    }

    section {
        margin: 50px auto;
    }

	section:nth-of-type(1) {
		margin: 20px auto;
	}

</style>
<script lang="ts">
import { Vue, Component, Prop, Watch } from "vue-property-decorator";
import CmdGroup from "./cmd-group.vue";
import { pick, omit, identity, reduce, isEqual }  from "lodash";
import { instanceOfDynamicMatch, } from "../common/util";
import { Store, StoreSynced, } from "../background/store";
import { IOptions, IGeneralPreferences, GENERAL_PREFERENCES, SHARED_LOCAL_DATA, } from "../common/store-lib";
import { LANG_CODE_TO_NICE } from "../common/constants";
import * as LANGS from "../background/recognizer/langs";

const pluginOptionsPageStoreProps = {
    ... GENERAL_PREFERENCES,
    ... SHARED_LOCAL_DATA,
    cmdGroups: <IPluginPref[]>[],
}

// what's shown on the options page
type IPluginOptionsPageStore = typeof pluginOptionsPageStoreProps;

interface IPluginPref {
    expanded: boolean;
    enabled: boolean;
    showMore: boolean;
    readonly id: string;
    readonly niceName: string;
    readonly version: string;
    readonly description?: string;
    readonly languages: LanguageCode[];
    commands: ICommandPref[];
    homophones?: IToggleableHomophone[];
}

interface ICommandPref {
    enabled: boolean;
    name: string;
    global?: boolean;
    match: string | string[];
    // special description for dynamic match functions
    dynamicMatch: boolean;
    description?: string;
}

@Component({
    components: {
        CmdGroup,
    }
})
export default class OptionsPage extends Vue {
    optionsPageStore: IPluginOptionsPageStore = <IPluginOptionsPageStore>{};
    hasMicPerm = true;
    possibleLanguages = [
            "en-AU",
            "en-IN",
            "en-NZ",
            "en-ZA",
            "en-GB",
            "en-US",
            "ja",
        ].reduce((memo, lang) => {memo[lang] = LANG_CODE_TO_NICE[lang]; return memo;}, {});
    store: Store;
    pluginSelectedLanguage: LanguageCode;
    LANG_CODE_TO_NICE = LANG_CODE_TO_NICE;

    created() {
        this.store = new Store();
        this.store.getOptions().then(options => {
            this.storeUpdated(options);
        });
        this.store.subscribe(newOptions => {
            this.storeUpdated(newOptions);
        });
    }


    mounted() {
        // the thing might already be collapsed
        // set the max height on each accordion item, then shrink the ones
        // that need to be based on user settings
        /*$('.collapsable').each(function(i, ele) {*/
            /*let $ele = $(ele);*/
            /*// TODO: this doesn't work anymore because when the page is loaded,*/
            /*// $ele.css('max-height', $ele.parent().find('.collapsable').height());*/
            /*$ele.css('max-height', 3000);*/
        /*});*/

        this.checkForPermission.apply(this);

        setInterval(function() {
            this.checkForPermission.apply(this);
        }.bind(this), 1500);
    }

    async storeUpdated(newOptions: IOptions) {
        // check if we need to download a language pack (checking in storeUpdated ensures that this will still work if the language setting
        // is changed on another instance and synced over)
        if (newOptions.missingLangPack && (newOptions.confirmLangPack === null || newOptions.confirmLangPack === undefined)) {
            let isConfirmed = confirm(`You need to download a ~5mb language pack for ${LANG_CODE_TO_NICE[newOptions.language]}. Would you like to continue?`);
            this.store.save({confirmLangPack: isConfirmed});
        }

        // workaround to make sure changes are triggered
        this.optionsPageStore = Object.assign({}, this.optionsPageStore,  {
            ... pick(newOptions, Object.keys(pluginOptionsPageStoreProps)),
            cmdGroups: newOptions.plugins.map(plugin => {
                // default to en if the plugin doesn't support a language
                let localized: ILocalizedPluginData & { homophones?: IToggleableHomophone[]; };
                for (let lang of [newOptions.language, <LanguageCode>newOptions.language.substr(0, 2), <LanguageCode>"en"]) {
                    localized = plugin.localized[lang];
                    if (localized) {
                        this.pluginSelectedLanguage = lang;
                        break;
                    }
                }
                return {
                    commands: Object.keys(plugin.commands).map(cmdName => {
                        let matcher = localized.matchers[cmdName];
                        if (matcher) {
                            return {
                                dynamicMatch: instanceOfDynamicMatch(matcher.match),
                                match: instanceOfDynamicMatch(matcher.match) ? matcher.match.description : matcher.match,
                                global_: plugin.commands[cmdName].global,
                                ... pick(plugin.commands[cmdName], 'enabled'),
                                ... pick(matcher, 'name', 'description'),
                            }
                        }
                    }).filter(identity), // filter out the undefined (no localized version)
                    languages: Object.keys(plugin.localized),
                    ... pick(localized, 'niceName', 'description', 'homophones', ),
                    ... pick(plugin, 'version', 'expanded', 'enabled', 'showMore', 'id', ),
                };
            }),
        });
    }

    // old and new will always be the same with objects/arrays when watching
    @Watch('optionsPageStore', {deep: true})
    save(updatedProps: Partial<IOptions>, oldProps: Partial<IOptions>) {
        console.log('watch changes');
        this.store.save(<NestedPartial<IOptions>>{
            ...omit(this.optionsPageStore, 'cmdGroups'),
            plugins: this.optionsPageStore.cmdGroups.map(cmdGroup => ({
                ...pick(cmdGroup, 'id', 'expanded', 'enabled', 'showMore'),
                localized: {[this.pluginSelectedLanguage]: {homophones: cmdGroup.homophones}},
                commands: cmdGroup.commands.reduce((memo, cmd) =>
                    Object.assign(memo, {[cmd.name]: pick(cmd, 'enabled')})
                , {}),
            })),
        });
    }

    reset() {
        if (confirm("This will erase any settings you have configured and load default settings! Press OK if you're sure you want to continue.")) {
            this.store.resetPreferences();
        }
    }

    getMorePlugins() {
        alert("This feature is not available yet.");
        /*if (confirm("This feature is not yet available. Click \"OK\" if you're a programmer and want to write a plugin.")) {*/
            /*window.open('https://github.com/mikob/lipsurf', '_blank');*/
        /*}*/
    }

    downloadLangPack() {
        this.optionsPageStore.confirmLangPack = true;
    }

    donate() {
        window.open('https://www.lipsurf.com/donate/', '_blank');
    }

    tutorial() {
        // todo: call the main.ts openTutorial fn
        window.open("./tutorial.html");
    }

    langSave(e) {
        if ((<HTMLInputElement>this.$refs.lang).value == "add") {
            // add a language
            window.open("https://github.com/mikob/LipSurf#adding-support-for-more-languages-i18n", "_blank");
            (<HTMLInputElement>this.$refs.lang).value = this.optionsPageStore.language;
        } else {
            this.optionsPageStore.language = <LanguageCode>(<HTMLInputElement>this.$refs.lang).value;
        }
    }

    checkForPermission() {
        navigator.mediaDevices.getUserMedia({
            audio: true,
        }).then((stream) => {
            if (!this.hasMicPerm) {
                this.hasMicPerm = true;
            }
        }, () => {
            // Aw. No permission (or no microphone available).
            if (this.hasMicPerm) {
                this.hasMicPerm = false;
            }
        });
    }

}
</script>
