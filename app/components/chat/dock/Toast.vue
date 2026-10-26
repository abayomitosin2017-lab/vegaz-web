<script setup lang="ts">
import './styles.css'
import type { DockToast } from '~/composables/useChatDock'
/**
 * New-message preview above the minimized bar (Figma "Chat dock / New
 * message toast", 10862:22193). 360 wide, white, radius 12, Grey_5 line,
 * Dp2, 12 / 12 / 12 / 16 padding. Sender photo 40; "Sender · Event" 12/16
 * semibold Primary; two lines of the message 14/20; "Reply" pill (32 tall,
 * Grey_6, 14/18 medium); × to dismiss.
 * Stays 5 seconds, paused while hovered or focused. Never opens the dock by
 * itself; Reply opens that chat with the message box focused.
 */
const props = defineProps<{ toast: DockToast }>()
const emit = defineEmits<{ reply: [chatId: string]; dismiss: [] }>()
const VISIBLE_MS = 5000
let timer: ReturnType<typeof setTimeout> | undefined
let paused = false
function start() { stop(); if (!paused) timer = setTimeout(() => emit('dismiss'), VISIBLE_MS) }
function stop() { if (timer) clearTimeout(timer); timer = undefined }
function pause() { paused = true; stop() }
function resume() { paused = false; start() }
watch(() => props.toast, start, { immediate: true })
onBeforeUnmount(stop)
</script>

<template>
  <div class="dock-toast" role="status" aria-live="polite" @mouseenter="pause" @mouseleave="resume" @focusin="pause" @focusout="resume">
    <UiAvatar :name="toast.senderName" :seed="toast.senderSeed" :src="toast.senderAvatar" :size="40" />
    <div class="dock-toast__text">
      <p class="dock-toast__who dock-ellipsis">{{ toast.senderName }} · {{ toast.eventTitle }}</p>
      <p class="dock-toast__msg">{{ toast.text }}</p>
      <button type="button" class="dock-toast__reply" @click="emit('reply', toast.chatId)">Reply</button>
    </div>
    <button type="button" class="dock-icon-btn" aria-label="Dismiss" @click="emit('dismiss')"><img class="dock-icon-16" src="/images/host/icon-close-16.svg" alt="" width="16" height="16" /></button>
  </div>
</template>

<style scoped>
.dock-toast {
  box-sizing: border-box;
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-sm);
  width: 360px;
  padding: var(--spacing-sm) var(--spacing-sm) var(--spacing-sm) var(--spacing-md);
  border: var(--border-width-default) solid var(--color-border-default);
  border-radius: var(--radius-md);
  background: var(--color-background-primary);
  box-shadow: var(--shadow-dp2);
  font-family: var(--font-family-base);
}
.dock-toast__text { flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; align-items: flex-start; gap: var(--spacing-xxs); }
.dock-toast__who { max-width: 100%; margin: 0; color: var(--color-action-primary); font-weight: var(--font-weight-semibold); font-size: var(--text-xsmall-regular-size); line-height: var(--text-xsmall-regular-line); }
.dock-toast__msg { margin: 0; color: var(--color-text-strong); font-size: var(--text-small-regular-size); line-height: var(--text-small-regular-line); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.dock-toast__reply { margin-top: var(--spacing-xxs); height: 32px; padding: 0 var(--spacing-sm); border: 0; border-radius: var(--radius-pill); background: var(--color-background-secondary); color: var(--color-text-strong); font-family: var(--font-family-base); font-weight: var(--text-small-semibold-weight); font-size: var(--text-small-semibold-size); line-height: var(--text-small-semibold-line); cursor: pointer; }
@media (hover: hover) { .dock-toast__reply:hover { background: var(--color-border-default); } }
.dock-toast__reply:focus-visible { outline: var(--focus-ring-width) solid var(--focus-ring-color); outline-offset: 2px; }
</style>
