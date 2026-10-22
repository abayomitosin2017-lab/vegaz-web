<script setup lang="ts">
/**
 * DEV PREVIEW (not an app screen): the event gallery with any number of
 * photos, to check every layout (1-3 band, strip, leftovers, fill to the
 * edge). Same width as the event page. `?n=7` opens with 7 photos.
 * Remove or protect this route before release.
 */
definePageMeta({ layout: false })
useHead({ title: 'Gallery stress test (preview)', meta: [{ name: 'robots', content: 'noindex' }] })

// Flier first, then the demo stock photos (paths written out in full)
const pool = [
  '/images/events/flier-bloom.jpg',
  '/images/event-photos/bloom-1.jpg', '/images/event-photos/bloom-2.jpg', '/images/event-photos/bloom-3.jpg',
  '/images/event-photos/bloom-4.jpg', '/images/event-photos/party-1.jpg', '/images/event-photos/party-2.jpg',
  '/images/event-photos/party-3.jpg', '/images/event-photos/party-4.jpg', '/images/event-photos/party-5.jpg',
  '/images/event-photos/beach-1.jpg', '/images/event-photos/beach-2.jpg', '/images/event-photos/beach-3.jpg',
  '/images/event-photos/beach-4.jpg', '/images/event-photos/obudu-1.jpg', '/images/event-photos/obudu-2.jpg',
  '/images/event-photos/obudu-3.jpg', '/images/event-photos/picnic-1.jpg', '/images/event-photos/picnic-2.jpg',
  '/images/event-photos/allwhite-1.jpg',
]
const route = useRoute()
const n = ref(Math.min(20, Math.max(1, Number(route.query.n) || 6)))
const photos = computed(() => pool.slice(0, n.value))
</script>

<template>
  <main class="gallery-test">
    <div class="gallery-test__bar">
      <span class="text-small-semibold">Photos: {{ n }}</span>
      <button type="button" :disabled="n <= 1" @click="n--">−</button>
      <button type="button" :disabled="n >= 20" @click="n++">+</button>
    </div>
    <EventGallery :photos="photos" title="Gallery test" />
  </main>
</template>

<style scoped>
.gallery-test {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  max-width: calc(1140px + 2 * var(--container-inset-desktop));
  margin-inline: auto;
  padding: var(--spacing-xl) var(--container-inset-mobile);
}
.gallery-test__bar { display: flex; align-items: center; gap: var(--spacing-sm); }
.gallery-test__bar button { min-width: 44px; min-height: 44px; font-size: 20px; }
@media (min-width: 768px) { .gallery-test { padding-inline: var(--container-inset-tablet); } }
@media (min-width: 1024px) { .gallery-test { padding-inline: var(--container-inset-desktop); } }
</style>
