<script setup lang="ts">
/**
 * EventStickyHeader: every width (phones and tablets 27 Oct; desktop added
 * 27 Oct). Once the
 * event's name has scrolled up behind the site header, this bar takes the
 * header's place: the event name on the left (one line, "..." when long),
 * then on the right the same buttons as the desktop title row: the small
 * secondary "Join Community - Free" / "Open Chat", and Share on the far
 * right (icon only here, 40 tap area, no background; decision 27 Oct). It goes away when the name scrolls
 * back into view. White, the header's height and bottom line.
 * Desktop (>= 1024px): the two buttons are exactly the title row's: small
 * secondary "Join Community - Free" / "Open Chat" and "Share Event" (text,
 * 40 tall pills, 8 apart). The name uses the page title's size (26/30,
 * semibold, decision 27 Oct; was 18/24) and lines up with
 * the event page's content (1120 wide, 40 sides).
 * The page passes `show` (it watches its title row).
 * Phones (< 768px, decision 27 Oct): this IS the header on event pages,
 * from the top (no scrolling needed; the Vegaz header is hidden): a back
 * arrow (UiBackButton, previous page, or Home when they arrived from a link),
 * then the name, Join Community - Free / Open Chat and the Share icon.
 * `hidden`: something covers the page (the full-screen profile).
 */
const props = defineProps<{ show: boolean; title: string; actionLabel: string; busy?: boolean; hidden?: boolean }>()
const emit = defineEmits<{ share: []; action: [] }>()
const phone = usePhoneLayout()
const on = computed(() => !props.hidden && (phone.value || props.show))
function back() {
  if (window.history.state?.back) useRouter().back()
  else navigateTo('/')
}
</script>

<template>
  <div :class="['event-sticky', { 'event-sticky--on': on }]" :aria-hidden="on ? undefined : 'true'" :inert="!on || undefined">
    <div class="event-sticky__inner">
      <UiBackButton class="event-sticky__back" @click="back" />
      <p class="event-sticky__title">{{ title }}</p>
      <div class="event-sticky__actions">
        <UiButton size="small" :color="'positive'" class="event-sticky__action" :disabled="busy" @click="emit('action')">{{ actionLabel }}</UiButton>
        <!-- Phones / tablets: icon only -->
        <button type="button" class="event-sticky__share" aria-label="Share event" @click="emit('share')">
          <img src="/images/chat/icon-share-24.svg" alt="" width="24" height="24" />
        </button>
        <!-- Desktop: the title row's "Share Event" button -->
        <UiButton size="small" color="secondary" class="event-sticky__share-web" @click="emit('share')">Share Event</UiButton>
      </div>
    </div>
  </div>
</template>

<style scoped>
.event-sticky {
  position: fixed;
  inset: 0 0 auto;
  z-index: 101; /* over the site header (100) */
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  height: var(--sizing-header-height);
  padding: 10px var(--container-inset-mobile);
  border-bottom: var(--border-width-default) solid var(--color-border-default);
  background: var(--color-background-primary);
  opacity: 0;
  visibility: hidden;
  transform: translateY(-4px);
  transition: opacity 150ms ease, transform 150ms ease, visibility 0s linear 150ms;
}
.event-sticky__inner { display: flex; align-items: center; gap: var(--spacing-sm); width: 100%; min-width: 0; }
.event-sticky__share-web { display: none; }
.event-sticky__back { margin-left: calc(-1 * var(--spacing-xs)); } /* the arrow lines up with the page edge */
@media (min-width: 768px) { .event-sticky__back { display: none; } }
/* Phones: a smaller button so it sits in balance with the name and icons
   (decision 28 Oct): 32 tall, 12 sides, 12/18 semibold */
@media (max-width: 767px) {
  .event-sticky .event-sticky__action.ui-button {
    --ui-button-min-height: 32px;
    --ui-button-pad-y: 7px;
    --ui-button-pad-x: 12px;
    font-size: 12px;
    line-height: 18px;
  }
}
/* Phones: always there, no slide-in */
@media (max-width: 767px) { .event-sticky--on { transition: none; } }
.event-sticky--on { opacity: 1; visibility: visible; transform: none; transition: opacity 150ms ease, transform 150ms ease, visibility 0s; }
.event-sticky__title {
  flex: 1;
  min-width: 0;
  margin: 0;
  overflow: hidden;
  color: var(--color-text-strong);
  font-family: var(--font-family-base);
  font-size: 16px;
  font-weight: var(--font-weight-semibold);
  line-height: 20px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.event-sticky__actions { flex: none; display: flex; align-items: center; gap: var(--spacing-xxs); margin-right: calc(-1 * var(--spacing-xs)); } /* the share icon lines up with the page edge */
.event-sticky__share { display: inline-flex; align-items: center; justify-content: center; width: 40px; height: 40px; padding: 0; border: 0; border-radius: var(--radius-pill); background: none; cursor: pointer; }
.event-sticky__share:focus-visible { outline: var(--focus-ring-width) solid var(--focus-ring-color); outline-offset: 2px; }
.event-sticky__action { white-space: nowrap; }
.event-sticky__action.ui-button--secondary { --ui-button-border-color: var(--color-border-default); }
/* "Join Community - Free" is the green active button (decision 28 Oct) */
@media (min-width: 768px) { .event-sticky { padding-inline: var(--container-inset-tablet); } }
@media (min-width: 1024px) {
  .event-sticky { padding: 0 var(--container-detail-inset-desktop); }
  .event-sticky__inner { max-width: var(--container-detail-max); margin: 0 auto; gap: var(--spacing-md); }
  .event-sticky__title { font-size: var(--text-page-title-size); font-weight: var(--text-page-title-weight); line-height: var(--text-page-title-line); letter-spacing: var(--text-page-title-tracking); } /* same as the page title */
  .event-sticky__actions { gap: var(--spacing-xs); margin-right: 0; }
  .event-sticky__share { display: none; }
  .event-sticky__share-web { display: inline-flex; flex: none; --ui-button-border-color: var(--color-border-default); }
}
@media (prefers-reduced-motion: reduce) { .event-sticky, .event-sticky--on { transition: none; transform: none; } }
</style>
