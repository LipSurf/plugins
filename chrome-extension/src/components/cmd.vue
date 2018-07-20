<template>
	<tr class="cmd">
		<td class="enable">
			<input type="checkbox" ref="input" @change="save" :checked="enabled">
		</td>
		<td class="name">{{ name }} <span title="Global commands work on any page." class="global-tag" v-if="global">global</span></td>
		<td class="desc">{{ description }}</td>
		<td v-if="typeof match=='object'"><span class="tag" v-for="name in match" :key="name">{{ name }}</span></td>
		<td v-if="typeof match=='string' && !dynamicMatch"><span class="tag">{{ match }}</span></td>
		<td v-if="typeof match=='string' && dynamicMatch"><span class="dynamic-match-str">{{ match }}</span></td>
	</tr>
</template>
<style scoped>
	.dynamic-match-str {
		color: #555;
		font-style: italic;
	}

	.global-tag {
		background-color: #a1a1a1;
		padding: 0px 6px;
		text-shadow: #808080cf 1px 1px;
		color: white;
		font-weight: bold;
		border: 1px #b2b2b2 solid;
		border-radius: 5px;
	}
</style>
<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";

@Component
export default class Cmd extends Vue {
	@Prop()
	global!: boolean;

	@Prop()
	enabled!: boolean;

	@Prop()
	name!: string;

	@Prop()
	description!: string;

	@Prop()
	match!: object;

	@Prop()
	dynamicMatch: boolean;

	save(e) {
		// binding
		e.item.enabled = !e.item.enabled;
		this.$emit('save');
	}
}

</script>
