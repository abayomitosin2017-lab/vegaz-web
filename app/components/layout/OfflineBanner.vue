<script setup lang="ts">
/**
 * LayoutOfflineBanner: shows while the device has no connection
 * (decision 27 Oct; NOT IN FIGMA, PROPOSED).
 * A 36-tall bar just under the site header, full width, that stays under
 * the header while scrolling and pushes the page down (nothing is covered):
 * Grey_1 background, white 16 wifi-off icon and "You're offline. Some things
 * won't load until you reconnect." (14/20; phones just "You're offline").
 * When the connection comes back: a green dot and "You're back online" for
 * 3 seconds, then it goes. Screen readers hear each change once.
 */
const online = useOnline()
const back = ref(false)
let timer: ReturnType<typeof setTimeout> | undefined
watch(online, (on, was) => {
  clearTimeout(timer)
  back.value = on && was === false
  if (back.value) timer = setTimeout(() => { back.value = false }, 3000)
})
onBeforeUnmount(() => clearTimeout(timer))
const shown = computed(() => !online.value || back.value)
</script>

<template>
  <div class="offline-banner" role="status" aria-live="polite">
    <Transition name="offline-banner">
      <p v-if="shown" :class="['offline-banner__bar', { 'offline-banner__bar--back': back && online }]">
        <img v-if="!online" src="/images/states/icon-wifi-off-16.svg" alt="" width="16" height="16" />
        <span v-else class="offline-banner__dot" aria-hidden="true" />
        <span v-if="online">You’re back online</span>
        <span v-else>You’re offline<span class="offline-banner__more">. Some things won’t load until you reconnect.</span></span>
      </p>
    </Transition>
  </div>
</template>

<style scoped>
.offline-banner { position: sticky; top: var(--sizing-header-height); z-index: 99; }
.offline-banner__bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
  min-height: 36px;
  margin: 0;
  padding: var(--spacing-xs) var(--spacing-md);
  background: var(--color-text-strong);
  color: var(--base-white);
  font-family: var(--font-family-base);
  font-size: 14px;
  line-height: 20px;
  text-align: center;
}
.offline-banner__bar img { flex: none; }
.offline-banner__dot { flex: none; width: 8px; height: 8px; border-radius: var(--radius-pill); background: var(--color-status-success); }
@media (max-width: 767px) { .offline-banner__more { display: none; } }
.offline-banner-enter-active, .offline-banner-leave-active { transition: opacity 150ms ease, transform 150ms ease; }
.offline-banner-enter-from, .offline-banner-leave-to { opacity: 0; transform: translateY(-8px); }
@media (prefers-reduced-motion: reduce) { .offline-banner-enter-active, .offline-banner-leave-active { transition: none; } }
</style>
