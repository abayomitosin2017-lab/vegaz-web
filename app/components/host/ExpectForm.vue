<script setup lang="ts">
import './styles.css'
import type { DraftExpectation } from '~/types/hosting'
/**
 * "Add an item" on the What to expect step (Figma frames 17-19). On the
 * page; each item shows in the "Your list" panel (decision 23 Oct).
 *
 * Row (14 apart): 73px picture tile (dashed Grey_3, #F4F5F8, image-add
 * icon) + "Title" field. Once a picture is chosen it fills the tile
 * (radius 12) and a 24px round remove button (red bin) appears after the
 * field. "Description" field below (16 apart), growing with the text.
 * "Add item" (200px) turns primary once a title and description are typed
 * (picture optional). Editing (not drawn; same as tickets): "Edit item",
 * "Cancel" + "Save changes".
 */
const props = defineProps<{ editing: DraftExpectation | null }>()
const emit = defineEmits<{ add: [item: DraftExpectation]; save: [item: DraftExpectation]; cancel: [] }>()

const title = ref('')
const description = ref('')
const imageUrl = ref<string | undefined>()
const file = ref<HTMLInputElement | null>(null)
const id = useId()

function load(item: DraftExpectation | null) {
  title.value = item?.title ?? ''
  description.value = item?.description ?? ''
  imageUrl.value = item?.imageUrl
}
watch(() => props.editing, load, { immediate: true })

const ready = computed(() => !!title.value.trim() && !!description.value.trim())

function onFile(e: Event) {
  const el = e.target as HTMLInputElement
  const f = el.files?.[0]
  if (f && f.type.startsWith('image/')) imageUrl.value = URL.createObjectURL(f)
  el.value = ''
}
function submit() {
  if (!ready.value) return
  const item = { id: props.editing?.id ?? crypto.randomUUID(), title: title.value.trim(), description: description.value.trim(), imageUrl: imageUrl.value }
  if (props.editing) emit('save', item)
  else { emit('add', item); load(null) }
}
// Grows with the text; re-measured whenever the text changes (typing, reset
// after "Add item", loading an item to edit) so it never keeps an old height
const descEl = ref<HTMLTextAreaElement | null>(null)
function fit() {
  const el = descEl.value
  if (!el) return
  el.style.height = 'auto'
  el.style.height = `${el.scrollHeight}px`
}
watch(description, () => nextTick(fit))
onMounted(fit)
</script>

<template>
  <section class="host-section" :aria-labelledby="`${id}-h`">
    <h3 :id="`${id}-h`" class="host-section__title text-body-semibold">{{ editing ? 'Edit item' : 'Add an item' }}</h3>
    <p class="host-section__copy text-xsmall-regular">{{ editing ? 'Update this item, then save your changes.' : 'Give it a picture, a short title and a line about it. Each item appears on the right.' }}</p>

    <div class="host-expect-form">
      <div class="host-expect-form__row">
        <input ref="file" class="host-visually-hidden" type="file" accept="image/*" tabindex="-1" aria-hidden="true" @change="onFile" />
        <button type="button" class="host-expect-form__pic" :aria-label="imageUrl ? 'Change picture' : 'Add a picture'" @click="file?.click()">
          <img v-if="imageUrl" class="host-expect-form__photo" :src="imageUrl" alt="" />
          <img v-else src="/images/host/expect-image-empty.svg" alt="" width="74" height="75" />
        </button>
        <div class="host-field host-expect-form__title">
          <label :for="`${id}-t`" class="host-field__label text-app-small-semibold">Title</label>
          <input :id="`${id}-t`" v-model="title" class="host-input" type="text" maxlength="40" placeholder="e.g loads of fun" />
        </div>
        <button v-if="imageUrl" type="button" class="host-expect-form__remove" aria-label="Remove picture" @click="imageUrl = undefined">
          <img src="/images/host/icon-delete-16.svg" alt="" width="16" height="16" />
        </button>
      </div>
      <div class="host-field">
        <label :for="`${id}-d`" class="host-field__label text-app-small-semibold">Description</label>
        <textarea :id="`${id}-d`" v-model="description" ref="descEl" class="host-input host-expect-form__desc" rows="1" maxlength="120" placeholder="e.g a delightful experience that brings joy and laughter." />
      </div>
    </div>

    <div class="host-expect-form__actions">
      <UiButton v-if="editing" class="host-expect-form__cancel" color="secondary" @click="emit('cancel')">Cancel</UiButton>
      <UiButton
        :class="['host-expect-form__submit', { 'host-inactive': !ready }]"
        :color="ready ? 'primary' : 'secondary'"
        :aria-disabled="!ready ? 'true' : undefined"
        @click="submit"
      >{{ editing ? 'Save changes' : 'Add item' }}</UiButton>
    </div>
  </section>
</template>

<style scoped>
.host-expect-form { display: flex; flex-direction: column; gap: var(--spacing-md); }
.host-expect-form__row { display: flex; align-items: flex-end; gap: 14px; }
.host-expect-form__pic {
  flex: none;
  width: 73px;
  height: 73px;
  margin-bottom: 7px; /* Figma: the tile is centred on the 80px field */
  padding: 0;
  overflow: hidden;
  border: 0;
  border-radius: var(--radius-md);
  background: none;
  cursor: pointer;
}
.host-expect-form__pic > img:not(.host-expect-form__photo) { display: block; width: 74px; height: 75px; margin: -1px 0 0 -1px; }
.host-expect-form__photo { display: block; width: 100%; height: 100%; object-fit: cover; }
.host-expect-form__pic:focus-visible { outline: var(--focus-ring-width) solid var(--focus-ring-color); outline-offset: var(--focus-ring-offset); }
.host-expect-form__title { flex: 1; }
.host-expect-form__remove {
  flex: none;
  display: inline-flex;
  align-self: center;
  margin-top: 28px;
  padding: var(--spacing-xxs);
  border: 0.5px solid var(--color-border-default);
  border-radius: var(--radius-pill);
  background: var(--color-host-empty);
  cursor: pointer;
}
.host-expect-form__remove:focus-visible { outline: var(--focus-ring-width) solid var(--focus-ring-color); }
.host-expect-form__desc { overflow: hidden; min-height: var(--sizing-control-field); }
.host-expect-form__actions { display: flex; gap: var(--spacing-md); }
</style>
