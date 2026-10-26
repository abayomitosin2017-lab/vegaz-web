<script setup lang="ts">
import './styles.css'
import type { DraftExpectation } from '~/types/hosting'
/**
 * Phone "What to expect" list and its "Create Item" sheet (Figma mobile
 * frames 10754:69503-69746).
 * List: items 24 apart; 80px picture (radius 12), title Small semibold
 * #2C2C2C, description Small regular #575757 (8 apart), edit and delete
 * (34px, #F4F5F8, 0.5px Grey_5) stacked; then "+ Add new item" (Grey_6
 * pill, radius 100, 13 / 8 padding, Small semibold #2C2C2C).
 * Empty: #F4F5F8 box (radius 16, 259 tall), list drawing, "Nothing has been
 * added to this list", "+ Add Item" (Primary).
 * Sheet: "Create Item" (Headline 2 semibold) + 16px X; 73px picture + Title,
 * Description; full-width "Save"; picture remove bubble on the picture.
 * Editing (not drawn): "Edit Item" (PROPOSED).
 */
const items = defineModel<DraftExpectation[]>('items', { required: true })
const editing = defineModel<DraftExpectation | null>('editing', { required: true })
const emit = defineEmits<{ delete: [item: DraftExpectation] }>()

const sheetOpen = ref(false)
const title = ref('')
const description = ref('')
const imageUrl = ref<string | undefined>()
const file = ref<HTMLInputElement | null>(null)
const id = useId()

function openNew() { editing.value = null; title.value = ''; description.value = ''; imageUrl.value = undefined; sheetOpen.value = true }
function openEdit(i: DraftExpectation) { editing.value = i; title.value = i.title; description.value = i.description; imageUrl.value = i.imageUrl; sheetOpen.value = true }
function close() { sheetOpen.value = false; editing.value = null }
const ready = computed(() => !!title.value.trim() && !!description.value.trim())
function save() {
  if (!ready.value) return
  const item = { id: editing.value?.id ?? crypto.randomUUID(), title: title.value.trim(), description: description.value.trim(), imageUrl: imageUrl.value }
  items.value = editing.value ? items.value.map(x => (x.id === item.id ? item : x)) : [...items.value, item]
  close()
}
function onFile(e: Event) {
  const el = e.target as HTMLInputElement
  const f = el.files?.[0]
  if (f && f.type.startsWith('image/')) imageUrl.value = URL.createObjectURL(f)
  el.value = ''
}
const descEl = ref<HTMLTextAreaElement | null>(null)
function fit() { const el = descEl.value; if (!el) return; el.style.height = 'auto'; el.style.height = `${el.scrollHeight}px` }
watch([description, sheetOpen], () => nextTick(fit))
defineExpose({ openNew })
</script>

<template>
  <div v-if="!items.length" class="host-mempty">
    <img class="host-empty__art" src="/images/host/empty-list.svg" alt="" width="95" height="75" />
    <div class="host-mempty__text">
      <p class="text-app-small-semibold">Nothing has been added to this list</p>
      <button type="button" class="host-mlink text-app-small-semibold" @click="openNew">
        <img src="/images/host/m-add-primary-18.svg" alt="" width="18" height="18" />Add Item
      </button>
    </div>
  </div>
  <template v-else>
    <TransitionGroup tag="ul" name="host-list" class="host-mitems" aria-label="Your list">
      <li v-for="item in items" :key="item.id" class="host-mitem">
        <span class="host-mitem__pic"><img v-if="item.imageUrl" :src="item.imageUrl" alt="" /></span>
        <span class="host-mitem__text">
          <span class="host-mitem__title text-app-small-semibold">{{ item.title }}</span>
          <span class="host-mitem__desc text-app-small-regular">{{ item.description }}</span>
        </span>
        <span class="host-mitem__actions">
          <button type="button" class="host-mcard__btn" :aria-label="`Edit ${item.title}`" @click="openEdit(item)"><img src="/images/host/icon-pen-18.svg" alt="" width="18" height="18" /></button>
          <button type="button" class="host-mcard__btn" :aria-label="`Delete ${item.title}`" @click="emit('delete', item)"><img src="/images/host/icon-delete-18.svg" alt="" width="18" height="18" /></button>
        </span>
      </li>
    </TransitionGroup>
    <button type="button" class="host-madd text-app-small-semibold" @click="openNew">
      <img src="/images/host/m-add-dark-18.svg" alt="" width="18" height="18" />Add new item
    </button>
  </template>

  <UiModal :open="sheetOpen" :width="441" :labelledby="`${id}-t`" phone="sheet" @close="close">
    <div class="host-msheet">
      <div class="host-msheet__head">
        <h2 :id="`${id}-t`" class="host-msheet__title">{{ editing ? 'Edit Item' : 'Create Item' }}</h2>
        <button type="button" class="host-dialog__close" aria-label="Close" @click="close"><img src="/images/host/icon-close-16.svg" alt="" width="16" height="16" /></button>
      </div>
      <div class="host-msheet__body">
        <div class="host-msheet__fields">
          <div class="host-msheet__row">
            <input ref="file" class="host-visually-hidden" type="file" accept="image/*" tabindex="-1" aria-hidden="true" @change="onFile" />
            <button type="button" class="host-msheet__pic" :aria-label="imageUrl ? 'Change picture' : 'Add a picture'" @click="file?.click()">
              <img v-if="imageUrl" class="host-msheet__photo" :src="imageUrl" alt="" />
              <img v-else src="/images/host/expect-image-empty.svg" alt="" width="74" height="75" />
            </button>
            <button v-if="imageUrl" type="button" class="host-msheet__remove" aria-label="Remove picture" @click="imageUrl = undefined">
              <img src="/images/host/icon-delete-16.svg" alt="" width="16" height="16" />
            </button>
            <div class="host-field host-msheet__title-field">
              <label :for="`${id}-ti`" class="host-field__label text-app-small-semibold">Title</label>
              <input :id="`${id}-ti`" v-model="title" class="host-input" type="text" maxlength="40" placeholder="e.g loads of fun" data-autofocus />
            </div>
          </div>
          <div class="host-field">
            <label :for="`${id}-d`" class="host-field__label text-app-small-semibold">Description</label>
            <textarea :id="`${id}-d`" v-model="description" ref="descEl" class="host-input host-msheet__desc" rows="1" maxlength="120" placeholder="e.g a delightful experience that brings joy and laughter." />
          </div>
        </div>
        <UiButton :class="{ 'host-inactive': !ready }" :color="ready ? 'primary' : 'secondary'" :aria-disabled="!ready ? 'true' : undefined" @click="save">Save</UiButton>
      </div>
    </div>
  </UiModal>
</template>

<style scoped>
.host-mitems { display: flex; flex-direction: column; gap: var(--spacing-lg); margin: 0; padding: 0; list-style: none; }
.host-mitem { display: flex; align-items: center; gap: var(--spacing-md); }
.host-mitem__pic { flex: none; width: 80px; height: 80px; overflow: hidden; border-radius: var(--radius-md); background: var(--color-host-empty); }
.host-mitem__pic img { width: 100%; height: 100%; object-fit: cover; display: block; }
.host-mitem__text { flex: 1 0 0; min-width: 0; display: flex; flex-direction: column; gap: var(--spacing-xs); }
.host-mitem__title { color: var(--color-text-primary); }
.host-mitem__desc { color: #575757; } /* raw in Figma */
.host-mitem__actions { flex: none; display: flex; flex-direction: column; gap: var(--spacing-xs); }
.host-mcard__btn { display: inline-flex; padding: calc(var(--spacing-xs) - 0.5px); border: 0.5px solid var(--color-border-default); border-radius: var(--radius-pill); background: var(--color-host-empty); cursor: pointer; }
.host-mcard__btn:focus-visible { outline: var(--focus-ring-width) solid var(--focus-ring-color); outline-offset: 1px; }
.host-madd { display: flex; align-items: center; justify-content: center; gap: 6px; width: 100%; padding: 13px var(--spacing-xs); border: 0; border-radius: var(--radius-full); background: var(--color-background-secondary); color: var(--color-text-primary); font-family: var(--font-family-base); cursor: pointer; }
.host-madd:focus-visible { outline: var(--focus-ring-width) solid var(--focus-ring-color); }
.host-mempty { box-sizing: border-box; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: var(--spacing-2xl); min-height: 259px; padding: 44px; border-radius: 16px; background: var(--color-host-empty); text-align: center; }
.host-mempty__text { display: flex; flex-direction: column; align-items: center; gap: var(--spacing-xs); }
.host-mempty__text p { margin: 0; color: var(--color-text-option); }
.host-mlink { display: inline-flex; align-items: center; gap: 6px; padding: 0; border: 0; background: none; color: var(--color-action-primary); font-family: var(--font-family-base); cursor: pointer; }
.host-mlink:focus-visible { outline: var(--focus-ring-width) solid var(--focus-ring-color); outline-offset: 2px; }

.host-msheet { display: flex; flex-direction: column; gap: var(--spacing-xl); }
.host-msheet__head { display: flex; align-items: center; justify-content: space-between; }
.host-msheet__title { margin: 0; color: var(--color-text-checkout); font-family: var(--font-family-base); font-weight: var(--font-weight-semibold); font-size: 24px; line-height: 32px; letter-spacing: -0.5px; }
.host-msheet__body { display: flex; flex-direction: column; gap: var(--spacing-2xl); }
.host-msheet__body > .ui-button { width: 100%; }
.host-msheet__fields { display: flex; flex-direction: column; gap: var(--spacing-md); }
.host-msheet__row { position: relative; display: flex; align-items: center; gap: 14px; }
.host-msheet__pic { flex: none; width: 73px; height: 73px; padding: 0; overflow: hidden; border: 0; border-radius: var(--radius-md); background: none; cursor: pointer; }
.host-msheet__pic > img:not(.host-msheet__photo) { display: block; width: 74px; height: 75px; margin: -1px 0 0 -1px; }
.host-msheet__photo { display: block; width: 100%; height: 100%; object-fit: cover; }
.host-msheet__pic:focus-visible, .host-msheet__remove:focus-visible { outline: var(--focus-ring-width) solid var(--focus-ring-color); outline-offset: 2px; }
.host-msheet__remove { position: absolute; left: 44px; top: 48px; display: inline-flex; padding: var(--spacing-xxs); border: 0.5px solid var(--color-border-default); border-radius: var(--radius-pill); background: var(--color-host-empty); cursor: pointer; }
.host-msheet__title-field { flex: 1 0 0; }
.host-msheet__desc { overflow: hidden; min-height: var(--sizing-control-field); }
</style>
