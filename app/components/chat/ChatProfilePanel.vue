<script setup lang="ts">
/**
 * ChatProfilePanel: a person's profile beside the conversation
 * (Figma "Desktop - 57", 10669:51648). Opened by clicking a sender's photo or
 * name (decision 21 Oct); the X (top right of the photo) or Escape closes it.
 *
 * Photo: square, radius 24, darkening to the bottom. Close: 36px Grey_6
 * circle, 20px X, 14px from the right. Name Headline 3 bold, @username Web Body
 * Grey_3, gender memoji (32px) in a white circle. Line, then "All Events"
 * (Web Body bold) and its note, then one row per event: 60px photo (radius 12),
 * title Web Body bold, date Web Small Grey_3; rows have 16px above and below.
 * The ">" arrow Figma shows on each row is removed (decision 21 Oct). The panel scrolls on its own.
 * Copy change (decision 21 Oct): "Hangouts" -> "Events".
 * Events: real demo events with their fliers (decision 22 Oct; Figma's
 * sample list had no images). OPEN ITEM: event rows have no destination yet
 * (not links).
 *
 * Phones (< 768px, Figma "iPhone 13 mini - 118"): full screen; the photo runs
 * edge to edge (375 x 334 ratio, no corners) with a back arrow (36px soft grey
 * circle, 16px in) instead of the X; content 16px from the sides. Content is
 * the same as desktop (decision 21 Oct: no carousel, tabs, counts or slots).
 */
import type { ChatProfile } from '~/types/chat'

const props = withDefaults(defineProps<{ profile: ChatProfile; backLabel?: string }>(), { backLabel: 'Back to chat' })
const emit = defineEmits<{ close: [] }>()

const closeButton = ref<HTMLButtonElement | null>(null)
const phone = usePhoneLayout()
defineExpose({ focus: () => closeButton.value?.focus() })

const memoji = computed(() =>
  props.profile.gender === 'female' ? '/images/auth/memoji-female.svg'
  : props.profile.gender === 'male' ? '/images/auth/memoji-male.svg'
  : null,
)
function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') { e.preventDefault(); emit('close') }
}
</script>

<template>
  <aside class="chat-profile" :aria-label="`${profile.name}'s profile`" @keydown="onKeydown">
    <div class="chat-profile__photo">
      <img v-if="profile.photoUrl" :src="profile.photoUrl" alt="" />
      <button ref="closeButton" type="button" :class="'chat-profile__close'" :aria-label="phone ? backLabel : 'Close profile'" @click="emit('close')">
        <img class="chat-profile__close-x" src="/images/chat/icon-close-20.svg" alt="" width="16" height="16" />
        <img class="chat-profile__close-back" src="/images/icon-back-20.svg" alt="" width="20" height="20" />
      </button>
    </div>

    <div class="chat-profile__who">
      <div class="chat-profile__names">
        <h2 class="chat-profile__name text-h3-bold">{{ profile.name }}</h2>
        <p class="chat-profile__handle text-body-regular">@{{ profile.username }}</p>
      </div>
      <span v-if="memoji" class="chat-profile__memoji">
        <img :src="memoji" alt="" width="32" height="32" />
      </span>
    </div>

    <hr class="chat-profile__line" />

    <section class="chat-profile__events" aria-labelledby="chat-profile-events">
      <div class="chat-profile__events-head">
        <h3 id="chat-profile-events" class="chat-profile__events-title text-body-bold">All Events</h3>
        <p class="chat-profile__note text-small-regular">Here’s a list of events they joined or hosted</p>
      </div>
      <ul class="chat-profile__list">
        <li v-for="event in profile.events" :key="event.id" class="chat-profile__event">
          <span class="chat-profile__event-photo">
            <img v-if="event.imageUrl" :src="event.imageUrl" alt="" />
          </span>
          <span class="chat-profile__event-text">
            <span class="chat-profile__event-title text-body-bold">{{ event.title }}</span>
            <span class="chat-profile__note text-small-regular">{{ event.dateLabel }}</span>
          </span>
        </li>
      </ul>
    </section>
  </aside>
</template>

<style scoped>
.chat-profile {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  min-height: 0;
  overflow-y: auto;
}
.chat-profile__photo {
  position: relative;
  flex: none;
  aspect-ratio: 1;
  overflow: hidden;
  border-radius: var(--radius-lg);
  background: var(--color-placeholder-media);
}
.chat-profile__photo > img { width: 100%; height: 100%; object-fit: cover; }
.chat-profile__photo::after {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--gradient-photo-fade);
  pointer-events: none;
}
.chat-profile__close {
  position: absolute;
  top: 14px; /* Figma: centred 14px from the top-right corner */
  right: 14px;
  z-index: 1;
  display: inline-flex;
  padding: var(--spacing-xs);
  border: 0;
  border-radius: var(--radius-pill);
  background: var(--color-chat-subtle);
  cursor: pointer;
}
.chat-profile__close-back { display: none; }
.chat-profile__close:focus-visible {
  outline: var(--focus-ring-width) solid var(--focus-ring-color);
  outline-offset: var(--focus-ring-offset);
}

.chat-profile__who { display: flex; align-items: center; gap: var(--spacing-md); }
.chat-profile__names { display: flex; flex: 1; flex-direction: column; gap: var(--spacing-xxs); min-width: 0; }
.chat-profile__name { margin: 0; color: var(--color-text-field); overflow-wrap: anywhere; }
.chat-profile__handle { margin: 0; color: var(--color-text-muted); }
.chat-profile__memoji {
  display: inline-flex;
  flex: none;
  border-radius: var(--radius-pill);
  background: var(--color-background-primary);
  box-shadow: var(--shadow-icon-bubble);
}
.chat-profile__memoji img { width: 32px; height: 32px; }

.chat-profile__line {
  flex: none;
  width: 100%;
  margin: 0;
  border: 0;
  border-top: var(--border-width-default) solid var(--color-chat-subtle);
}

.chat-profile__events { display: flex; flex-direction: column; gap: 18px; /* Figma */ }
.chat-profile__events-head { display: flex; flex-direction: column; gap: var(--spacing-xxs); }
.chat-profile__events-title { margin: 0; color: var(--color-text-field); }
.chat-profile__note { margin: 0; color: var(--color-text-muted); }
.chat-profile__list { margin: 0; padding: 0; list-style: none; }
.chat-profile__event {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding-block: var(--spacing-md);
}
.chat-profile__event-photo {
  flex: none;
  width: 60px;
  height: 60px;
  overflow: hidden;
  border-radius: var(--radius-md);
  background: var(--color-placeholder-media);
}
.chat-profile__event-photo img { display: block; width: 100%; height: 100%; object-fit: cover; }
.chat-profile__event-text { display: flex; flex: 1; flex-direction: column; gap: var(--spacing-xs); min-width: 0; }
.chat-profile__event-title {
  overflow: hidden;
  color: var(--color-text-primary);
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ---- Phones (< 768px) ---- */
@media (max-width: 767px) {
  .chat-profile { height: 100%; padding-bottom: var(--spacing-lg); background: var(--color-background-primary); }
  .chat-profile__photo { aspect-ratio: 375 / 334; border-radius: 0; }
  .chat-profile__close {
    top: var(--spacing-md);
    right: auto;
    left: var(--spacing-md);
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    padding: 0;
    background: var(--color-back-button); /* same as UiBackButton (decision 27 Oct) */
    backdrop-filter: blur(2px);
  }
  .chat-profile__close-back { width: 20px; height: 20px; }
  .chat-profile__close-x { display: none; }
  .chat-profile__close-back { display: block; }
  .chat-profile > :not(.chat-profile__photo) { margin-inline: var(--spacing-md); }
  .chat-profile__line { width: auto; }
  /* Figma mobile: content 31px below the photo; memoji left of the name;
     name Headline 2 mobile bold 24/32 */
  .chat-profile__who { margin-top: 7px; }
  .chat-profile__memoji { order: -1; }
  .chat-profile__name {
    font-size: var(--text-app-h2-bold-size);
    line-height: var(--text-app-h2-bold-line);
    letter-spacing: var(--text-app-h2-bold-tracking);
  }
}
</style>
