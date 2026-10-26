<script setup lang="ts">
import './styles.css'
import type { Participants } from '~/types/hosting'
/**
 * Participants (Figma frame 06): radios "All Gender", "Female Only", "Male
 * Only" (24px radio, Small app semibold #303237, 16 apart, 8px above and
 * below the group), then "Select".
 * OPEN ITEM (business): what "Female Only" enforces (ticket checks?) is not
 * defined; the choice is only stored here.
 */
const props = defineProps<{ open: boolean; value: Participants }>()
const emit = defineEmits<{ close: []; save: [value: Participants] }>()

const options: { value: Participants; label: string }[] = [
  { value: 'all', label: 'All Gender' },
  { value: 'female', label: 'Female Only' },
  { value: 'male', label: 'Male Only' },
]
const picked = ref<Participants>('all')
watch(() => props.open, o => { if (o) picked.value = props.value })
</script>

<template>
  <HostDialog :open="open" title="Participants" copy="Set up your preferred participants gender" @close="emit('close')">
    <div class="host-parts" role="radiogroup" aria-label="Participants">
      <label v-for="o in options" :key="o.value" class="host-parts__opt">
        <input v-model="picked" class="host-visually-hidden" type="radio" name="participants" :value="o.value" />
        <img :src="picked === o.value ? '/images/auth/radio-on.svg' : '/images/auth/radio-off.svg'" alt="" width="24" height="24" />
        <span class="text-app-small-semibold">{{ o.label }}</span>
      </label>
    </div>
    <UiButton @click="emit('save', picked)">Select</UiButton>
  </HostDialog>
</template>

<style scoped>
.host-parts { display: flex; flex-direction: column; gap: var(--spacing-md); padding: var(--spacing-xs) 0; }
.host-parts__opt { display: inline-flex; align-items: center; gap: var(--spacing-xs); width: fit-content; color: var(--color-host-note); cursor: pointer; border-radius: var(--radius-xs); }
.host-parts__opt:has(input:focus-visible) { outline: var(--focus-ring-width) solid var(--focus-ring-color); outline-offset: 4px; }
</style>
