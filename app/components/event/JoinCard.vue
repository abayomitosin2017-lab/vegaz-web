<script setup lang="ts">
/**
 * EventJoinCard: "Not ready to buy a ticket? Join our community." (Figma
 * phone frame only; desktop has the "Join Community - Free" button by the
 * title). Figma 10656:48775 (26 Oct): no longer a card: no shadow, no
 * rounded corners, a 1px Grey_5 line above and below, 16px padding, 16px gap.
 * Text follows the current type system.
 * Title 20/26 bold -0.2; note Small regular Grey_3; full-width Grey_6 small
 * button "Join Community for free". Joining opens the event's chat
 * (decision 22 Oct).
 */
defineProps<{ busy?: boolean }>()
const emit = defineEmits<{ join: [] }>()
</script>

<template>
  <section class="join-card" aria-labelledby="join-card-title">
    <div class="join-card__text">
      <h2 id="join-card-title" class="join-card__title">Not ready to buy a ticket? Join our community.</h2>
      <p class="join-card__note text-small-regular">Join for free to get updates and announcements about this event, and never miss out.</p>
    </div>
    <UiButton size="small" color="secondary" class="join-card__button" :disabled="busy" @click="emit('join')">Join Community for free</UiButton>
  </section>
</template>

<style scoped>
.join-card {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  border-block: var(--border-width-default) solid var(--color-border-default);
  background: var(--color-background-primary);
}
.join-card__text { display: flex; flex-direction: column; gap: var(--spacing-xs); }
.join-card__title {
  max-width: 266px;
  margin: 0;
  color: var(--color-text-primary);
  font-weight: var(--text-app-h3-semibold-weight); font-size: var(--text-app-h3-semibold-size); line-height: var(--text-app-h3-semibold-line); letter-spacing: var(--text-app-h3-semibold-tracking);
}
.join-card__note { margin: 0; color: var(--color-text-muted); }
.join-card__button { width: 100%; --ui-button-pad-y: 10px; }
</style>
