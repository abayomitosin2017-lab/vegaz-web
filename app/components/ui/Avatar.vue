<script setup lang="ts">
/**
 * UiAvatar: round user picture (Figma "Avatar", Style=Photos, node 251:5638).
 *
 * - With `src`: the photo, cropped to a circle (Figma crops the photo with its
 *   top 22.5% hidden; object-position below reproduces that framing).
 * - Without `src`: a letter avatar (Figma 10679:52368): the first letter of the
 *   name in Outfit Medium on a light tint. Five colour sets; each person always
 *   gets the same one, picked from `seed` (their username) - decision 21 Oct.
 *   Figma draws the letters on 386px squares at 180px; the same ratio is kept.
 *
 * Decorative by default (alt=""): the name is always next to it or in the
 * label of the button that contains it.
 */
const props = withDefaults(
  defineProps<{
    /** Name the letter is taken from (first name) */
    name: string
    /** Stable value that picks the colour set (username) */
    seed?: string
    src?: string
    /** Diameter in px (Figma header: 40) */
    size?: number
  }>(),
  { seed: undefined, src: undefined, size: 40 },
)

const palettes = ['orange', 'purple', 'lime', 'red', 'blue'] as const

const letter = computed(() => (props.name.trim().charAt(0) || '?').toUpperCase())
const palette = computed(() => {
  const key = (props.seed ?? props.name).trim().toLowerCase()
  let sum = 0
  for (const ch of key) sum += ch.charCodeAt(0)
  return palettes[sum % palettes.length]
})

const failed = ref(false)
watch(() => props.src, () => { failed.value = false })
</script>

<template>
  <span
    :class="['ui-avatar', `ui-avatar--${palette}`]"
    :style="{ '--ui-avatar-size': `${size}px` }"
    aria-hidden="true"
  >
    <img v-if="src && !failed" class="ui-avatar__photo" :src="src" alt="" @error="failed = true" />
    <span v-else class="ui-avatar__letter">{{ letter }}</span>
  </span>
</template>

<style scoped>
.ui-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: none;
  width: var(--ui-avatar-size);
  height: var(--ui-avatar-size);
  overflow: hidden;
  border-radius: var(--radius-full);
  background: var(--ui-avatar-bg);
}
.ui-avatar--orange { --ui-avatar-bg: var(--color-avatar-orange-bg); --ui-avatar-fg: var(--color-avatar-orange-fg); }
.ui-avatar--purple { --ui-avatar-bg: var(--color-avatar-purple-bg); --ui-avatar-fg: var(--color-avatar-purple-fg); }
.ui-avatar--lime { --ui-avatar-bg: var(--color-avatar-lime-bg); --ui-avatar-fg: var(--color-avatar-lime-fg); }
.ui-avatar--red { --ui-avatar-bg: var(--color-avatar-red-bg); --ui-avatar-fg: var(--color-avatar-red-fg); }
.ui-avatar--blue { --ui-avatar-bg: var(--color-avatar-blue-bg); --ui-avatar-fg: var(--color-avatar-blue-fg); }

.ui-avatar__photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: 50% 45%;
}
.ui-avatar__letter {
  color: var(--ui-avatar-fg);
  font-family: var(--font-family-base);
  font-weight: var(--font-weight-medium);
  /* Figma ratio: 180px letter on a 386px square */
  font-size: calc(var(--ui-avatar-size) * 180 / 386);
  line-height: 1;
}
</style>
