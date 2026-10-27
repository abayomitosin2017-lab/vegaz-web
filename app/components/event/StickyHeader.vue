<script setup lang="ts">
/**
 * EventStickyHeader: phones and tablets (< 1024px, decision 27 Oct). Once the
 * event's name has scrolled up behind the site header, this bar takes the
 * header's place: the event name on the left (one line, "..." when long),
 * then on the right the same buttons as the desktop title row: the small
 * secondary "Join Community - Free" / "Open Chat", and Share on the far
 * right (icon only here, 40 tap area, no background; decision 27 Oct). It goes away when the name scrolls
 * back into view. White, the header's height and bottom line.
 * The page passes `show` (it watches its title row).
 */
defineProps<{ show: boolean; title: string; actionLabel: string; busy?: boolean }>()
const emit = defineEmits<{ share: []; action: [] }>()
</script>

<template>
  <div :class="['event-sticky', { 'event-sticky--on': show }]" :aria-hidden="show ? undefined : 'true'" :inert="!show || undefined">
    <p class="event-sticky__title">{{ title }}</p>
    <div class="event-sticky__actions">
      <UiButton size="small" color="secondary" class="event-sticky__action" :disabled="busy" @click="emit('action')">{{ actionLabel }}</UiButton>
      <button type="button" class="event-sticky__share" aria-label="Share event" @click="emit('share')">
        <img src="/images/chat/icon-share-24.svg" alt="" width="24" height="24" />
      </button>
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
.event-sticky__action { --ui-button-border-color: var(--color-border-default); white-space: nowrap; }
@media (min-width: 768px) { .event-sticky { padding-inline: var(--container-inset-tablet); } }
@media (min-width: 1024px) { .event-sticky { display: none; } }
@media (prefers-reduced-motion: reduce) { .event-sticky, .event-sticky--on { transition: none; transform: none; } }
</style>
