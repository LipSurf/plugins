<template>
    <label class="tag"><input type="checkbox" :checked="enabled" @change="$emit('update:enabled', $event.target.checked)"> {{ source }} ➪ {{ destination }}</label>
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
	}
</script>
