<script setup lang="ts">
import './styles.css'
/**
 * Chat dock bar (Figma "Chat dock / Bar", 10862:22149). 360 × 56, white,
 * radius 12 on top, Grey_5 line, Dp2 shadow, 16 left / 8 right padding,
 * 12 apart. Your photo (32), "Messages" (16/20 semibold), red unread count.
 * Right: open the full Chat page, and expand / minimize (chevron).
 * `open`: used as the header of the expanded list (no shadow or line, the
 * panel has them; chevron points down).
 */
const props = defineProps<{ unread: number; open?: boolean; panelId?: string }>()
const emit = defineEmits<{ toggle: []; full: [] }>()
const { user } = useSession()
const label = computed(() => `Messages${props.unread ? `, ${props.unread} unread` : ''}`)
</script>

<template>
  <div :class="['dock-bar', { 'dock-bar--open': open }]">
    <button
      type="button"
      class="dock-bar__main dock-focus"
      :aria-expanded="open ? 'true' : 'false'"
      :aria-controls="panelId"
      :aria-label="`${label}. ${open ? 'Minimize' : 'Open'} chats`"
      @click="emit('toggle')"
    >
      <UiAvatar v-if="user" :name="user.firstName" :seed="user.username" :src="user.avatarUrl" :size="32" />
      <span class="dock-title dock-title--16">Messages</span>
      <span v-if="unread" class="dock-count" aria-hidden="true">{{ unread > 99 ? '99+' : unread }}</span>
    </button>
    <button type="button" class="dock-icon-btn" aria-label="Open the Chat page" @click="emit('full')">
      <img src="/images/dock/icon-open-full-24.svg" alt="" width="20" height="20" />
    </button>
    <button type="button" class="dock-icon-btn" :aria-label="open ? 'Minimize chats' : 'Open chats'" :aria-expanded="open ? 'true' : 'false'" @click="emit('toggle')">
      <img :src="open ? '/images/dock/icon-chevron-down-24.svg' : '/images/dock/icon-chevron-up-24.svg'" alt="" width="20" height="20" />
    </button>
  </div>
</template>

<style scoped>
.dock-bar {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: var(--spacing-xxs);
  width: 360px;
  height: 56px;
  padding: 0 var(--spacing-xs) 0 var(--spacing-md);
  border: var(--border-width-default) solid var(--color-border-default);
  border-bottom: 0;
  border-radius: var(--radius-md) var(--radius-md) 0 0;
  background: var(--color-background-primary);
  box-shadow: var(--shadow-dp2);
}
.dock-bar--open { width: 100%; border: 0; border-radius: 0; box-shadow: none; flex: none; }
.dock-bar__main {
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  align-self: stretch;
  padding: 0;
  border: 0;
  background: none;
  cursor: pointer;
  text-align: left;
  border-radius: var(--radius-sm);
}
</style>
