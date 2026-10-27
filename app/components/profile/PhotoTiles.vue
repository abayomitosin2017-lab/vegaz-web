<script setup lang="ts">
import './styles.css'
/**
 * Edit Profile photos (Figma 10834:28205 empty, 10834:28288 filled).
 * Three tiles, 16 apart, 135 tall, radius 16, 2px white line.
 * Empty: Grey_6 (#F8F8F8) with a white 40px circle (24px "add image" icon)
 * and "Add Photo" (x-Small semibold, black) 16 below, centred.
 * Filled: the photo (cover) with a small white drag handle (12px icon,
 * radius 10, 2 padding) 8 from the top left.
 * Tap an empty tile to add a photo, a filled one to replace it ("Tap a
 * photo to replace it, your first photo is your main profile photo").
 * Drag the handle (or use the arrow keys on it) to change the order
 * (PROPOSED: the drag is implied by the handle, not specified).
 * Remove (decision 27 Oct, PROPOSED): a 24 round button with an X at the
 * top right of each filled tile; the next photo moves up (the first is the
 * profile photo). Problems (not a photo, over 10 MB) show one red line under
 * the tiles (utils/photoRules.ts).
 * OPEN ITEM (engineering): upload and crop.
 */
import { checkPhotos } from '~/utils/photoRules'
const photos = defineModel<string[]>({ required: true })
const MAX = 3
const file = ref<HTMLInputElement | null>(null)
const root = ref<HTMLElement | null>(null)
// tiles in screen order (template ref arrays don't keep order after a move)
const tileEls = () => [...(root.value?.querySelectorAll<HTMLElement>('.profile-photos__tile') ?? [])]
let target = 0
const live = ref('')
const problem = ref('')
function removePhoto(i: number) {
  const next = [...photos.value]
  next.splice(i, 1)
  photos.value = next
  problem.value = ''
  live.value = `Photo ${i + 1} removed${i === 0 && next.length ? '. The next photo is now your main profile photo' : ''}`
}

function pick(index: number) {
  target = Math.min(index, photos.value.length)
  file.value?.click()
}
function onFile(e: Event) {
  const el = e.target as HTMLInputElement
  const files = [...(el.files ?? [])].slice(0, 1)
  el.value = ''
  const { ok, problem: text } = checkPhotos(files, 1, MAX)
  problem.value = text
  const f = ok[0]
  if (!f) return
  const url = URL.createObjectURL(f)
  const next = [...photos.value]
  if (target < next.length) next[target] = url
  else next.push(url)
  photos.value = next.slice(0, MAX)
}

function move(from: number, to: number) {
  if (to < 0 || to >= photos.value.length || from === to) return
  const next = [...photos.value]
  const [p] = next.splice(from, 1)
  next.splice(to, 0, p!)
  photos.value = next
  live.value = `Photo moved to position ${to + 1} of ${next.length}${to === 0 ? ', now your main profile photo' : ''}`
}
function onHandleKey(i: number, e: KeyboardEvent) {
  if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); move(i, i - 1); focusHandle(i - 1) }
  else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); move(i, i + 1); focusHandle(i + 1) }
}
function focusHandle(i: number) {
  nextTick(() => tileEls()[i]?.querySelector<HTMLElement>('.profile-photos__drag')?.focus())
}

// Pointer drag: the photo follows to the tile under the pointer
let dragging = -1
function onDown(i: number, e: PointerEvent) {
  e.preventDefault()
  e.stopPropagation()
  dragging = i
  window.addEventListener('pointermove', onMove)
  window.addEventListener('pointerup', onUp, { once: true })
  window.addEventListener('pointercancel', onUp, { once: true })
}
function onMove(e: PointerEvent) {
  if (dragging < 0) return
  const over = tileEls().findIndex((t, idx) => {
    if (idx >= photos.value.length) return false
    const r = t.getBoundingClientRect()
    return e.clientX >= r.left && e.clientX <= r.right
  })
  if (over >= 0 && over !== dragging) { move(dragging, over); dragging = over }
}
function onUp() {
  dragging = -1
  window.removeEventListener('pointermove', onMove)
}
onBeforeUnmount(onUp)
</script>

<template>
  <div class="profile-photos-wrap">
  <div ref="root" class="profile-photos" role="group" aria-label="Profile photos">
    <input ref="file" class="profile-visually-hidden" type="file" accept="image/*" tabindex="-1" aria-hidden="true" @change="onFile" />
    <div v-for="n in MAX" :key="photos[n - 1] ?? `empty-${n}`" :class="['profile-photos__tile', { 'profile-photos__tile--filled': photos[n - 1] }]">
      <template v-if="photos[n - 1]">
        <button type="button" class="profile-photos__btn" :aria-label="`Replace photo ${n}${n === 1 ? ' (main profile photo)' : ''}`" @click="pick(n - 1)">
          <img class="profile-photos__img" :src="photos[n - 1]" alt="" />
        </button>
        <button
          v-if="photos.length > 1"
          type="button"
          class="profile-photos__drag"
          :aria-label="`Move photo ${n}. Use the arrow keys`"
          @pointerdown="onDown(n - 1, $event)"
          @keydown="onHandleKey(n - 1, $event)"
        ><img src="/images/profile/icon-drag-12.svg" alt="" width="12" height="12" /></button>
        <button type="button" class="profile-photos__remove" :aria-label="`Remove photo ${n}`" @click="removePhoto(n - 1)">
          <img src="/images/host/icon-close-14-light.svg" alt="" width="12" height="12" />
        </button>
      </template>
      <button v-else type="button" class="profile-photos__btn profile-photos__add" @click="pick(n - 1)">
        <span class="profile-photos__circle"><img src="/images/profile/icon-image-add-24.svg" alt="" width="24" height="24" /></span>
        <span class="profile-photos__label text-app-xsmall-semibold">Add Photo</span>
      </button>
    </div>
    <p class="profile-visually-hidden" aria-live="polite">{{ live }}</p>
  </div>
  <UiInlineAlert v-if="problem" class="profile-photos__problem" :text="problem" />
  </div>
</template>

<style scoped>
.profile-photos { display: flex; gap: var(--spacing-md); height: 135px; }
.profile-photos__tile {
  position: relative;
  box-sizing: border-box;
  flex: 1 1 0;
  min-width: 0;
  overflow: hidden;
  border: 2px solid var(--base-white);
  border-radius: 16px;
  background: var(--color-background-secondary);
}
.profile-photos__btn { display: block; width: 100%; height: 100%; padding: 0; border: 0; background: none; cursor: pointer; border-radius: 14px; }
.profile-photos__btn:focus-visible { outline: var(--focus-ring-width) solid var(--focus-ring-color); outline-offset: -4px; }
.profile-photos__img { display: block; width: 100%; height: 100%; object-fit: cover; }
.profile-photos__add { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: var(--spacing-md); }
@media (hover: hover) { .profile-photos__add:hover .profile-photos__circle { box-shadow: 0 0 0 1px var(--color-border-default); } } /* PROPOSED */
.profile-photos__circle { display: inline-flex; padding: var(--spacing-xs); border-radius: var(--radius-pill); background: var(--base-white); }
.profile-photos__label { color: #000; } /* raw black in Figma */
.profile-photos__drag {
  position: absolute;
  top: var(--spacing-xs);
  left: var(--spacing-xs);
  display: inline-flex;
  padding: 2px;
  border: 0;
  border-radius: 10px;
  background: var(--base-white);
  cursor: grab;
  touch-action: none;
}
.profile-photos-wrap { display: flex; flex-direction: column; gap: var(--spacing-xs); }
.profile-photos__remove {
  position: absolute;
  top: var(--spacing-xs);
  right: var(--spacing-xs);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  border: 0;
  border-radius: var(--radius-pill);
  background: var(--color-host-thumb-remove);
  backdrop-filter: blur(2px);
  cursor: pointer;
}
.profile-photos__remove:focus-visible { outline: var(--focus-ring-width) solid var(--focus-ring-color); outline-offset: 2px; }
.profile-photos__drag:active { cursor: grabbing; }
.profile-photos__drag:focus-visible { outline: var(--focus-ring-width) solid var(--focus-ring-color); outline-offset: 2px; }
</style>
