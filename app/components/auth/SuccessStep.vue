<script setup lang="ts">
/** Step 5 (signup only): "Account Setup Successful" (Figma 9870:63055). */
import './styles.css'

defineProps<{ titleId: string }>()
const emit = defineEmits<{ explore: []; download: [] }>()
</script>

<template>
  <div class="auth-success">
    <div class="auth-success__top">
      <!-- Figma: 96px ring, 2px Positive green, 48px badge centred -->
      <span class="auth-success__ring" aria-hidden="true">
        <img src="/images/auth/verified-check.svg" alt="" width="48" height="48" />
      </span>
      <div class="auth-success__text">
        <h2 :id="titleId" class="auth-success__title">Account Setup Successful</h2>
        <p class="auth-success__body text-small-regular">
          Your account is all set. Download the Vegaz app to complete your onboarding, add a profile photo, and start exploring.
        </p>
      </div>
    </div>
    <div class="auth-actions">
      <UiButton color="secondary" text-style="web" @click="emit('download')">Download App</UiButton>
      <UiButton text-style="web" data-autofocus @click="emit('explore')">Start exploring</UiButton>
    </div>
  </div>
</template>

<style scoped>
.auth-success { display: flex; flex-direction: column; align-items: center; gap: var(--spacing-lg); width: 100%; }
/* Figma mobile success card uses 17px top/bottom padding (16 elsewhere) */
@media (max-width: 767px) { .auth-success { padding-block: 1px; } }
.auth-success__top { display: flex; flex-direction: column; align-items: center; gap: var(--spacing-md); width: 100%; }
.auth-success__ring {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 96px;
  height: 96px;
  border: var(--border-width-emphasis) solid var(--color-status-success);
  border-radius: 96px;
}
.auth-success__ring img { width: var(--sizing-control-standard); height: var(--sizing-control-standard); }
.auth-success__text { display: flex; flex-direction: column; gap: 18px; width: 100%; text-align: center; }
/* Figma: semibold 24/32 -0.5 on mobile, bold 24/32 -0.2 on desktop; Grey_1 */
.auth-success__title {
  margin: 0;
  color: var(--color-text-strong);
  font-family: var(--font-family-base);
  font-weight: var(--text-modal-title-weight);
  font-size: var(--text-modal-title-size);
  line-height: var(--text-modal-title-line);
  letter-spacing: var(--text-modal-title-tracking);
}
.auth-success__body { color: var(--color-text-secondary); } /* body Grey_2 (decision 27 Oct) */
</style>
