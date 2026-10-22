<script setup lang="ts">
/**
 * EventHostTag: "Hosted by <name>" pill (Figma "host profile tag").
 * Grey_6 pill with a 3px white edge and a soft shadow, 6/8 padding, 40px
 * photo, 12px gap; "Hosted by" Web Small regular Grey_3 over the name
 * (Web Small semibold). Opens the host's profile (decision 22 Oct).
 */
import type { ChatPerson } from '~/types/chat'

defineProps<{ host: ChatPerson }>()
const emit = defineEmits<{ open: [] }>()
</script>

<template>
  <button type="button" class="event-host" :aria-label="`Hosted by ${host.name}. View profile`" @click="emit('open')">
    <UiAvatar :name="host.name" :seed="host.username" :src="host.avatarUrl" :size="40" />
    <span class="event-host__text">
      <span class="event-host__label text-small-regular">Hosted by</span>
      <span class="event-host__name text-small-semibold">{{ host.name }}</span>
    </span>
  </button>
</template>

<style scoped>
.event-host {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  width: 100%;
  padding: 3px 5px; /* Figma 6 / 8 inside a 3px white edge */
  border: 3px solid var(--color-background-primary);
  border-radius: var(--radius-pill);
  background: var(--color-background-secondary);
  box-shadow: var(--shadow-host-tag);
  font: inherit;
  text-align: left;
  cursor: pointer;
}
.event-host:focus-visible { outline: var(--focus-ring-width) solid var(--focus-ring-color); outline-offset: var(--focus-ring-offset); }
.event-host__text { display: flex; flex-direction: column; gap: var(--spacing-xxs); min-width: 0; }
.event-host__label { color: var(--color-text-muted); }
.event-host__name { color: var(--color-text-primary); }
</style>
