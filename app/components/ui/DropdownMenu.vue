<script setup lang="ts">
/**
 * UiDropdownMenu: a button that opens a short list of actions.
 * Look from Figma "Frame 1984078569" (node 10653:40453, profile menu):
 * white card, radius 24, 16px top/bottom, items 16px from the sides,
 * Web Body desktop regular (18/28 at every width) in Grey_1 with 16px between items, a 1px Grey_5 line
 * before a separated item, danger items in Base negative red.
 *
 * Not in Figma, decided 21 Oct: opens 8px below the trigger, right edges
 * aligned, with the Dp2 shadow. Proposed (not in Figma): hover / keyboard
 * highlight = Grey_6 row.
 *
 * Each item is a 44px-tall row (28px text + 8px above and below) so it is an
 * easy tap target; the card padding is reduced to 8px to keep every text line
 * exactly where Figma puts it (16, 60, 104, 148; line at 192; Log out at 209).
 *
 * Behaviour: standard menu button. Click, Enter, Space or Arrow Down opens and
 * focuses the first item; Arrow Up/Down, Home/End move; Escape closes and
 * returns focus to the button; Tab or a click outside closes.
 *
 * Trigger: pass your own button in the #trigger slot and bind `props` on it.
 */
export interface DropdownItem {
  id: string
  label: string
  /** 'danger' = Base negative red text (Figma "Log out") */
  tone?: 'default' | 'danger'
  /** Draws the Grey_5 line above this item */
  separated?: boolean
  /** Red count after the label (e.g. unread chats on phones); hidden at 0 */
  badge?: number
}

const props = withDefaults(defineProps<{ items: DropdownItem[]; label: string; width?: number }>(), { width: 174 })
const emit = defineEmits<{ select: [id: string] }>()

const open = ref(false)
const root = ref<HTMLElement | null>(null)
const itemEls = ref<HTMLButtonElement[]>([])
const menuId = useId()
const triggerId = useId()

function triggerEl() {
  return root.value?.querySelector<HTMLElement>(`#${CSS.escape(triggerId)}`) ?? null
}
async function show(focus: 'first' | 'last' = 'first') {
  open.value = true
  await nextTick()
  const list = itemEls.value
  ;(focus === 'first' ? list[0] : list[list.length - 1])?.focus()
}
function hide(returnFocus = false) {
  open.value = false
  if (returnFocus) triggerEl()?.focus()
}
function toggle() {
  if (open.value) hide()
  else show()
}
function onTriggerKeydown(e: KeyboardEvent) {
  if (e.key === 'ArrowDown') { e.preventDefault(); show('first') }
  else if (e.key === 'ArrowUp') { e.preventDefault(); show('last') }
}
function onMenuKeydown(e: KeyboardEvent) {
  const list = itemEls.value
  const i = list.indexOf(document.activeElement as HTMLButtonElement)
  if (e.key === 'ArrowDown') { e.preventDefault(); list[(i + 1) % list.length]?.focus() }
  else if (e.key === 'ArrowUp') { e.preventDefault(); list[(i - 1 + list.length) % list.length]?.focus() }
  else if (e.key === 'Home') { e.preventDefault(); list[0]?.focus() }
  else if (e.key === 'End') { e.preventDefault(); list[list.length - 1]?.focus() }
  else if (e.key === 'Escape') { e.preventDefault(); hide(true) }
  else if (e.key === 'Tab') hide()
}
function choose(id: string) {
  hide(true)
  emit('select', id)
}
function onDocumentPointer(e: PointerEvent) {
  if (open.value && root.value && !root.value.contains(e.target as Node)) hide()
}
onMounted(() => document.addEventListener('pointerdown', onDocumentPointer))
onBeforeUnmount(() => document.removeEventListener('pointerdown', onDocumentPointer))

// Close when the page changes
const route = useRoute()
watch(() => route.fullPath, () => hide())

const triggerProps = computed(() => ({
  id: triggerId,
  'aria-haspopup': 'menu' as const,
  'aria-expanded': open.value,
  'aria-controls': menuId,
  onClick: toggle,
  onKeydown: onTriggerKeydown,
}))
</script>

<template>
  <div ref="root" class="ui-dropdown">
    <slot name="trigger" :props="triggerProps" :open="open" />
    <div
      v-show="open"
      :id="menuId"
      class="ui-dropdown__menu"
      role="menu"
      :aria-label="label"
      :style="{ '--ui-dropdown-width': `${props.width}px` }"
      @keydown="onMenuKeydown"
    >
      <template v-for="item in items" :key="item.id">
        <hr v-if="item.separated" class="ui-dropdown__separator" aria-hidden="true" />
        <button
          ref="itemEls"
          type="button"
          role="menuitem"
          tabindex="-1"
          :class="['ui-dropdown__item', { 'ui-dropdown__item--danger': item.tone === 'danger' }]"
          @click="choose(item.id)"
        >
          {{ item.label }}<span v-if="item.badge" class="ui-dropdown__badge"><span class="ui-dropdown__sr">, </span>{{ item.badge > 99 ? '99+' : item.badge }}<span class="ui-dropdown__sr"> unread</span></span>
        </button>
      </template>
    </div>
  </div>
</template>

<style scoped>
.ui-dropdown { position: relative; display: inline-flex; }

.ui-dropdown__menu {
  position: absolute;
  top: calc(100% + var(--spacing-xs));
  right: 0;
  z-index: 10;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  width: var(--ui-dropdown-width);
  padding-block: var(--spacing-xs);
  border-radius: var(--radius-lg);
  background: var(--color-background-primary);
  box-shadow: var(--shadow-dp2);
  overflow: hidden;
}
.ui-dropdown__item {
  display: block;
  width: 100%;
  padding: var(--spacing-xs) var(--spacing-md);
  border: 0;
  background: transparent;
  color: var(--color-text-strong);
  font-family: var(--font-family-base);
  font-weight: var(--text-menu-item-weight);
  font-size: var(--text-menu-item-size);
  line-height: var(--text-menu-item-line);
  letter-spacing: var(--text-menu-item-tracking);
  text-align: left;
  cursor: pointer;
}
.ui-dropdown__item--danger { color: var(--color-status-error); }
/* Unread count (proposed, decision 26 Oct: phones show unread chats on "Chat") */
.ui-dropdown__badge { display: inline-flex; align-items: center; justify-content: center; min-width: 20px; height: 20px; margin-left: var(--spacing-xs); padding: 0 var(--spacing-xs); box-sizing: border-box; border-radius: var(--radius-pill); background: var(--color-status-error); color: var(--base-white); font-weight: var(--font-weight-semibold); font-size: var(--text-xsmall-regular-size); line-height: var(--text-xsmall-regular-line); vertical-align: middle; }
.ui-dropdown__sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
.ui-dropdown__item:hover,
.ui-dropdown__item:focus-visible { background: var(--color-background-secondary); outline: none; } /* proposed */
.ui-dropdown__item:focus-visible { box-shadow: inset 0 0 0 var(--focus-ring-width) var(--focus-ring-color); }

.ui-dropdown__separator {
  /* Figma: 16px gap, 1px Grey_5 line, 16px gap (rows supply 8px each side) */
  width: 100%;
  margin: var(--spacing-xs) 0;
  border: 0;
  border-top: var(--border-width-default) solid var(--color-border-default);
}
</style>
