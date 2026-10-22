<script setup lang="ts">
/**
 * ChatConversation: an open event chat (Figma "Desktop - 54", 10669:50851).
 *
 * Header (photo + title open the event page): 40px event photo (radius 8), 12px gap, title Web Body semibold
 * (black) over "N participants" (Web Small, Grey_3), 16px padding, Grey_5 line
 * under it. Right: "Buy Ticket" (small primary button, Figma update 21 Oct,
 * replaces the "..." button). It opens the buy flow at Add Ticket (the chat
 * page handles it; decision 22 Oct).
 * Already have a ticket (chat.hasTicket: bought or assigned, worked out from
 * the tickets held; decisions 21-22 Oct): "Share Event"
 * instead (Figma 10682:52458: secondary Grey_6, 16 / 8 padding, 40px tall,
 * share icon 24, 8px gap, Web Body semibold Grey_1). It opens the device's
 * share sheet; where there is none, it copies the link and shows "Link
 * copied". Phones: NOT IN FIGMA, a round grey share-icon button (proposed).
 * The link is the event's page (/events/<event id>).
 *
 * Phones (< 768px, Figma "chat" mobile 10683:54673): full screen with its own
 * top bar: back arrow (36px soft grey circle) | 40px photo | title + count |
 * compact "Buy Ticket" pill (8 / 4 padding, regular). Messages 16px from the
 * sides; bubbles radius 8, up to 234px wide, text Body 16/24; join notices
 * 16px above and below. The back arrow returns to the chat list.
 * Body: Grey_6, bottom corners 24, 24px padding; messages 8px apart, scrolling
 * above the message box.
 * Timeline extras: a day pill ("TODAY"; Sub regular, white, 16 / 4 padding,
 * soft shadow) and join notices ("Asherkine just joined": x-Small semibold in a
 * white pill between two thin lines, 24px apart).
 */
import type { ChatMessage, ChatPerson, ChatPostMessage, ChatSummary, NewMessage, ReplyQuote } from '~/types/chat'
import { formatDayLabel, isSameDay } from '~/utils/chatFormat'

const NuxtLink = resolveComponent('NuxtLink')

const props = defineProps<{ chat: ChatSummary; messages: ChatMessage[]; sending?: boolean }>()
const emit = defineEmits<{ send: [draft: NewMessage]; profile: [person: ChatPerson]; back: []; 'buy-ticket': [] }>()

const replyTo = ref<ReplyQuote | null>(null)
const scroller = ref<HTMLElement | null>(null)
const composer = ref<{ focus: () => void } | null>(null)

type Item = { key: string; type: 'day'; label: string } | { key: string; type: 'message'; message: ChatMessage }
const items = computed<Item[]>(() => {
  const out: Item[] = []
  let prev: string | undefined
  for (const m of props.messages) {
    if (!prev || !isSameDay(prev, m.createdAt)) out.push({ key: `day-${m.id}`, type: 'day', label: formatDayLabel(m.createdAt) })
    out.push({ key: m.id, type: 'message', message: m })
    prev = m.createdAt
  }
  return out
})

const participants = computed(() => `${props.chat.participantCount.toLocaleString('en-GB')} participant${props.chat.participantCount === 1 ? '' : 's'}`)

async function scrollToEnd() {
  await nextTick()
  const el = scroller.value
  if (el) el.scrollTop = el.scrollHeight
}
watch(() => props.messages.length, scrollToEnd)
watch(() => props.chat.id, () => { replyTo.value = null; scrollToEnd() })

// Stay on the newest message when the area changes size (e.g. the profile
// panel opens and the bubbles re-wrap), if the reader was already there.
let atBottom = true
function onScroll() {
  const el = scroller.value
  if (el) atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 24
}
let resize: ResizeObserver | undefined
onMounted(() => {
  scrollToEnd()
  if (!scroller.value) return
  resize = new ResizeObserver(() => { if (atBottom) scrollToEnd() })
  resize.observe(scroller.value)
})
onBeforeUnmount(() => resize?.disconnect())

function startReply(m: ChatPostMessage) {
  replyTo.value = { messageId: m.id, senderUsername: m.sender.username, text: m.text ?? 'Photo' }
  composer.value?.focus()
}
// Full-size photo viewer (opened by clicking a photo in a message)
const viewer = ref<{ photos: string[]; index: number; caption?: string; label: string } | null>(null)
function openPhoto(m: ChatPostMessage, index: number) {
  viewer.value = {
    photos: m.photos ?? [],
    index,
    caption: m.text,
    label: m.mine ? 'Your photo' : `Photo from ${m.sender.name}`,
  }
}
watch(() => props.chat.id, () => { viewer.value = null })

// Share Event (only when the user already has a ticket)
const { toast, share } = useShareLink()
function shareEvent() {
  share({
    url: eventUrl(props.chat.eventId ?? props.chat.id),
    title: props.chat.title,
    text: `Join me at ${props.chat.title} on Vegaz`,
  })
}

function onSend(draft: NewMessage) {
  emit('send', draft)
  replyTo.value = null
}
</script>

<template>
  <section class="chat-conv" :aria-label="`${chat.title} chat`">
    <header class="chat-conv__head">
      <button type="button" class="chat-conv__back" aria-label="Back to chats" @click="emit('back')">
        <img src="/images/chat/icon-arrow-left-20.svg" alt="" width="20" height="20" />
      </button>
      <!-- Photo + title open the event page (decision 22 Oct) -->
      <component
        :is="chat.eventId ? NuxtLink : 'div'"
        class="chat-conv__event"
        v-bind="chat.eventId ? { to: `/events/${chat.eventId}`, 'aria-label': `${chat.title}, ${participants}. View event` } : {}"
      >
        <span class="chat-conv__photo">
          <img v-if="chat.imageUrl" :src="chat.imageUrl" alt="" />
        </span>
        <div class="chat-conv__titles">
          <h2 class="chat-conv__title text-body-semibold">{{ chat.title }}</h2>
          <p class="chat-conv__count text-small-regular">{{ participants }}</p>
        </div>
      </component>
      <UiButton
        v-if="chat.hasTicket"
        color="secondary"
        text-style="web"
        class="chat-conv__share"
        aria-label="Share Event"
        @click="shareEvent"
      >
        <template #icon><img src="/images/chat/icon-share-24.svg" alt="" width="24" height="24" /></template>
        <span class="chat-conv__share-label">Share Event</span>
      </UiButton>
      <UiButton v-else size="small" class="chat-conv__ticket" @click="emit('buy-ticket')">Buy Ticket</UiButton>
    </header>

    <div class="chat-conv__body">
      <!-- One scroll area for the whole grey panel: messages scroll right up to
           the header line and behind the message box, which stays pinned 24px
           above the bottom (as in Figma Desktop - 56). No cut-off edges. -->
      <div ref="scroller" class="chat-conv__scroll" @scroll.passive="onScroll">
      <div class="chat-conv__messages" role="log" aria-live="polite" :aria-label="`Messages in ${chat.title}`">
        <template v-for="item in items" :key="item.key">
          <div v-if="item.type === 'day'" class="chat-conv__day">
            <span class="chat-conv__day-pill text-sub-regular">{{ item.label }}</span>
          </div>
          <div v-else-if="item.message.kind === 'system'" class="chat-conv__notice">
            <span class="chat-conv__notice-pill">{{ item.message.text }}</span>
          </div>
          <ChatMessage v-else :message="item.message" @profile="emit('profile', $event)" @reply="startReply" @open-photo="openPhoto" />
        </template>
      </div>

      <ChatComposer ref="composer" class="chat-conv__composer" :reply-to="replyTo" :busy="sending" @send="onSend" @cancel-reply="replyTo = null" />
      </div>
    </div>

    <UiPhotoViewer
      :open="!!viewer"
      :photos="viewer?.photos ?? []"
      :index="viewer?.index ?? 0"
      :caption="viewer?.caption"
      :label="viewer?.label"
      @update:index="viewer && (viewer.index = $event)"
      @close="viewer = null"
    />
    <UiToast :message="toast" @done="toast = ''" />
  </section>
</template>

<style scoped>
.chat-conv {
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
}
.chat-conv__head {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-md) calc(var(--spacing-md) - var(--border-width-default));
  border-bottom: var(--border-width-default) solid var(--color-border-default);
}
.chat-conv__photo {
  flex: none;
  width: var(--sizing-control-compact);
  height: var(--sizing-control-compact);
  overflow: hidden;
  border-radius: var(--radius-sm);
  background: var(--color-placeholder-media);
}
.chat-conv__photo img { width: 100%; height: 100%; object-fit: cover; }
.chat-conv__event {
  display: flex;
  flex: 1;
  align-items: center;
  gap: var(--spacing-sm);
  min-width: 0;
  border-radius: var(--radius-sm);
  color: inherit;
  text-decoration: none;
}
a.chat-conv__event:hover .chat-conv__title { text-decoration: underline; } /* proposed */
.chat-conv__event:focus-visible { outline: var(--focus-ring-width) solid var(--focus-ring-color); outline-offset: var(--focus-ring-offset); }
.chat-conv__titles { display: flex; flex: 1; flex-direction: column; gap: var(--spacing-micro); min-width: 0; }
.chat-conv__ticket { flex: none; }
/* Share Event (Figma 10682:52458) */
.chat-conv__share {
  flex: none;
  --ui-button-pad-x: var(--spacing-md);
  --ui-button-pad-y: var(--spacing-xs);
  --ui-button-min-height: var(--sizing-control-compact);
  --ui-button-border-color: transparent;
}
/* Figma: 16/24 semibold at desktop = Web Small semibold (Web Body grows to 18/28) */
.chat-conv__head .chat-conv__share {
  font-size: var(--text-small-semibold-size);
  line-height: var(--text-small-semibold-line);
  letter-spacing: var(--text-small-semibold-tracking);
}
.chat-conv__back {
  display: none;
  flex: none;
  padding: var(--spacing-xs);
  border: 0;
  border-radius: var(--radius-pill);
  background: var(--color-back-button);
  cursor: pointer;
}
.chat-conv__back:focus-visible {
  outline: var(--focus-ring-width) solid var(--focus-ring-color);
  outline-offset: var(--focus-ring-offset);
}
.chat-conv__title,
.chat-conv__count { margin: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.chat-conv__title { color: var(--color-chat-title); }
.chat-conv__count { color: var(--color-text-muted); }

.chat-conv__body {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  overflow: hidden; /* clips scrolling messages to the rounded corners */
  border-radius: 0 0 var(--radius-lg) var(--radius-lg);
  background: var(--color-background-secondary);
}
/* Figma: 24px padding inside the grey panel, message box 16px below the last
   message. The padding now lives inside the scroll area, so text scrolls all
   the way to the panel's edges instead of being cut 24px short. */
.chat-conv__scroll {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: var(--spacing-md);
  min-height: 0;
  padding: var(--spacing-lg);
  overflow-y: auto;
}
.chat-conv__messages {
  display: flex;
  flex: 1 0 auto; /* pushes the message box to the bottom when there are few messages */
  flex-direction: column;
  gap: var(--spacing-xs);
}
.chat-conv__composer {
  position: sticky;
  bottom: 0; /* sits on the scroll area's 24px bottom padding */
  z-index: 1;
  flex: none;
}

.chat-conv__day { display: flex; justify-content: center; }
.chat-conv__day-pill {
  padding: var(--spacing-xxs) var(--spacing-md);
  border-radius: var(--radius-pill);
  background: var(--color-background-primary);
  box-shadow: var(--shadow-chat-pill);
  color: var(--color-text-note);
}

.chat-conv__notice {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  padding-block: var(--spacing-xs);
}
.chat-conv__notice::before,
.chat-conv__notice::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--color-chat-subtle);
}
.chat-conv__notice-pill {
  padding: var(--spacing-xxs) var(--spacing-xs);
  border-radius: var(--radius-pill);
  background: var(--color-background-primary);
  box-shadow: var(--shadow-chat-pill);
  color: var(--color-text-note);
  font-family: var(--font-family-base);
  font-weight: var(--font-weight-semibold);
  font-size: var(--text-app-xsmall-semibold-size);
  line-height: var(--text-app-xsmall-semibold-line);
  white-space: nowrap;
}

/* ---- Phones (< 768px): Figma "chat" mobile ---- */
@media (max-width: 767px) {
  .chat-conv { height: 100%; }
  .chat-conv__head {
    padding: var(--spacing-md);
    border-bottom: 0;
    box-shadow: inset 0 -0.5px 0 var(--color-border-default); /* 0.5px line */
    background: var(--color-background-primary);
  }
  /* Figma: 16px after the back arrow, 12px between photo and title */
  .chat-conv__back { display: inline-flex; margin-right: var(--spacing-xxs); }
  .chat-conv__ticket {
    --ui-button-pad-x: var(--spacing-xs);
    --ui-button-pad-y: var(--spacing-xxs);
    --ui-button-min-height: 0;
    --ui-button-font-weight: var(--font-weight-regular);
  }
  /* Proposed: icon-only round share button on phones */
  .chat-conv__share { --ui-button-pad-x: var(--spacing-xs); --ui-button-pad-y: var(--spacing-xs); gap: 0; border-radius: var(--radius-pill); }
  .chat-conv__share-label {
    position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap;
  }
  .chat-conv__body { border-radius: 0; }
  .chat-conv__scroll { padding: var(--spacing-lg) var(--spacing-md) 0; }
  .chat-conv__notice { padding-block: var(--spacing-md); }
  .chat-conv__composer { bottom: 0; margin-inline: calc(-1 * var(--spacing-md)); }
}
</style>
