<script setup lang="ts">
/**
 * ChatEmpty: the right-hand area when no conversation is showing.
 * Not in Figma: designed from existing styles (approved 21 Oct).
 *   select: the user has chats but hasn't opened one
 *   none:   the user has no event chats yet; offers "Explore events"
 * Look: Grey_6 panel (radius 24, like the conversation body), a 56px white
 * circle with a 24px chat icon (the onboarding icon style), a 24/32 bold title
 * and a Web Small Grey_3 line, centred.
 */
const props = defineProps<{ variant: 'select' | 'none' }>()

const copy = computed(() =>
  props.variant === 'none'
    ? { title: 'Join an event to start chatting', body: 'Every event you join has a group chat. It will show up here.' }
    : { title: 'Select a chat to start messaging', body: 'Pick an event chat on the left to see what everyone’s saying.' },
)
</script>

<template>
  <section class="chat-empty" aria-live="polite">
    <span class="chat-empty__bubble" aria-hidden="true">
      <img src="/images/chat/icon-chat-24.svg" alt="" width="24" height="24" />
    </span>
    <div class="chat-empty__text">
      <h2 class="chat-empty__title">{{ copy.title }}</h2>
      <p class="chat-empty__body text-small-regular">{{ copy.body }}</p>
    </div>
    <UiButton v-if="variant === 'none'" text-style="web" @click="navigateTo('/events')">Explore events</UiButton>
  </section>
</template>

<style scoped>
.chat-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-lg);
  min-height: 0;
  padding: var(--spacing-lg);
  border-radius: var(--radius-lg);
  background: var(--color-background-secondary);
  text-align: center;
}
.chat-empty__bubble {
  display: inline-flex;
  padding: var(--spacing-md);
  border-radius: var(--radius-full);
  background: var(--color-background-primary);
  box-shadow: var(--shadow-icon-bubble);
}
.chat-empty__text { display: flex; flex-direction: column; gap: var(--spacing-xxs); max-width: 360px; }
.chat-empty__title {
  margin: 0;
  color: var(--color-text-heading-strong);
  font-family: var(--font-family-base);
  font-weight: var(--font-weight-bold);
  font-size: var(--text-modal-title-size);
  line-height: var(--text-modal-title-line);
  letter-spacing: var(--text-modal-title-tracking);
}
.chat-empty__body { margin: 0; color: var(--color-text-muted); }
</style>
