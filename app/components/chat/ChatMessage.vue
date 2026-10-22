<script setup lang="ts">
/**
 * ChatMessage: one message in a conversation (Figma chat frames 54-56).
 *
 * Others' messages (left): 32px photo, 9px gap, white bubble (radius 16,
 * 12px padding, 0.5px hairline), sender name x-Small semibold purple, text
 * Web Small regular, time x-Small regular on the right.
 * Your messages (right): purple bubble, light text, time + double tick.
 * Text bubbles are up to 381px wide (Figma); short messages shrink to fit.
 *
 * Photo messages (Figma 55, 56): 275px bubble, radius 12, 8px padding; the
 * photos sit in a 259px-wide block with radius 8 and 1px gaps.
 *   1 photo:  one 259px square (Figma)
 *   3 photos: one 259 x 129 on top, two 129px squares below (Figma)
 *   Not in Figma, same style (decision 21 Oct, multiple photos):
 *   2 photos: two 129 x 259 halves side by side
 *   4 photos: 2 x 2 squares
 *   5+:       2 x 2, the last square shows "+N" for the rest
 * An optional caption sits under the photos. Clicking a photo opens the
 * full-size viewer (emits `open-photo`).
 *   FLAG: Figma's photo-message time is Inter 8px; Outfit Sub (10/14) is used.
 *
 * Not in Figma (decided 21 Oct / proposed):
 * - Clicking the sender's photo or name opens their profile panel.
 * - Reply button beside the bubble on hover or keyboard focus (desktop).
 * - Phones (< 768px, decision 21 Oct), no reply icon on the messages:
 *   - Press and hold a message (450ms) -> a small menu in the profile-menu
 *     style with "Reply" (white card, Dp2 shadow, 18/28 text). The message
 *     gets a purple ring while it's open. Closes on a tap elsewhere, Escape
 *     or scrolling. The phone's own copy / select menu is turned off here.
 *   - Swipe a message left or right -> it follows the finger up to 64px and
 *     the reply icon fades in beside it; let go past halfway (32px) to start
 *     a reply. It springs back either way.
 *   - The reply button stays in the page, hidden from view, so screen
 *     readers can still reach it.
 * - A reply shows the quoted message at the top of the bubble (proposed look).
 */
import type { ChatPerson, ChatPostMessage } from '~/types/chat'
import { formatClock } from '~/utils/chatFormat'

const props = defineProps<{ message: ChatPostMessage }>()
const emit = defineEmits<{ profile: [person: ChatPerson]; reply: [message: ChatPostMessage]; 'open-photo': [message: ChatPostMessage, index: number] }>()

const photos = computed(() => props.message.photos ?? [])
const isPhoto = computed(() => photos.value.length > 0)
const layout = computed(() => (['one', 'one', 'two', 'three'][photos.value.length] ?? 'four'))
/** Tiles shown: up to 4; with 5+ the 4th shows "+N" */
const tiles = computed(() => photos.value.slice(0, 4))
const extra = computed(() => Math.max(0, photos.value.length - 4))
const time = computed(() => formatClock(props.message.createdAt))

// Phones: press-and-hold menu and swipe to reply (logic in useMessageGestures)
const phone = usePhoneLayout()
const root = ref<HTMLElement | null>(null)
const bubble = ref<HTMLElement | null>(null)
const replyItem = ref<HTMLButtonElement | null>(null)
const { menuOpen, menuAbove, offset, dragging, swipeIconOpacity, reply, handlers } = useMessageGestures({
  enabled: phone,
  root,
  bubble,
  menuSelector: '.chat-msg__menu',
  onReply: () => emit('reply', props.message),
  onMenuOpen: () => replyItem.value?.focus({ preventScroll: true }),
})
</script>

<template>
  <div
    ref="root"
    :class="['chat-msg', message.mine ? 'chat-msg--mine' : 'chat-msg--theirs', { 'chat-msg--menu': menuOpen, 'chat-msg--dragging': dragging }]"
    @click.capture="handlers.onClickCapture"
  >
    <button
      v-if="!message.mine"
      type="button"
      class="chat-msg__avatar"
      :aria-label="`View ${message.sender.name}'s profile`"
      @click="emit('profile', message.sender)"
    >
      <UiAvatar :name="message.sender.name" :seed="message.sender.username" :src="message.sender.avatarUrl" :size="32" />
    </button>

    <div
      ref="bubble"
      :class="['chat-msg__bubble', { 'chat-msg__bubble--photo': isPhoto }]"
      :style="offset ? { transform: `translateX(${offset}px)` } : undefined"
      @pointerdown="handlers.onPointerDown"
      @pointermove="handlers.onPointerMove"
      @pointerup="handlers.onPointerEnd"
      @pointercancel="handlers.onPointerEnd"
      @contextmenu="handlers.onContextMenu"
      @dragstart.prevent
    >
      <button
        v-if="!message.mine"
        type="button"
        class="chat-msg__sender text-xsmall-semibold"
        @click="emit('profile', message.sender)"
      >
        {{ message.sender.name }}
      </button>

      <div v-if="message.replyTo" class="chat-msg__quote">
        <span class="text-xsmall-semibold">@{{ message.replyTo.senderUsername }}</span>
        <span class="chat-msg__quote-text text-xsmall-regular">{{ message.replyTo.text }}</span>
      </div>

      <div v-if="isPhoto" :class="['chat-msg__photos', `chat-msg__photos--${layout}`]">
        <button
          v-for="(src, i) in tiles"
          :key="i"
          type="button"
          class="chat-msg__photo"
          :aria-label="extra && i === 3 ? `Open photo ${i + 1} of ${photos.length}, ${extra} more` : `Open photo ${i + 1} of ${photos.length}`"
          @click="emit('open-photo', message, i)"
        >
          <img v-if="src" :src="src" alt="" draggable="false" />
          <span v-if="extra && i === 3" class="chat-msg__more text-body-semibold" aria-hidden="true">+{{ extra }}</span>
        </button>
      </div>

      <div class="chat-msg__body">
        <p v-if="message.text" class="chat-msg__text text-small-regular">{{ message.text }}</p>
        <p :class="['chat-msg__meta', isPhoto ? 'text-sub-regular' : 'text-xsmall-regular']">
          <span>{{ time }}</span>
          <img v-if="message.mine" class="chat-msg__tick" src="/images/chat/icon-tick-double-14.svg" alt="Sent" width="14" height="14" />
        </p>
      </div>
    </div>

    <button
      type="button"
      class="chat-msg__reply"
      :aria-label="`Reply to ${message.mine ? 'your message' : message.sender.name}`"
      @click="reply"
    >
      <img src="/images/chat/icon-reply-24.svg" alt="" width="24" height="24" />
    </button>

    <!-- Phones: reply icon revealed by swiping (decorative) -->
    <span
      v-if="phone"
      :class="['chat-msg__swipe-icon', offset < 0 ? 'chat-msg__swipe-icon--right' : 'chat-msg__swipe-icon--left']"
      :style="{ opacity: swipeIconOpacity }"
      aria-hidden="true"
    >
      <img src="/images/chat/icon-reply-24.svg" alt="" width="24" height="24" />
    </span>

    <!-- Phones: press-and-hold menu (profile-menu style) -->
    <div
      v-if="menuOpen"
      :class="['chat-msg__menu', menuAbove ? 'chat-msg__menu--above' : 'chat-msg__menu--below']"
      role="menu"
      :aria-label="`Message from ${message.mine ? 'you' : message.sender.name}`"
    >
      <button ref="replyItem" type="button" role="menuitem" class="chat-msg__menu-item" @click="reply">
        <img src="/images/chat/icon-reply-24.svg" alt="" width="24" height="24" />
        Reply
      </button>
    </div>
  </div>
</template>

<style scoped>
.chat-msg {
  position: relative;
  display: flex;
  align-items: flex-end;
  gap: 9px; /* Figma */
  max-width: 100%;
}
.chat-msg--mine { flex-direction: row-reverse; align-self: flex-end; }
.chat-msg--theirs { align-self: flex-start; }

.chat-msg__avatar {
  flex: none;
  display: inline-flex;
  padding: 0;
  border: 0;
  border-radius: var(--radius-full);
  background: transparent;
  cursor: pointer;
}

.chat-msg__bubble {
  display: flex;
  flex-direction: column;
  min-width: 0;
  max-width: 381px;
  padding: var(--spacing-sm);
  border-radius: var(--spacing-md); /* Figma radius 16: no radius token */
  /* 0.5px hairline drawn as a shadow so it takes no space */
  box-shadow: inset 0 0 0 0.5px var(--color-chat-subtle);
  background: var(--color-chat-bubble-theirs);
  color: var(--color-chat-text);
}
.chat-msg--mine .chat-msg__bubble {
  background: var(--color-chat-bubble-mine);
  color: var(--color-chat-text-mine);
}
.chat-msg__bubble--photo {
  gap: var(--spacing-xs);
  width: 275px; /* Figma; shrinks on narrow screens so it never overflows */
  max-width: 100%;
  padding: var(--spacing-xxs) var(--spacing-xs);
  border-radius: var(--radius-md);
}
.chat-msg--mine .chat-msg__bubble--photo { gap: var(--spacing-field); padding: var(--spacing-xs); }

.chat-msg__sender {
  align-self: flex-start;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--color-chat-sender);
  text-align: left;
  cursor: pointer;
}
.chat-msg__sender:hover { text-decoration: underline; } /* proposed */

.chat-msg__body { display: flex; flex-direction: column; min-width: 0; }
.chat-msg__text { margin: 0; overflow-wrap: anywhere; white-space: pre-wrap; }

.chat-msg__meta {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--spacing-xs);
  margin: 0;
  color: var(--color-chat-time);
  white-space: nowrap;
}
.chat-msg--mine .chat-msg__meta { color: var(--color-chat-time-mine); }
.chat-msg__tick { flex: none; width: 14px; height: 14px; }

/* Photos */
.chat-msg__photos {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1px;
  width: 100%; /* 259px inside the 275px bubble; scales down with it */
  overflow: hidden;
  border-radius: var(--radius-sm);
}
.chat-msg__photo {
  position: relative;
  display: block;
  aspect-ratio: 1;
  padding: 0;
  border: 0;
  overflow: hidden;
  background: var(--color-placeholder-media);
  cursor: zoom-in;
}
.chat-msg__photo img { display: block; width: 100%; height: 100%; object-fit: cover; }
.chat-msg__photo:focus-visible { outline: var(--focus-ring-width) solid var(--focus-ring-color); outline-offset: -2px; }
.chat-msg__photos--one .chat-msg__photo { grid-column: 1 / -1; }
.chat-msg__photos--two .chat-msg__photo { aspect-ratio: 129 / 259; }
.chat-msg__photos--three .chat-msg__photo:first-child { grid-column: 1 / -1; aspect-ratio: 259 / 129; }
/* "+N" on the last square (proposed) */
.chat-msg__more {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-photo-scrim);
  color: var(--color-text-inverse);
}

/* Proposed: quoted message in a reply */
.chat-msg__quote {
  display: flex;
  flex-direction: column;
  margin-bottom: var(--spacing-xs);
  padding: var(--spacing-xxs) var(--spacing-xs);
  border-left: var(--border-width-emphasis) solid currentColor;
  border-radius: var(--radius-xs);
  background: var(--color-background-secondary);
  color: var(--color-text-secondary);
}
.chat-msg--mine .chat-msg__quote {
  background: color-mix(in srgb, var(--color-chat-text-mine) 15%, transparent);
  color: var(--color-chat-text-mine);
}
.chat-msg__quote-text { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

/* Proposed: reply button, shown on hover or keyboard focus */
.chat-msg__reply {
  flex: none;
  align-self: center;
  display: inline-flex;
  padding: var(--spacing-xxs);
  border: 0;
  border-radius: var(--radius-full);
  background: var(--color-background-primary);
  box-shadow: var(--shadow-icon-bubble);
  cursor: pointer;
  opacity: 0;
  transition: opacity 120ms ease;
}
.chat-msg:hover .chat-msg__reply,
.chat-msg__reply:focus-visible { opacity: 1; }

.chat-msg__avatar:focus-visible,
.chat-msg__sender:focus-visible,
.chat-msg__reply:focus-visible {
  outline: var(--focus-ring-width) solid var(--focus-ring-color);
  outline-offset: var(--focus-ring-offset);
}

/* ---- Phones: swipe and press-and-hold (proposed look) ---- */
.chat-msg__swipe-icon {
  position: absolute;
  top: 50%;
  display: inline-flex;
  padding: var(--spacing-xxs);
  border-radius: var(--radius-full);
  background: var(--color-background-primary);
  box-shadow: var(--shadow-icon-bubble);
  transform: translateY(-50%);
  pointer-events: none;
}
/* swiping right -> icon on the left edge; swiping left -> on the right edge */
.chat-msg__swipe-icon--left { left: 0; }
.chat-msg__swipe-icon--right { right: 0; }
.chat-msg--theirs .chat-msg__swipe-icon--left { left: 41px; } /* after the 32px photo + 9px gap */
.chat-msg__bubble { transition: transform 200ms cubic-bezier(.2, .9, .3, 1.3); } /* springs back */
.chat-msg--dragging .chat-msg__bubble { transition: none; }

.chat-msg__menu {
  position: absolute;
  z-index: 5;
  min-width: 174px; /* same as the profile menu */
  padding-block: var(--spacing-xs);
  border-radius: var(--radius-lg);
  background: var(--color-background-primary);
  box-shadow: var(--shadow-dp2);
}
.chat-msg--theirs .chat-msg__menu { left: 41px; }
.chat-msg--mine .chat-msg__menu { right: 0; }
.chat-msg__menu--above { bottom: calc(100% + var(--spacing-xs)); }
.chat-msg__menu--below { top: calc(100% + var(--spacing-xs)); }
.chat-msg__menu-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  width: 100%;
  padding: var(--spacing-xs) var(--spacing-md);
  border: 0;
  background: transparent;
  color: var(--color-text-strong);
  font-family: var(--font-family-base);
  font-weight: var(--font-weight-regular);
  font-size: var(--text-menu-item-size);
  line-height: var(--text-menu-item-line);
  letter-spacing: var(--text-menu-item-tracking);
  text-align: left;
  cursor: pointer;
}
.chat-msg__menu-item:focus-visible { outline: none; box-shadow: inset 0 0 0 var(--focus-ring-width) var(--focus-ring-color); }
.chat-msg--menu .chat-msg__bubble { box-shadow: 0 0 0 var(--border-width-emphasis) var(--color-border-focus); }

@media (prefers-reduced-motion: reduce) {
  .chat-msg__reply,
  .chat-msg__bubble { transition: none; }
}

/* ---- Phones (< 768px): Figma "chat" mobile 10683:54673 ----
   Text bubbles: radius 8, up to 234px wide, text Body 16/24. */
@media (max-width: 767px) {
  .chat-msg__bubble:not(.chat-msg__bubble--photo) { max-width: min(234px, 100%); border-radius: var(--radius-sm); }
  /* No reply icon beside messages: hold or swipe instead. The button stays
     for screen readers but takes no space. */
  .chat-msg__reply {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
  }
  .chat-msg__bubble {
    touch-action: pan-y; /* vertical scrolling stays native; sideways is the swipe */
    -webkit-touch-callout: none;
    user-select: none;
  }
  .chat-msg__text {
    font-size: var(--text-body-regular-size);
    line-height: var(--text-body-regular-line);
    letter-spacing: var(--text-body-regular-tracking);
  }
}
</style>
