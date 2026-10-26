<script setup lang="ts">
import './styles.css'
/**
 * Select Category (Figma frame 05, "Host / Category chip" 10772:17680).
 * Chips: Grey_6, radius 8, 10 / 16 padding, Body regular 16/24; wrapping,
 * 16 apart. One category only (decision 23 Oct); the chosen chip is black
 * with white text. "Done" saves.
 */
const props = defineProps<{ open: boolean; value: string | null; options: string[] }>()
const emit = defineEmits<{ close: []; save: [value: string] }>()

const picked = ref<string | null>(null)
watch(() => props.open, o => { if (o) picked.value = props.value })
</script>

<template>
  <HostDialog :open="open" title="Select Category" copy="What category does your event fall into?" @close="emit('close')">
    <div class="host-cats" role="radiogroup" aria-label="Category">
      <button
        v-for="c in options"
        :key="c"
        type="button"
        role="radio"
        :aria-checked="picked === c"
        :class="['host-cats__chip text-app-body-regular', { 'host-cats__chip--on': picked === c }]"
        @click="picked = c"
      >{{ c }}</button>
    </div>
    <UiButton :class="{ 'host-inactive': !picked }" :color="picked ? 'primary' : 'secondary'" :aria-disabled="!picked ? 'true' : undefined" @click="picked && emit('save', picked)">Done</UiButton>
  </HostDialog>
</template>

<style scoped>
.host-cats { display: flex; flex-wrap: wrap; gap: var(--spacing-md); }
.host-cats__chip {
  padding: 10px var(--spacing-md);
  border: 0;
  border-radius: var(--radius-sm);
  background: var(--color-background-secondary);
  color: var(--color-text-primary);
  font-family: var(--font-family-base);
  cursor: pointer;
  transition: background-color 150ms ease, color 150ms ease;
}
.host-cats__chip:hover { background: var(--color-border-default); }
.host-cats__chip--on, .host-cats__chip--on:hover { background: var(--base-black); color: var(--base-white); }
.host-cats__chip:focus-visible { outline: var(--focus-ring-width) solid var(--focus-ring-color); outline-offset: var(--focus-ring-offset); }
</style>
