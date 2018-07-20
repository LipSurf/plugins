<template>
    <label class="tag"><input type="checkbox" ref="input" :checked="enabled" @change="save"> {{ source }} ➪ {{ destination }}</label>
</template>
<script lang="ts">
	import { Vue, Component, Prop } from "vue-property-decorator";

	@Component
	export default class Homophone extends Vue {
		@Prop()
		enabled!: boolean;

		@Prop()
		source!: string;

		@Prop()
		destination!: string;

		save(e) {
			e.item.enabled = (<HTMLInputElement>this.$refs.input).checked;
			this.$emit('save');
		}
	}
</script>
