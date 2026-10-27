<script setup lang="ts">
/**
 * ChatComposer: the message box at the bottom of a conversation.
 * Look from the chat screens (Desktop 54: "Component 4" instance): white box,
 * 1px Grey_5 border, radius 16, 8px inside; white pill field, 16px / 12px
 * padding, "Type your message" in Web Small Grey_3, camera icon on the right.
 * States from the "Component 4" set (decision 21 Oct: screens' look + these):
 * - typing: purple round send button (12px padding, 24px arrow) to the right
 * - reply:  "Replying to @username" and the quoted text above the field
 *   (Body regular Grey_2, 8px apart, 16px above the field)
 * Not in Figma (proposed): X to cancel a reply; chosen photos show as 64px
 * previews, each with an X, above the field until they are sent.
 *
 * Phones (< 768px, Figma "Component 4" inactive): white bar, 16px padding,
 * Grey_6 pill field with a 0.5px Grey_5 line, "Say something...".
 *
 * Enter sends; Escape cancels the reply. The camera opens the file picker:
 * several photos can be chosen at once, and the camera can be used again to
 * add more, up to MAX_PHOTOS per message (decision 21 Oct; limit approved 27 Oct).
 * Problems (decision 27 Oct, PROPOSED): picking more than 10, a file that
 * isn't a photo or is over 10 MB shows one red line above the field
 * (utils/photoRules.ts); it goes away after 6 seconds or on the next pick.
 */
import { checkPhotos } from '~/utils/photoRules'
import type { NewMessage, ReplyQuote } from '~/types/chat'

const props = defineProps<{ replyTo?: ReplyQuote | null; busy?: boolean }>()
const emit = defineEmits<{ send: [draft: NewMessage]; 'cancel-reply': [] }>()

const MAX_PHOTOS = 10

const phone = usePhoneLayout()
const placeholder = computed(() => (phone.value ? 'Say something...' : 'Type your message'))

const text = ref('')
const photos = ref<string[]>([])
const field = ref<HTMLInputElement | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)

const canSend = computed(() => !props.busy && (text.value.trim().length > 0 || photos.value.length > 0))
const full = computed(() => photos.value.length >= MAX_PHOTOS)

function pickPhoto() {
  fileInput.value?.click()
}
const problem = ref('')
let problemTimer: ReturnType<typeof setTimeout> | undefined
function showProblem(text: string) {
  clearTimeout(problemTimer)
  problem.value = text
  if (text) problemTimer = setTimeout(() => { problem.value = '' }, 6000)
}
onBeforeUnmount(() => clearTimeout(problemTimer))
function onFile(e: Event) {
  const input = e.target as HTMLInputElement
  const files = [...(input.files ?? [])]
  input.value = ''
  const { ok, problem: text } = checkPhotos(files, MAX_PHOTOS - photos.value.length, MAX_PHOTOS)
  photos.value.push(...ok.map(f => URL.createObjectURL(f)))
  showProblem(text)
  field.value?.focus()
}
function removePhoto(i: number) {
  const [url] = photos.value.splice(i, 1)
  if (url) URL.revokeObjectURL(url)
  field.value?.focus()
}
function send() {
  if (!canSend.value) return
  emit('send', { text: text.value, photos: photos.value.length ? [...photos.value] : undefined, replyTo: props.replyTo ? { ...props.replyTo } : undefined })
  text.value = ''
  photos.value = [] // the sent message now owns the preview URLs
}
function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  else if (e.key === 'Escape' && props.replyTo) { e.preventDefault(); emit('cancel-reply') }
}

defineExpose({ focus: () => field.value?.focus() })
</script>

<template>
  <form class="chat-composer" @submit.prevent="send">
    <div v-if="replyTo" class="chat-composer__reply">
      <div class="chat-composer__reply-text text-small-regular">
        <p>Replying to @{{ replyTo.senderUsername }}</p>
        <p class="chat-composer__quote">{{ replyTo.text }}</p>
      </div>
      <button type="button" class="chat-composer__icon-button" aria-label="Cancel reply" @click="emit('cancel-reply')">
        <img src="/images/chat/icon-close-20.svg" alt="" width="16" height="16" />
      </button>
    </div>

    <ul v-if="photos.length" class="chat-composer__previews" aria-label="Photos to send">
      <li v-for="(url, i) in photos" :key="url" class="chat-composer__preview">
        <img :src="url" :alt="`Photo ${i + 1} to send`" />
        <button type="button" class="chat-composer__remove" :aria-label="`Remove photo ${i + 1}`" @click="removePhoto(i)">
          <img src="/images/chat/icon-close-20.svg" alt="" width="16" height="16" />
        </button>
      </li>
    </ul>

    <UiInlineAlert v-if="problem" class="chat-composer__problem" :text="problem" />

    <div class="chat-composer__row">
      <div class="chat-composer__field">
        <input
          ref="field"
          v-model="text"
          class="chat-composer__input text-small-regular"
          type="text"
          :placeholder="placeholder"
          aria-label="Message"
          autocomplete="off"
          @keydown="onKeydown"
        />
        <button type="button" class="chat-composer__icon-button" :aria-label="photos.length ? 'Add more photos' : 'Add photos'" :disabled="full" @click="pickPhoto">
          <img src="/images/chat/icon-camera-24.svg" alt="" width="24" height="24" />
        </button>
        <input ref="fileInput" class="chat-composer__file" type="file" accept="image/*" multiple tabindex="-1" aria-hidden="true" @change="onFile" />
      </div>
      <button v-if="canSend" type="submit" class="chat-composer__send" aria-label="Send">
        <img src="/images/chat/icon-send-24.svg" alt="" width="24" height="24" />
      </button>
    </div>
  </form>
</template>

<style scoped>
.chat-composer__problem { padding-inline: var(--spacing-xs); }
.chat-composer {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  padding: calc(var(--spacing-xs) - var(--border-width-default));
  border: var(--border-width-default) solid var(--color-border-default);
  border-radius: var(--spacing-md); /* Figma radius 16: no radius token */
  background: var(--color-background-primary);
}
.chat-composer__row { display: flex; align-items: center; gap: var(--spacing-md); }
.chat-composer__field {
  display: flex;
  flex: 1;
  align-items: center;
  gap: var(--spacing-xs);
  min-width: 0;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-pill);
  background: var(--color-background-primary);
}
.chat-composer__input {
  flex: 1;
  min-width: 0;
  padding: 0;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--color-text-primary);
}
.chat-composer__input::placeholder { color: var(--color-text-placeholder); opacity: 1; }
.chat-composer:focus-within { border-color: var(--color-border-focus); } /* proposed, as other inputs */
.chat-composer__file { display: none; }

.chat-composer__icon-button:disabled { opacity: 0.4; cursor: not-allowed; }
.chat-composer__icon-button {
  display: inline-flex;
  flex: none;
  padding: 0;
  border: 0;
  border-radius: var(--radius-full);
  background: transparent;
  cursor: pointer;
}
.chat-composer__send {
  display: inline-flex;
  flex: none;
  padding: var(--spacing-sm);
  border: 0;
  border-radius: var(--radius-pill);
  box-shadow: inset 0 0 0 0.5px var(--color-border-default);
  background: var(--color-action-primary);
  cursor: pointer;
}
.chat-composer__send:hover { background: var(--color-action-primary-hover); } /* proposed */

/* Reply (Figma "Component 4", Reply state) */
.chat-composer__reply {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--spacing-md);
  padding: var(--spacing-xs) var(--spacing-xs) 0;
}
.chat-composer__reply-text {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  min-width: 0;
  color: var(--color-text-secondary);
}
.chat-composer__reply-text p { margin: 0; }
.chat-composer__quote { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

/* Proposed: chosen photo previews */
.chat-composer__previews {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-md);
  margin: 0;
  padding: var(--spacing-xs) var(--spacing-xs) 0;
  list-style: none;
}
.chat-composer__preview {
  position: relative;
  width: 64px;
  height: 64px;
}
.chat-composer__preview > img {
  width: 100%;
  height: 100%;
  border-radius: var(--radius-sm);
  object-fit: cover;
}
.chat-composer__remove {
  position: absolute;
  top: calc(-1 * var(--spacing-xs));
  right: calc(-1 * var(--spacing-xs));
  display: inline-flex;
  padding: 2px;
  border: 0;
  border-radius: var(--radius-full);
  background: var(--color-background-primary);
  box-shadow: var(--shadow-icon-bubble);
  cursor: pointer;
}

.chat-composer__icon-button:focus-visible,
.chat-composer__send:focus-visible,
.chat-composer__remove:focus-visible {
  outline: var(--focus-ring-width) solid var(--focus-ring-color);
  outline-offset: var(--focus-ring-offset);
}

/* ---- Phones (< 768px) ---- */
@media (max-width: 767px) {
  .chat-composer {
    padding: var(--spacing-md);
    border: 0;
    border-radius: 0;
    box-shadow: inset 0 0.5px 0 var(--color-border-default);
  }
  .chat-composer:focus-within { border-color: transparent; }
  .chat-composer__field {
    box-shadow: inset 0 0 0 0.5px var(--color-border-default);
    background: var(--color-background-secondary);
  }
  .chat-composer:focus-within .chat-composer__field { box-shadow: inset 0 0 0 1px var(--color-border-focus); }
  /* Input text 16px (token text-input-mobile, decision 21 Oct) */
  .chat-composer__input {
    font-size: var(--text-input-mobile-size);
    line-height: var(--text-input-mobile-line);
    letter-spacing: var(--text-input-mobile-tracking);
  }
}
</style>
