<script setup lang="ts">
import { checkPhotos } from '~/utils/photoRules'
import './styles.css'
import type { DraftPhoto } from '~/types/hosting'
/**
 * Event photos (Figma frames 02 and 03, "Photos (408)" column).
 *
 * Empty (02): 408 x 408 drop area (Grey_6, 1px dashed Grey_4, radius 16) with
 *   the Gallery Add icon and "Add image(s) to your event"; under it, 24px
 *   lower, an info note (Grey_6, radius 16, 4 / 8 padding): "Add up to 5
 *   photos. Click a photo to set it as your cover."
 * With photos (03): the cover at 408 x 408 (radius 16) with the crop frame
 *   (dark 80% bands: 13 / 12px at the sides, 51px top and bottom; white 10px
 *   dots at the corners) and a "Drag image around to crop" pill; info note
 *   16px below (4 / 16 padding): "Click any image below to set it as your
 *   cover image"; 24px below, a row of 75 x 80 thumbnails (radius 12, 8
 *   apart) with an 18px remove button (dark 60%, blurred) top right and a
 *   lime "Cover" chip on the cover.
 *
 * Behaviour (decisions 23 Oct): up to 5 photos, picked with the file dialog
 * or dropped on the area; any thumbnail can become the cover; the cover can
 * be dragged (or moved with the arrow keys) to choose what shows. While fewer
 * than 5 photos are added, the next slot is an "add more" tile (Grey_6,
 * dashed) carrying the grey image badge from Figma.
 * OPEN ITEMS: file size and type limits, upload, real cropping on the server.
 */
const MAX = 5
const photos = defineModel<DraftPhoto[]>('photos', { required: true })
const cover = defineModel<number>('cover', { required: true })

const input = ref<HTMLInputElement | null>(null)
const dragOver = ref(false)
const message = ref('')

const coverPhoto = computed(() => photos.value[cover.value] ?? photos.value[0])
const canAdd = computed(() => photos.value.length < MAX)

function pick() { input.value?.click() }

// Not a photo / over 10 MB / more than 5: one red line under the photos (decision 27 Oct)
const problem = ref('')
function addFiles(list: FileList | File[] | null) {
  if (!list) return
  const { ok, problem: text } = checkPhotos([...list], MAX - photos.value.length, MAX)
  const added = ok.map(f => ({ id: crypto.randomUUID(), url: URL.createObjectURL(f), focusX: 50, focusY: 50 }))
  photos.value = [...photos.value, ...added]
  problem.value = text
  if (added.length) message.value = `${added.length} photo${added.length === 1 ? '' : 's'} added.`
}
function onInput(e: Event) {
  const el = e.target as HTMLInputElement
  addFiles(el.files)
  el.value = ''
}
function onDrop(e: DragEvent) {
  dragOver.value = false
  addFiles(e.dataTransfer?.files ?? null)
}

function remove(i: number) {
  const next = [...photos.value]
  const [gone] = next.splice(i, 1)
  if (gone) URL.revokeObjectURL(gone.url)
  photos.value = next
  if (cover.value === i) cover.value = 0
  else if (cover.value > i) cover.value -= 1
  message.value = 'Photo removed.'
}
function setCover(i: number) {
  cover.value = i
  message.value = `Photo ${i + 1} is now the cover.`
}

// ---- crop: drag the cover to move what shows ----
let start: { x: number; y: number; fx: number; fy: number } | null = null
function updateFocus(fx: number, fy: number) {
  const i = photos.value.indexOf(coverPhoto.value!)
  if (i < 0) return
  const next = [...photos.value]
  next[i] = { ...next[i]!, focusX: Math.max(0, Math.min(100, fx)), focusY: Math.max(0, Math.min(100, fy)) }
  photos.value = next
}
function onPointerDown(e: PointerEvent) {
  if (!coverPhoto.value) return
  start = { x: e.clientX, y: e.clientY, fx: coverPhoto.value.focusX, fy: coverPhoto.value.focusY }
  ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
}
function onPointerMove(e: PointerEvent) {
  if (!start) return
  // Dragging right shows more of the left side, like moving the photo itself
  updateFocus(start.fx - ((e.clientX - start.x) / 408) * 100, start.fy - ((e.clientY - start.y) / 408) * 100)
}
function onPointerUp() { start = null }
function onKey(e: KeyboardEvent) {
  const p = coverPhoto.value
  if (!p) return
  const step = 5
  const moves: Record<string, [number, number]> = { ArrowLeft: [step, 0], ArrowRight: [-step, 0], ArrowUp: [0, step], ArrowDown: [0, -step] }
  const m = moves[e.key]
  if (!m) return
  e.preventDefault()
  updateFocus(p.focusX + m[0], p.focusY + m[1])
}
</script>

<template>
  <div class="host-photos">
    <input ref="input" class="host-visually-hidden" type="file" accept="image/*" multiple tabindex="-1" aria-hidden="true" @change="onInput" />

    <template v-if="!photos.length">
      <button
        type="button"
        :class="['host-photos__drop', { 'host-photos__drop--over': dragOver }]"
        @click="pick"
        @dragover.prevent="dragOver = true"
        @dragleave="dragOver = false"
        @drop.prevent="onDrop"
      >
        <img src="/images/host/icon-gallery-add-24.svg" alt="" width="24" height="24" />
        <span class="text-app-small-semibold">Add image(s) to your event</span>
      </button>
      <p class="host-photos__note host-photos__note--empty text-app-small-regular">
        <img src="/images/host/icon-info-24.svg" alt="" width="24" height="24" />
        Add up to 5 photos. Click a photo to set it as your cover.
      </p>
    </template>

    <template v-else>
      <div class="host-photos__top">
        <div
          class="host-photos__cover"
          role="img"
          tabindex="0"
          :aria-label="`Cover photo. Drag, or use the arrow keys, to choose what shows.`"
          @pointerdown="onPointerDown"
          @pointermove="onPointerMove"
          @pointerup="onPointerUp"
          @pointercancel="onPointerUp"
          @keydown="onKey"
        >
          <img :src="coverPhoto!.url" alt="" draggable="false" :style="{ objectPosition: `${coverPhoto!.focusX}% ${coverPhoto!.focusY}%` }" />
          <span class="host-photos__band host-photos__band--l" aria-hidden="true" />
          <span class="host-photos__band host-photos__band--r" aria-hidden="true" />
          <span class="host-photos__band host-photos__band--t" aria-hidden="true" />
          <span class="host-photos__band host-photos__band--b" aria-hidden="true" />
          <span v-for="c in ['tl', 'tr', 'bl', 'br']" :key="c" :class="['host-photos__dot', `host-photos__dot--${c}`]" aria-hidden="true" />
          <span class="host-photos__hint text-app-xsmall-semibold" aria-hidden="true">Drag image around to crop</span>
        </div>
        <p class="host-photos__note text-app-small-regular">
          <img src="/images/host/icon-info-24.svg" alt="" width="24" height="24" />
          <span class="host-photos__web">Click any image below to set it as your cover image</span>
          <span class="host-photos__phone">Tap any image below to set it as your cover image</span>
        </p>
      </div>

      <ul class="host-photos__thumbs" aria-label="Photos">
        <li v-for="(p, i) in photos" :key="p.id" class="host-photos__thumb">
          <button type="button" class="host-photos__thumb-btn" :aria-pressed="i === cover" :aria-label="i === cover ? `Photo ${i + 1}, cover` : `Make photo ${i + 1} the cover`" @click="setCover(i)">
            <img :src="p.url" alt="" />
          </button>
          <span v-if="i === cover" class="host-photos__chip text-app-xsmall-semibold" aria-hidden="true">
            <img src="/images/host/icon-gallery-16.svg" alt="" width="16" height="16" />Cover
          </span>
          <button type="button" class="host-photos__remove" :aria-label="`Remove photo ${i + 1}`" @click="remove(i)">
            <img src="/images/host/icon-close-14-light.svg" alt="" width="12" height="12" />
          </button>
        </li>
        <li v-if="canAdd" class="host-photos__thumb">
          <button
            type="button"
            class="host-photos__add"
            :aria-label="`Add photos (${photos.length} of 5)`"
            @click="pick"
            @dragover.prevent
            @drop.prevent="onDrop"
          >
            <img src="/images/host/icon-gallery-add-24.svg" alt="" width="24" height="24" />
          </button>
          <img class="host-photos__badge" src="/images/host/badge-add-photo-25.svg" alt="" width="25" height="25" />
        </li>
      </ul>
    </template>
    <UiInlineAlert v-if="problem" class="host-photos__problem" :text="problem" />
    <p class="host-visually-hidden" aria-live="polite">{{ message }}</p>
  </div>
</template>

<style scoped>
.host-photos { display: flex; flex-direction: column; gap: var(--spacing-lg); width: var(--sizing-host-photo); max-width: 100%; }
.host-photos__drop {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
  width: 100%;
  aspect-ratio: 1;
  border: var(--border-width-default) dashed var(--color-border-strong);
  border-radius: 16px;
  background: var(--color-background-secondary);
  color: var(--color-text-option);
  font: inherit;
  cursor: pointer;
  transition: border-color 150ms ease, background-color 150ms ease;
}
.host-photos__drop:hover, .host-photos__drop--over { border-color: var(--color-action-primary); }
.host-photos__drop:focus-visible { outline: var(--focus-ring-width) solid var(--focus-ring-color); outline-offset: var(--focus-ring-offset); }

.host-photos__note {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  margin: 0;
  padding: var(--spacing-xxs) var(--spacing-md);
  border-radius: 16px;
  background: var(--color-background-secondary);
  color: var(--color-host-note);
}
.host-photos__note--empty { padding: var(--spacing-xxs) var(--spacing-xs); }
.host-photos__note img { flex: none; }

.host-photos__top { display: flex; flex-direction: column; gap: var(--spacing-md); }
.host-photos__cover {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  overflow: hidden;
  border-radius: 16px;
  background: var(--color-placeholder-media);
  cursor: grab;
  touch-action: none;
  user-select: none;
}
.host-photos__cover:active { cursor: grabbing; }
.host-photos__cover:focus-visible { outline: var(--focus-ring-width) solid var(--focus-ring-color); outline-offset: var(--focus-ring-offset); }
.host-photos__cover > img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; pointer-events: none; }
.host-photos__band { position: absolute; background: var(--color-host-crop-shade); pointer-events: none; }
.host-photos__band--l { left: 0; top: 0; bottom: 0; width: 13px; }
.host-photos__band--r { right: 0; top: 0; bottom: 0; width: 12px; }
.host-photos__band--t { top: 0; left: 13px; right: 12px; height: 51px; }
.host-photos__band--b { bottom: 0; left: 13px; right: 12px; height: 51px; }
.host-photos__dot { position: absolute; width: 10px; height: 10px; border-radius: 50%; background: var(--base-white); transform: translate(-50%, -50%); }
.host-photos__dot--tl { left: 13px; top: 51px; }
.host-photos__dot--tr { left: calc(100% - 12px); top: 51px; }
.host-photos__dot--bl { left: 13px; top: calc(100% - 51px); }
.host-photos__dot--br { left: calc(100% - 12px); top: calc(100% - 51px); }
.host-photos__hint {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  padding: var(--spacing-xxs) var(--spacing-xs);
  border-radius: var(--radius-pill);
  background: var(--base-white);
  color: var(--color-text-primary);
  white-space: nowrap;
  pointer-events: none;
}

.host-photos__thumbs { display: flex; gap: var(--spacing-xs); margin: 0; padding: 0 0 11px; list-style: none; }
.host-photos__thumb { position: relative; flex: none; width: 75px; height: 80px; }
.host-photos__thumb-btn, .host-photos__add {
  display: block;
  width: 100%;
  height: 100%;
  padding: 0;
  overflow: hidden;
  border: 0;
  border-radius: var(--radius-md);
  background: var(--color-placeholder-media);
  cursor: pointer;
}
.host-photos__thumb-btn img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform var(--duration-image-zoom) var(--ease-out-strong); }
.host-photos__thumb-btn:hover img { transform: scale(var(--scale-image-zoom)); }
.host-photos__thumb-btn:focus-visible, .host-photos__add:focus-visible, .host-photos__remove:focus-visible { outline: var(--focus-ring-width) solid var(--focus-ring-color); outline-offset: var(--focus-ring-offset); }
.host-photos__add {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  border: var(--border-width-default) dashed var(--color-border-strong);
  background: var(--color-background-secondary);
}
.host-photos__add:hover { border-color: var(--color-action-primary); }
.host-photos__chip {
  position: absolute;
  left: 6px;
  top: 69px;
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xxs);
  padding: var(--spacing-micro) var(--spacing-compact) var(--spacing-micro) var(--spacing-xxs);
  border: var(--border-width-default) solid var(--base-white);
  border-radius: var(--radius-pill);
  background: var(--color-host-cover-chip);
  color: var(--color-text-primary);
  pointer-events: none;
}
.host-photos__problem { margin-top: var(--spacing-xs); }
.host-photos__remove {
  position: absolute;
  left: 53px;
  top: 3px;
  display: inline-flex;
  padding: var(--spacing-micro);
  border: 0;
  border-radius: var(--radius-pill);
  background: var(--color-host-thumb-remove);
  backdrop-filter: blur(2px);
  cursor: pointer;
}
.host-photos__badge {
  position: absolute;
  left: 26px;
  top: 68px;
  width: 25px;
  height: 25px;
  pointer-events: none;
}
/* Phones (Figma mobile Create New Edition 10754:73664): the cover is 325 x
   402 (it fills the width), the note says "Tap", the thumbnails scroll
   sideways */
.host-photos__phone { display: none; }
@media (max-width: 767px) {
  .host-photos { width: 100%; }
  .host-photos__drop, .host-photos__cover { aspect-ratio: 1; } /* square on phones (decision 26 Oct) */
  .host-photos__web { display: none; }
  .host-photos__phone { display: inline; }
  .host-photos__thumbs { overflow-x: auto; margin-right: calc(-1 * var(--container-inset-mobile)); padding-right: var(--container-inset-mobile); scrollbar-width: none; }
  .host-photos__thumbs::-webkit-scrollbar { display: none; }
}
@media (prefers-reduced-motion: reduce) { .host-photos__thumb-btn img { transition: none; } }
</style>
