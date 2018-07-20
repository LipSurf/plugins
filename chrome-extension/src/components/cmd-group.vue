<template>
    <div class="collapser-shell" :class="{ collapsed: !expanded, enabled: enabled }">
        <a class="collapser" :title="`Click to ${expanded ? 'expand' : 'collapse'}`" @click="toggleExpanded">
            <div class="label">{{ niceName }} <span class="version">v{{ version }}</span> <span class="right-controls"><label @click.capture.stop.prevent="null"><input type="checkbox" v-model="enabled"> Enabled</label></span>
                <div class="desc">{{ description }}</div>
            </div>
        </a>
        <div class="collapsable">
            <div class="collapsable-inner">
                <div style="display: table; border-spacing: 0 0.6em;">
                    <div class="languages" style="display: table-row">
                        <div class="label" style="display: table-cell">
                            <strong>Supported Languages: </strong>
                        </div>
                        <ul class="language-list" style="display: table-cell">
                            <li class="tag" v-for="suppLang in languages" :key="suppLang">{{ LANG_CODE_TO_NICE[suppLang] }}</li>
                        </ul>
                    </div>
                    <div class="homophones" v-if="homophones.length > 0" style="display:table-row">
                        <div class="label" style="display: table-cell">
                            <strong>Homophones/synonyms: </strong>
                        </div>
                        <div class="tag-list-cont" style="display: table-cell">
                            <a class="show-more" @click="toggleShowMore">{{ showMore ? 'Show Less' : 'Show More'}}</a>
                            <div class="tag-list" :class="{shrunk: !showMore}">
                                <Homophone v-for="homo in homophones" :key="homo.source" :source="homo.source" :destination="homo.destination" :enabled="homo.enabled" />
                            </div>
                            <div class="fade" :class="{invisible: showMore}">
                            </div>
                        </div>
                    </div>
                </div>
                <table style="width: 100%">
                    <thead>
                        <th>Enabled</th>
                        <th>Name</th>
                        <th>Description</th>
                        <th>Command Words</th>
                    </thead>
                    <tbody>
                        <Cmd v-for="command in commands" :key="command.name" :dynamic-match="command.dynamicMatch" :global="command.global" :enabled="command.enabled" :name="command.name" :match="command.match" :description="command.description"  />
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>
<style>
    table {
        margin-top: 15px;
    }

    tr {
        vertical-align: top;
    }

    tbody,
    thead {
        text-align: left;
    }

    td {
        border-top: 1px solid #ddd;
        padding: .7rem;
    }

    th {
        padding: 0 .7rem;
    }

    .homophones .label {
        width: 20%;
    }

    .homophones {
        margin-bottom: 30px;
        display: block;
    }

    .homophones .tag-list {
		position: relative;
		overflow: hidden;
        text-align: left;
		border-bottom: 1px solid #dddddd;
		max-height: 600px;
		transition: max-height .5s ease;
		padding-bottom: 10px;
    }

	.homophones .tag-list.shrunk {
		max-height: var(--max-homo-list-height);
	}

	.tag-list-cont {
		position: relative;
    }
    
    .language-list {
        padding: 0;
    }

	.show-more {
		text-shadow: white 1px 1px;
		text-decoration: none;
		color: #7e7e7e;
		position: absolute;
        transform: translateX(-50%);
		left: 50%;
		z-index: 10;
		bottom: -10px;
		background-color: rgb(var(--bg-color));
	    padding: 0 10px;
        cursor: pointer;
	}

    .version {
        margin-left: 10px;
        color: #a4a4a4;
    }

    .enabled .collapser {
        color: #222;
    }

    .enabled .desc {
        color: #868686;
    }

    .enabled .version {
        color: #868686;
    }

    .right {
        text-align: right;
    }

    .right-controls {
        float: right;
        margin-right: 20px;
    }

    .collapser {
        /*font-size: 1.05rem;*/
        cursor: pointer;
        width: 100%;
        line-height: 1.2rem;
        text-align: left;
        background-color: #eee;
        color: #888;
        border-left: 1px solid #888;
        padding: 3px 5px;
        text-decoration: none;
        display: block;
    }

    .collapser:before {
        content: '-';
        position: absolute;
    }

    .collapsed .collapser:before {
        content: '+';
    }

    .collapser-shell {}

    .collapsable {
        transition: max-height 0.35s ease-out;
        display: block;
        background-color: rgb(var(--bg-color));
        overflow: hidden;
		/* TODO: set dynamically */
		max-height: 3000px;
    }

    .collapsable-inner {
        padding: 10px 20px;
    }

    .collapsed .collapsable {
        max-height: 0 !important;
    }

    td.enable {
        text-align: center;
    }

    .collapser .label {
        margin-left: 15px;
    }

    .desc {
        font-style: italic;
        color: #a4a4a4;
        text-align: left;
    }

    .cmd .desc {
        font-style: normal;
    }

    .tag { background-color: #e6e6e6;
        border-radius: 3px;
        line-height: 1.5em;
        margin: 2px;
        display: inline-block;
        padding: 3px 6px;
        white-space: nowrap;
    }
</style>
<script lang="ts">
    import { Vue, Component, Prop } from "vue-property-decorator";
    import { LANG_CODE_TO_NICE } from "../common/constants";
    import Cmd from "./cmd.vue";
    import Homophone from "./homophone.vue";

    @Component({
        components: {
            Cmd,
            Homophone,
        }
    })
	export default class CmdGroup extends Vue {
        LANG_CODE_TO_NICE = LANG_CODE_TO_NICE;

		@Prop()
		commands!: any;

		@Prop()
		expanded!: boolean;

		@Prop()
		enabled!: boolean;

		@Prop()
		niceName!: string;

		@Prop()
		version!: string;

		@Prop()
        description!: string;

        @Prop()
        showMore!: boolean;

        // the languages that this plugin supports
        @Prop()
        languages!: LanguageCode[];
        
        @Prop()
        homophones!: IToggleableHomophone[];

		save() {
			this.$emit('save');
		}

		toggleGroupEnabled(e) {
			e.item.enabled = !e.item.enabled;
			this.save();
		}

		toggleExpanded(e) {
            this.expanded = !this.expanded;
            this.save();
		}

		toggleShowMore(e) {
            this.showMore = !this.showMore;
			this.save();
		}
	}
</script>
