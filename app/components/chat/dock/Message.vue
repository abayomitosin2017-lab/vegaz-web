<script setup lang="ts">
import './styles.css'
import type { ChatPostMessage } from '~/types/chat'
import { formatClock } from '~/utils/chatFormat'
/**
 * A message in the dock conversation (Figma "Chat dock / Message",
 * 10862:22192): the Chat page look, scaled for a 360 window.
 * Bubbles up to 240 wide, radius 12, 8 / 12 padding, text 14/20, time
 * 10/12 on the right. Others: white, 24px photo, sender 12/16 semibold
 * Primary. You: Primary, white text, time + double tick.
 * Photos: up to 4 shown in a 2-column grid (radius 8), "+N" on the last.
 */
const props = defineProps<{ message: ChatPostMessage }>()
const photos = computed(() => props.message.photos ?? [])
const shown = computed(() => photos.value.slice(0, 4))
const more = computed(() => photos.value.length - shown.value.length)
</script>

<template>
  <div :class="['dock-msg', message.mine ? 'dock-msg--me' : 'dock-msg--them']">
    <UiAvatar v-if="!message.mine" class="dock-msg__avatar" :name="message.sender.name" :seed="message.sender.username" :src="message.sender.avatarUrl" :size="24" />
    <div class="dock-msg__bubble">
      <p v-if="!message.mine" class="dock-msg__sender">{{ message.sender.name }}</p>
      <p v-if="message.replyTo" class="dock-msg__quote">@{{ message.replyTo.senderUsername }}: {{ message.replyTo.text }}</p>
      <div v-if="shown.length" :class="['dock-msg__photos', { 'dock-msg__photos--one': shown.length === 1 }]">
        <span v-for="(url, i) in shown" :key="url + i" class="dock-msg__photo">
          <img :src="url" alt="Photo" loading="lazy" />
          <span v-if="more && i === shown.length - 1" class="dock-msg__more">+{{ more }}</span>
        </span>
      </div>
      <p v-if="message.text" class="dock-msg__text">{{ message.text }}</p>
      <p class="dock-msg__meta">
        <time :datetime="message.createdAt">{{ formatClock(message.createdAt) }}</time>
        <img v-if="message.mine" src="/images/chat/icon-tick-double-14.svg" alt="Sent" width="12" height="12" />
      </p>
    </div>
  </div>
</template>

<style scoped>
.dock-msg { display: flex; align-items: flex-end; gap: var(--spacing-xs); max-width: 100%; }
.dock-msg--me { justify-content: flex-end; }
.dock-msg__avatar { flex: none; }
.dock-msg__bubble {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-micro);
  max-width: 240px;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-md);
  background: var(--color-background-primary);
  font-family: var(--font-family-base);
}
.dock-msg--me .dock-msg__bubble { background: var(--color-action-primary); }
.dock-msg__sender { margin: 0; color: var(--color-action-primary); font-weight: var(--font-weight-semibold); font-size: var(--text-xsmall-regular-size); line-height: var(--text-xsmall-regular-line); }
.dock-msg__quote { margin: 0; padding-left: var(--spacing-xs); border-left: 2px solid var(--color-border-default); color: var(--color-text-muted); font-size: var(--text-xsmall-regular-size); line-height: var(--text-xsmall-regular-line); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dock-msg--me .dock-msg__quote { color: var(--grey-5); }
.dock-msg__text { margin: 0; color: var(--color-text-strong); font-size: var(--text-small-regular-size); line-height: var(--text-small-regular-line); white-space: pre-wrap; overflow-wrap: anywhere; }
.dock-msg--me .dock-msg__text { color: var(--base-white); }
.dock-msg__meta { display: flex; align-items: center; justify-content: flex-end; gap: var(--spacing-xxs); margin: 0; color: var(--color-text-muted); font-size: var(--text-sub-regular-size); line-height: var(--text-sub-regular-line); }
.dock-msg--me .dock-msg__meta { color: var(--grey-5); }
.dock-msg__photos { display: grid; grid-template-columns: 1fr 1fr; gap: 2px; width: 216px; overflow: hidden; border-radius: var(--radius-sm); }
.dock-msg__photos--one { grid-template-columns: 1fr; }
.dock-msg__photo { position: relative; aspect-ratio: 1; background: var(--color-background-secondary); }
.dock-msg__photo img { display: block; width: 100%; height: 100%; object-fit: cover; }
.dock-msg__more { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; background: rgba(0, 0, 0, 0.5); color: var(--base-white); font-weight: var(--font-weight-semibold); font-size: var(--text-body-semibold-size); }
</style>
