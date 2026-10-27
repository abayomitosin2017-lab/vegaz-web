<script setup lang="ts">
import './styles.css'
import type { ChatMessage, ChatPerson, ChatPostMessage, ChatSummary } from '~/types/chat'
import { getMessages, sendMessage } from '~/services/chat'
import { formatDayLabel, isSameDay } from '~/utils/chatFormat'
/**
 * Dock conversation window (Figma screens 4, 5 and tablet 8). 360 × 520,
 * radius 12 on top, Grey_5 line, Dp2.
 * Header 56 (16 left / 8 right, 12 apart, line under): event photo 32
 * (radius 8), name 14/18 semibold, "N participants" 12/16 Grey_3; open in
 * the Chat page, minimize, close. Tablet: a back arrow first (to the list).
 * Messages on Grey_6, 16 padding, 8 apart, newest at the bottom, day pills.
 * Message box: 44 pill, Grey_5 line (Primary while typing), "Say
 * something…", add photo, send (Primary once there is something to send).
 * Enter sends. Escape minimizes (handled by the dock).
 */
const props = defineProps<{ chat: ChatSummary; back?: boolean }>()
const emit = defineEmits<{ back: []; minimize: []; close: []; full: []; sent: [] }>()
const { user } = useSession()
const me = computed<ChatPerson | null>(() => user.value ? { id: 'u-me', name: `${user.value.firstName} ${user.value.lastName}`, username: user.value.username, avatarUrl: user.value.avatarUrl } : null)

const messages = ref<ChatMessage[]>([])
const loading = ref(true)
const scroller = ref<HTMLElement | null>(null)
const field = ref<HTMLInputElement | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const text = ref('')
const photos = ref<string[]>([])
const sending = ref(false)
const canSend = computed(() => !!text.value.trim() || photos.value.length > 0)
const titleId = useId()

type Item = { key: string; type: 'day'; label: string } | { key: string; type: 'post'; message: ChatPostMessage } | { key: string; type: 'system'; text: string }
const items = computed<Item[]>(() => {
  const out: Item[] = []
  let prev: string | undefined
  for (const m of messages.value) {
    if (!prev || !isSameDay(prev, m.createdAt)) out.push({ key: `day-${m.id}`, type: 'day', label: formatDayLabel(m.createdAt) })
    prev = m.createdAt
    out.push(m.kind === 'post' ? { key: m.id, type: 'post', message: m } : { key: m.id, type: 'system', text: m.text })
  }
  return out
})
function toBottom() { nextTick(() => { if (scroller.value) scroller.value.scrollTop = scroller.value.scrollHeight }) }
async function load() {
  loading.value = true
  messages.value = await getMessages(props.chat.id)
  loading.value = false
  toBottom()
}
watch(() => props.chat.id, load, { immediate: true })
/** A message that arrived while this chat is open (from the dock) */
function receive(m: ChatPostMessage) { if (m.chatId === props.chat.id) { messages.value.push(m); toBottom() } }

async function send() {
  if (!canSend.value || sending.value || !me.value) return
  sending.value = true
  try {
    const m = await sendMessage(props.chat.id, me.value, { text: text.value, photos: photos.value.length ? [...photos.value] : undefined })
    messages.value.push(m)
    text.value = ''
    photos.value = []
    toBottom()
    emit('sent')
  } finally {
    sending.value = false
    nextTick(() => field.value?.focus())
  }
}
function onKeydown(e: KeyboardEvent) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }
function onFile(e: Event) {
  const el = e.target as HTMLInputElement
  for (const f of Array.from(el.files ?? [])) if (f.type.startsWith('image/')) photos.value.push(URL.createObjectURL(f))
  photos.value = photos.value.slice(0, 5)
  el.value = ''
}
defineExpose({ focus: () => field.value?.focus(), receive })
</script>

<template>
  <section class="dock-panel dock-conv" role="dialog" :aria-labelledby="titleId">
    <header class="dock-conv__head">
      <UiBackButton v-if="back" aria-label="Back to chats" @click="emit('back')" />
      <span class="dock-conv__pic"><img v-if="chat.imageUrl" :src="chat.imageUrl" alt="" width="32" height="32" /></span>
      <span class="dock-conv__title">
        <h2 :id="titleId" class="dock-title dock-title--14 dock-ellipsis">{{ chat.title }}</h2>
        <span class="dock-conv__sub">{{ chat.participantCount }} participants</span>
      </span>
      <button type="button" class="dock-icon-btn" aria-label="Open in the Chat page" @click="emit('full')"><img src="/images/dock/icon-open-full-24.svg" alt="" width="20" height="20" /></button>
      <button type="button" class="dock-icon-btn" aria-label="Minimize chat" @click="emit('minimize')"><img src="/images/dock/icon-chevron-down-24.svg" alt="" width="20" height="20" /></button>
      <button type="button" class="dock-icon-btn" aria-label="Close chat" @click="emit('close')"><img class="dock-icon-16" src="/images/host/icon-close-16.svg" alt="" width="16" height="16" /></button>
    </header>

    <div ref="scroller" class="dock-conv__body" tabindex="0" aria-label="Messages" aria-live="polite">
      <div v-if="loading" class="dock-conv__sk" role="status" aria-label="Loading messages">
        <div v-for="n in 4" :key="n" :class="['dock-conv__sk-row', { 'dock-conv__sk-row--mine': n % 3 === 0 }]">
          <UiSkeleton :width="['64%', '50%', '42%', '58%'][n - 1]" height="38px" radius="var(--radius-md)" />
        </div>
      </div>
      <template v-else>
        <template v-for="it in items" :key="it.key">
          <p v-if="it.type === 'day'" class="dock-conv__day"><span>{{ it.label }}</span></p>
          <p v-else-if="it.type === 'system'" class="dock-conv__system">{{ it.text }}</p>
          <ChatDockMessage v-else :message="it.message" />
        </template>
      </template>
    </div>

    <form class="dock-conv__composer" @submit.prevent="send">
      <ul v-if="photos.length" class="dock-conv__previews" aria-label="Photos to send">
        <li v-for="(u, i) in photos" :key="u"><img :src="u" :alt="`Photo ${i + 1} to send`" /><button type="button" class="dock-conv__remove" :aria-label="`Remove photo ${i + 1}`" @click="photos.splice(i, 1)"><img src="/images/host/icon-close-16.svg" alt="" width="12" height="12" /></button></li>
      </ul>
      <div :class="['dock-conv__field', { 'dock-conv__field--active': canSend }]">
        <input ref="field" v-model="text" class="dock-conv__input" type="text" placeholder="Say something…" :aria-label="`Message ${chat.title}`" autocomplete="off" @keydown="onKeydown" />
        <button type="button" class="dock-icon-btn" aria-label="Add photos" @click="fileInput?.click()"><img src="/images/chat/icon-camera-24.svg" alt="" width="20" height="20" /></button>
        <input ref="fileInput" class="dock-visually-hidden" type="file" accept="image/*" multiple tabindex="-1" aria-hidden="true" @change="onFile" />
        <button type="submit" :class="['dock-conv__send', { 'dock-conv__send--on': canSend }]" :aria-disabled="canSend ? undefined : 'true'" aria-label="Send">
          <img :src="canSend ? '/images/chat/icon-send-24.svg' : '/images/dock/icon-send-grey-24.svg'" alt="" width="16" height="16" />
        </button>
      </div>
    </form>
  </section>
</template>

<style scoped>
.dock-conv { height: 520px; max-height: calc(100dvh - 120px); }
.dock-conv__head { flex: none; display: flex; align-items: center; gap: var(--spacing-sm); height: 56px; padding: 0 var(--spacing-xs) 0 var(--spacing-md); border-bottom: var(--border-width-default) solid var(--color-border-default); }
.dock-conv__head:has(> .dock-icon-btn:first-child) { padding-left: var(--spacing-xs); }
.dock-conv__pic { flex: none; width: 32px; height: 32px; overflow: hidden; border-radius: var(--radius-sm); background: var(--color-background-secondary); }
.dock-conv__pic img { display: block; width: 100%; height: 100%; object-fit: cover; }
.dock-conv__title { flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; }
.dock-conv__sub { color: var(--color-text-muted); font-family: var(--font-family-base); font-size: var(--text-xsmall-regular-size); line-height: var(--text-xsmall-regular-line); }
.dock-conv__sk { display: flex; flex-direction: column; gap: var(--spacing-xs); }
.dock-conv__sk-row { display: flex; }
.dock-conv__sk-row--mine { justify-content: flex-end; }
.dock-conv__body { flex: 1 1 auto; min-height: 0; overflow-y: auto; overscroll-behavior: contain; display: flex; flex-direction: column; gap: var(--spacing-xs); padding: var(--spacing-md); background: var(--color-background-secondary); }
.dock-conv__body:focus-visible { outline: var(--focus-ring-width) solid var(--focus-ring-color); outline-offset: -2px; }
.dock-conv__body > :first-child { margin-top: auto; } /* short chats sit at the bottom */
.dock-conv__note { margin: auto; color: var(--color-text-muted); font-family: var(--font-family-base); font-size: var(--text-small-regular-size); }
.dock-conv__day { display: flex; justify-content: center; margin: 0; }
.dock-conv__day span { padding: var(--spacing-xxs) var(--spacing-md); border-radius: var(--radius-pill); background: var(--color-background-primary); color: var(--color-text-secondary); font-family: var(--font-family-base); font-size: var(--text-sub-regular-size); line-height: var(--text-sub-regular-line); }
.dock-conv__system { margin: 0; text-align: center; color: var(--color-text-muted); font-family: var(--font-family-base); font-size: var(--text-xsmall-regular-size); line-height: var(--text-xsmall-regular-line); }
.dock-conv__composer { flex: none; display: flex; flex-direction: column; gap: var(--spacing-xs); padding: var(--spacing-sm) var(--spacing-md); border-top: var(--border-width-default) solid var(--color-border-default); }
.dock-conv__field { box-sizing: border-box; display: flex; align-items: center; gap: var(--spacing-xxs); height: 44px; padding: 0 var(--spacing-xxs) 0 var(--spacing-md); border: var(--border-width-default) solid var(--color-border-default); border-radius: var(--radius-pill); }
.dock-conv__field:focus-within, .dock-conv__field--active { border-color: var(--color-action-primary); }
.dock-conv__input { flex: 1 1 auto; min-width: 0; padding: 0; border: 0; outline: none; background: none; color: var(--color-text-strong); font-family: var(--font-family-base); font-size: var(--text-small-regular-size); line-height: var(--text-small-regular-line); }
.dock-conv__input::placeholder { color: var(--color-text-muted); opacity: 1; }
.dock-conv__send { flex: none; display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; padding: 0; border: 0; border-radius: var(--radius-full); background: var(--color-background-secondary); cursor: default; }
.dock-conv__send--on { background: var(--color-action-primary); cursor: pointer; }
.dock-conv__send:focus-visible { outline: var(--focus-ring-width) solid var(--focus-ring-color); outline-offset: 2px; }
.dock-conv__previews { display: flex; gap: var(--spacing-xs); margin: 0; padding: 0; list-style: none; }
.dock-conv__previews li { position: relative; width: 48px; height: 48px; }
.dock-conv__previews li > img { width: 100%; height: 100%; object-fit: cover; border-radius: var(--radius-sm); }
.dock-conv__remove { position: absolute; top: -6px; right: -6px; display: inline-flex; padding: 2px; border: 0; border-radius: var(--radius-full); background: var(--color-background-primary); box-shadow: var(--shadow-dp1); cursor: pointer; }
</style>
