<script setup lang="ts">
/** Top row of every onboarding modal: icon in a white bubble, close (X) on the right. */
defineProps<{ icon: string }>()
const emit = defineEmits<{ close: [] }>()
</script>

<template>
  <div class="auth-head">
    <span class="auth-head__bubble" aria-hidden="true">
      <img :src="icon" alt="" width="24" height="24" />
    </span>
    <button type="button" class="auth-head__close" aria-label="Close" @click="emit('close')">
      <img src="/images/auth/icon-close.svg" alt="" width="20" height="20" />
    </button>
  </div>
</template>

<style scoped>
.auth-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  width: 100%;
}
/* Figma: white circle, 16px padding around a 24px icon, soft 0 4 12 shadow */
.auth-head__bubble {
  display: inline-flex;
  padding: var(--spacing-md);
  border-radius: 400px;
  background: var(--color-background-primary);
  box-shadow: var(--shadow-icon-bubble);
}
.auth-head__bubble img { width: var(--sizing-icon-standard); height: var(--sizing-icon-standard); }
/* 20px icon as in Figma; the tap area is enlarged without moving it */
.auth-head__close {
  display: inline-flex;
  margin: calc(-1 * var(--spacing-sm));
  padding: var(--spacing-sm);
  border: 0;
  border-radius: 50%;
  background: transparent;
  cursor: pointer;
}
.auth-head__close img { width: 20px; height: 20px; }
.auth-head__close:focus-visible {
  outline: var(--focus-ring-width) solid var(--focus-ring-color);
  outline-offset: calc(-1 * var(--spacing-xxs));
}
</style>
