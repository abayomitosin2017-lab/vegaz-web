<script setup lang="ts">
/**
 * EventGallery: the event's photos (Figma event details; gallery updated by
 * design 22 Oct, node 10724:67468). The flier is always the first photo.
 * Tapping a photo emits `open` with its index (the page opens the viewer).
 *
 * Desktop/tablet (decision 22 Oct):
 *   1-3 photos: centred on a band filled with the flier, heavily blurred
 *   (25px) under a 50% black layer, radius 24, 24px padding.
 *     1: the flier, 300 x 408
 *     2: two 300 x 408, 16px apart
 *     3: the flier 300 x 354, then two 144 x 171 stacked (12px apart), 16px gap
 *   4+ photos: a strip 354px tall that scrolls sideways:
 *     flier 300 x 354 | 2 x 2 group (144 x 171 each) | 354 square | 2 x 2 ...
 *     Gaps 12, radius 24. Leftovers never leave a 2 x 2 half empty
 *     (1 -> big square, 2 -> two stacked, 3 -> stacked + big square), and
 *     when the photos don't fill the width the blocks widen to the edge
 *     (decision 22 Oct).
 * Phones (decision 22 Oct): never the blurred band; all tiles square.
 *   1-3 photos (arrangement from Figma 7335:7422), radius 24, no
 *   "Open Gallery" tile:
 *     1: one 300px square, centred
 *     2: two 300px squares, 12px apart, scrolling sideways
 *     3: a 300px square + two 144px squares stacked, scrolling sideways
 *   4+ photos (Figma phone frame): 196px strip, 196 big and 94 small
 *     squares, gaps 8, radius 12, ending with the "Open Gallery" tile
 *     (three tilted thumbnails + label), which opens the viewer.
 *   Photos darken slightly toward the bottom (Figma phone frames).
 *
 * Not in Figma (proposed): round previous/next buttons on desktop when the
 * strip can scroll; it also scrolls with trackpad, touch and keyboard (each
 * photo is a button).
 * FLAG: Figma has hidden "Party" and "1/3" chips on some photos; not shown.
 */
const props = defineProps<{ photos: string[]; title: string }>()
const emit = defineEmits<{ open: [index: number] }>()

const phone = usePhoneLayout()

type Tile = { kind: 'photo'; src: string; index: number } | { kind: 'more' }
type Group = { kind: 'lead' | 'big' | 'quad' | 'stack'; tiles: Tile[] }

const groups = computed<Group[]>(() => {
  const tiles: Tile[] = props.photos.map((src, index) => ({ kind: 'photo', src, index }))
  // Phones with 2-3 photos: big square(s), or a big square + two stacked
  if (phone.value && tiles.length === 2) return tiles.map(t => ({ kind: 'big', tiles: [t] }))
  if (phone.value && tiles.length === 3) return [{ kind: 'big', tiles: [tiles[0]!] }, { kind: 'stack', tiles: tiles.slice(1) }]
  if (phone.value) tiles.push({ kind: 'more' })
  // flier, then 2 x 2 groups and big squares in turn
  const out: Group[] = [{ kind: 'lead', tiles: tiles.slice(0, 1) }]
  let i = 1
  for (let p = 0; i < tiles.length; p++) {
    const kind = p % 2 === 0 ? 'quad' : 'big'
    const take = tiles.slice(i, i + (kind === 'quad' ? 4 : 1))
    i += take.length
    // Never leave a 2 x 2 block half empty (decision 22 Oct):
    // 1 left -> big square, 2 -> two stacked, 3 -> two stacked + big square
    if (kind === 'quad' && take.length < 4) {
      if (take.length === 1) out.push({ kind: 'big', tiles: take })
      else out.push({ kind: 'stack', tiles: take.slice(0, 2) })
      if (take.length === 3) out.push({ kind: 'big', tiles: take.slice(2) })
      continue
    }
    out.push({ kind, tiles: take })
  }
  return out
})

// Phones never use the blurred band (decision 22 Oct)
const layout = computed(() => {
  const n = props.photos.length
  if (phone.value) return n <= 1 ? 'phone-one' : 'strip'
  return ['one', 'one', 'two', 'three'][n] ?? 'strip'
})
/** Phones with 2-3 photos use the taller Figma 7335:7422 strip */
const tall = computed(() => phone.value && props.photos.length <= 3)

function label(index: number) {
  return `Open photo ${index + 1} of ${props.photos.length}`
}

// Desktop arrows: shown only when the strip can scroll that way
const strip = ref<HTMLElement | null>(null)
const canPrev = ref(false)
const canNext = ref(false)
function updateArrows() {
  const el = strip.value
  if (!el) return
  canPrev.value = el.scrollLeft > 1
  canNext.value = el.scrollLeft + el.clientWidth < el.scrollWidth - 1
}
function scrollBy(dir: 1 | -1) {
  const el = strip.value
  if (el) el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: 'smooth' })
}
let resize: ResizeObserver | undefined
onMounted(() => {
  updateArrows()
  if (strip.value) {
    resize = new ResizeObserver(updateArrows)
    resize.observe(strip.value)
  }
})
watch(() => [props.photos.length, phone.value], () => nextTick(updateArrows))
onBeforeUnmount(() => resize?.disconnect())
</script>

<template>
  <section class="event-gallery" :aria-label="`Photos of ${title}`">
    <!-- Phones, 1 photo: centred portrait -->
    <div v-if="layout === 'phone-one'" class="event-gallery__single">
      <button type="button" class="event-gallery__tile event-gallery__tile--faded" :aria-label="label(0)" @click="emit('open', 0)">
        <img v-if="photos[0]" :src="photos[0]" alt="" draggable="false" />
      </button>
    </div>

    <!-- 1-3 photos (desktop/tablet): centred on the blurred flier -->
    <div v-else-if="layout !== 'strip'" :class="['event-gallery__band', `event-gallery__band--${layout}`]">
      <img v-if="photos[0]" class="event-gallery__backdrop" :src="photos[0]" alt="" aria-hidden="true" draggable="false" />
      <button
        v-if="photos[0]"
        type="button"
        class="event-gallery__tile event-gallery__lead"
        :aria-label="label(0)"
        @click="emit('open', 0)"
      >
        <img :src="photos[0]" alt="" draggable="false" />
      </button>
      <span v-else class="event-gallery__tile event-gallery__lead" aria-hidden="true" />
      <button v-if="layout === 'two'" type="button" class="event-gallery__tile event-gallery__lead" :aria-label="label(1)" @click="emit('open', 1)">
        <img :src="photos[1]" alt="" draggable="false" />
      </button>
      <span v-if="layout === 'three'" class="event-gallery__pair">
        <button v-for="i in [1, 2]" :key="i" type="button" class="event-gallery__tile" :aria-label="label(i)" @click="emit('open', i)">
          <img :src="photos[i]" alt="" draggable="false" />
        </button>
      </span>
    </div>

    <!-- 4+ photos: sideways strip -->
    <div v-else :class="['event-gallery__viewport', { 'event-gallery__viewport--tall': tall }]">
      <div ref="strip" class="event-gallery__strip" @scroll.passive="updateArrows">
        <div v-for="(g, gi) in groups" :key="gi" :class="['event-gallery__group', `event-gallery__group--${g.kind}`]">
          <template v-for="(t, ti) in g.tiles" :key="ti">
            <button
              v-if="t.kind === 'photo'"
              type="button"
              class="event-gallery__tile"
              :aria-label="label(t.index)"
              @click="emit('open', t.index)"
            >
              <img :src="t.src" alt="" draggable="false" />
            </button>
            <button v-else type="button" class="event-gallery__tile event-gallery__more" @click="emit('open', 0)">
              <span class="event-gallery__thumbs" aria-hidden="true">
                <img v-for="n in 3" :key="n" :src="photos[n - 1] ?? photos[0]" alt="" draggable="false" />
              </span>
              <span class="event-gallery__more-label text-xsmall-regular">Open Gallery</span>
            </button>
          </template>
        </div>
      </div>
      <button v-if="canPrev" type="button" class="event-gallery__arrow event-gallery__arrow--prev" aria-label="Previous photos" @click="scrollBy(-1)">
        <img src="/images/chat/icon-arrow-left-20.svg" alt="" width="20" height="20" />
      </button>
      <button v-if="canNext" type="button" class="event-gallery__arrow event-gallery__arrow--next" aria-label="More photos" @click="scrollBy(1)">
        <img src="/images/chat/icon-arrow-left-20.svg" alt="" width="20" height="20" />
      </button>
    </div>
  </section>
</template>

<style scoped>
.event-gallery {
  /* Desktop sizes (Figma 10724:67468) */
  --gallery-height: 354px;
  --gallery-lead: 300px;      /* flier width in the strip */
  --gallery-col: 144px;       /* 2 x 2 group column */
  --gallery-gap: var(--spacing-sm);
  --gallery-radius: var(--radius-lg);
  width: 100%;
  min-width: 0;
}

.event-gallery__tile {
  position: relative;
  display: block;
  padding: 0;
  border: 0;
  overflow: hidden;
  border-radius: var(--gallery-radius);
  background: var(--color-placeholder-media);
  cursor: zoom-in;
}
.event-gallery__tile > img {
  position: absolute; /* the photo never sets the tile's size */
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.event-gallery__tile:focus-visible,
.event-gallery__arrow:focus-visible {
  outline: var(--focus-ring-width) solid var(--focus-ring-color);
  outline-offset: var(--focus-ring-offset);
}

/* ---- 1-3 photos: blurred flier band ---- */
.event-gallery__band {
  position: relative;
  isolation: isolate;
  display: flex;
  justify-content: center;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  overflow: hidden;
  border-radius: var(--radius-lg);
  background: var(--color-surface-inverse);
}
.event-gallery__backdrop {
  position: absolute;
  inset: -50px; /* blur would leave light edges at the borders */
  z-index: -1;
  width: calc(100% + 100px);
  height: calc(100% + 100px);
  object-fit: cover;
  filter: blur(25px) brightness(0.5); /* Figma: 25px blur under 50% black */
}
.event-gallery__lead { flex: 0 1 var(--gallery-lead); aspect-ratio: 300 / 408; }
.event-gallery__band--three .event-gallery__lead { aspect-ratio: 300 / 354; }
.event-gallery__pair {
  flex: 0 1 var(--gallery-col);
  display: grid;
  grid-template-rows: 1fr 1fr;
  gap: var(--spacing-sm);
}

/* ---- 4+ photos: sideways strip ---- */
.event-gallery__viewport { position: relative; }
.event-gallery__strip {
  display: flex;
  gap: var(--gallery-gap);
  height: var(--gallery-height);
  overflow-x: auto;
  overscroll-behavior-x: contain;
  scroll-snap-type: x proximity;
  scrollbar-width: none;
}
.event-gallery__strip::-webkit-scrollbar { display: none; }
.event-gallery__group { flex: none; display: grid; gap: var(--gallery-gap); scroll-snap-align: start; }
.event-gallery__group--lead { width: var(--gallery-lead); }
.event-gallery__group--big { width: var(--gallery-height); }
.event-gallery__group--stack { width: var(--gallery-col); grid-template-rows: 1fr 1fr; }
.event-gallery__group--quad {
  grid-template-columns: repeat(2, var(--gallery-col));
  grid-template-rows: 1fr 1fr;
  grid-auto-flow: column; /* fills column by column, like Figma */
}

/* Desktop/tablet: when the photos don't fill the width, every block widens in
   proportion so the strip always reaches the right edge (decision 22 Oct).
   With enough photos to scroll, nothing grows and Figma sizes are kept. */
@media (min-width: 768px) {
  .event-gallery__group--lead { flex: 300 0 var(--gallery-lead); width: auto; }
  .event-gallery__group--big { flex: 354 0 var(--gallery-height); width: auto; }
  .event-gallery__group--stack { flex: 144 0 var(--gallery-col); width: auto; }
  .event-gallery__group--quad {
    flex: 300 0 calc(2 * var(--gallery-col) + var(--gallery-gap));
    grid-template-columns: 1fr 1fr;
  }
}

/* "Open Gallery" tile (phones, Figma) */
.event-gallery__more {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xxs);
  background: var(--color-avatar-more);
  cursor: pointer;
}
.event-gallery__thumbs { position: relative; width: 56px; height: 32px; }
.event-gallery__thumbs img {
  position: absolute;
  top: 4px;
  width: 24px;
  height: 24px;
  border: 2px solid var(--color-background-primary);
  border-radius: 6px;
  object-fit: cover;
  box-shadow: 0 1.5px 9px rgba(0, 0, 0, 0.25);
}
.event-gallery__thumbs img:nth-child(1) { left: 0; transform: rotate(-29deg); }
.event-gallery__thumbs img:nth-child(2) { left: 16px; z-index: 1; }
.event-gallery__thumbs img:nth-child(3) { left: 32px; transform: rotate(28deg); }
.event-gallery__more-label { color: var(--color-action-primary); }

/* Proposed: desktop scroll buttons */
.event-gallery__arrow {
  position: absolute;
  top: 50%;
  display: inline-flex;
  padding: var(--spacing-sm);
  border: 0;
  border-radius: var(--radius-full);
  background: var(--color-background-primary);
  box-shadow: var(--shadow-dp2);
  transform: translateY(-50%);
  cursor: pointer;
}
.event-gallery__arrow--prev { left: var(--spacing-sm); }
.event-gallery__arrow--next { right: var(--spacing-sm); }
.event-gallery__arrow--next img { transform: rotate(180deg); }
@media (hover: none) {
  .event-gallery__arrow { display: none; }
}

/* ---- Phones (< 768px) ---- */
@media (max-width: 767px) {
  .event-gallery {
    --gallery-height: 196px;  /* Figma phone frame: all tiles square */
    --gallery-lead: var(--gallery-height);
    --gallery-col: 94px;
    --gallery-gap: var(--spacing-xs);
    --gallery-radius: var(--radius-md);
  }
  /* 2-3 photos: taller strip (Figma 7335:7422) */
  .event-gallery__viewport--tall {
    --gallery-height: 300px;
    --gallery-col: 144px;
    --gallery-gap: var(--spacing-sm);
    --gallery-radius: var(--radius-lg);
  }
  /* 1 photo: centred portrait */
  .event-gallery__single { display: flex; justify-content: center; }
  .event-gallery__single .event-gallery__tile { width: min(300px, 100%); aspect-ratio: 1; --gallery-radius: var(--radius-lg); }
  /* Photos darken toward the bottom (Figma phone frames) */
  .event-gallery__tile--faded::after,
  .event-gallery__strip .event-gallery__tile:not(.event-gallery__more)::after {
    content: '';
    position: absolute;
    inset: 0;
    background: var(--gradient-gallery-fade);
    pointer-events: none;
  }
  .event-gallery__arrow { display: none; }
  /* Strip runs to the screen edge, like Figma */
  .event-gallery__viewport { margin-right: calc(-1 * var(--container-inset-mobile)); }
  .event-gallery__strip { padding-right: var(--container-inset-mobile); }
}
</style>
