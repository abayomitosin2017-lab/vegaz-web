<script setup lang="ts">
import './styles.css'
import type { ChatSummary } from '~/types/chat'
import { formatCount, formatListTime } from '~/utils/chatFormat'
/**
 * One chat in the dock list (Figma "Chat dock / Row", 10862:22176).
 * 72 tall, 12 / 16 padding, 12 apart. Event photo 48 (radius 8); event name
 * 14/18 semibold Grey_1 and the time 12/16 on the right; "Name: message"
 * 14/20 under it. Unread: time Primary semibold, message Grey_1, red count.
 * Read: Grey_3. Selected (open in the conversation window): Grey_6.
 */
const props = defineProps<{ chat: ChatSummary; selected?: boolean }>()
const emit = defineEmits<{ select: [id: string] }>()
const unread = computed(() => props.chat.unreadCount > 0)
</script>

<template>
  <button
    type="button"
    :class="['dock-row dock-focus', { 'dock-row--unread': unread, 'dock-row--selected': selected }]"
    :aria-current="selected ? 'true' : undefined"
    @click="emit('select', chat.id)"
  >
    <span class="dock-row__pic"><img v-if="chat.imageUrl" :src="chat.imageUrl" alt="" width="48" height="48" loading="lazy" /></span>
    <span class="dock-row__text">
      <span class="dock-row__top">
        <span class="dock-title dock-title--14 dock-ellipsis">{{ chat.title }}</span>
        <span class="dock-row__time">{{ formatListTime(chat.lastAt) }}</span>
      </span>
      <span class="dock-row__bottom">
        <span class="dock-row__msg dock-ellipsis">{{ chat.lastMessage.senderFirstName }}: {{ chat.lastMessage.text }}</span>
        <span v-if="unread" class="dock-count"><span class="dock-visually-hidden">Unread: </span>{{ formatCount(chat.unreadCount) }}</span>
      </span>
    </span>
  </button>
</template>

<style scoped>
.dock-row {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  width: 100%;
  min-height: 72px;
  padding: var(--spacing-sm) var(--spacing-md);
  border: 0;
  background: var(--color-background-primary);
  font-family: var(--font-family-base);
  text-align: left;
  cursor: pointer;
}
@media (hover: hover) { .dock-row:hover { background: var(--color-background-secondary); } }
.dock-row--selected { background: var(--color-background-secondary); }
.dock-row__pic { flex: none; width: 48px; height: 48px; overflow: hidden; border-radius: var(--radius-sm); background: var(--color-background-secondary); }
.dock-row__pic img { display: block; width: 100%; height: 100%; object-fit: cover; }
.dock-row__text { flex: 1 1 0; min-width: 0; display: flex; flex-direction: column; gap: var(--spacing-xxs); }
.dock-row__top, .dock-row__bottom { display: flex; align-items: center; gap: var(--spacing-xs); min-width: 0; }
.dock-row__top .dock-title { flex: 1 1 auto; min-width: 0; }
.dock-row__time { flex: none; color: var(--color-text-muted); font-size: var(--text-xsmall-regular-size); line-height: var(--text-xsmall-regular-line); }
.dock-row--unread .dock-row__time { color: var(--color-action-primary); font-weight: var(--font-weight-semibold); }
.dock-row__msg { flex: 1 1 auto; min-width: 0; color: var(--color-text-muted); font-size: var(--text-small-regular-size); line-height: var(--text-small-regular-line); }
.dock-row--unread .dock-row__msg { color: var(--color-text-strong); }
</style>
