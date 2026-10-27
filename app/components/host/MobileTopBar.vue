<script setup lang="ts">
import './styles.css'
/**
 * Phone top bar of the host screens (Figma mobile frames, section
 * 10754:68066; the phone status bar is not part of the web page).
 * Back: UiBackButton, the same round button on every screen (decision
 * 27 Oct; the edition frames' plain arrow now uses it too).
 * Title: Body app semibold 16/24 #0E0F11, centred. Without a title only the
 * back button shows (What to expect).
 */
defineProps<{ title?: string }>()
defineEmits<{ back: [] }>()
</script>

<template>
  <div class="host-mbar">
    <UiBackButton @click="$emit('back')" />
    <h1 v-if="title" class="host-mbar__title text-app-body-semibold">{{ title }}</h1>
  </div>
</template>

<style scoped>
.host-mbar { position: relative; display: flex; align-items: center; min-height: 36px; }
.host-mbar__title { position: absolute; left: 50%; transform: translateX(-50%); margin: 0; color: var(--color-host-row-label); white-space: nowrap; }
</style>
