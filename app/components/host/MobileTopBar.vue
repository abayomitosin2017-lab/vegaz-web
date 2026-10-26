<script setup lang="ts">
import './styles.css'
/**
 * Phone top bar of the host screens (Figma mobile frames, section
 * 10754:68066; the phone status bar is not part of the web page).
 *   back="circle"  36px round button (#F1F1F1 at 50%, blurred) with the 20px
 *                  ArrowLeft (fresh event frames: Create new event, Ticket
 *                  Details, What to expect)
 *   back="plain"   24px arrow-left, no background (edition frames: Select
 *                  Event, Create New Edition)
 * Title: Body app semibold 16/24 #0E0F11, centred. Without a title only the
 * back button shows (What to expect).
 */
withDefaults(defineProps<{ title?: string; back?: 'circle' | 'plain' }>(), { title: undefined, back: 'circle' })
defineEmits<{ back: [] }>()
</script>

<template>
  <div class="host-mbar">
    <button type="button" :class="['host-mbar__back', `host-mbar__back--${back}`]" aria-label="Back" @click="$emit('back')">
      <img v-if="back === 'circle'" src="/images/host/m-arrow-left-20.svg" alt="" width="20" height="20" />
      <img v-else src="/images/host/m-arrow-left-24.svg" alt="" width="24" height="24" />
    </button>
    <h1 v-if="title" class="host-mbar__title text-app-body-semibold">{{ title }}</h1>
  </div>
</template>

<style scoped>
.host-mbar { position: relative; display: flex; align-items: center; min-height: 36px; }
.host-mbar__back { display: inline-flex; align-items: center; justify-content: center; padding: 0; border: 0; background: none; cursor: pointer; border-radius: var(--radius-pill); }
.host-mbar__back--circle { width: 36px; height: 36px; background: rgba(241, 241, 241, 0.5); backdrop-filter: blur(2px); }
.host-mbar__back--plain { padding: var(--spacing-xs) 0; }
.host-mbar__back:focus-visible { outline: var(--focus-ring-width) solid var(--focus-ring-color); outline-offset: 2px; }
.host-mbar__title { position: absolute; left: 50%; transform: translateX(-50%); margin: 0; color: var(--color-host-row-label); white-space: nowrap; }
</style>
