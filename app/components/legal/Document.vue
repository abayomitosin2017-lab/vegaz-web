<script setup lang="ts">
import type { LegalDoc } from '~/config/legal'
/**
 * Legal page layout (decision 26 Oct; not in Figma, PROPOSED, Airbnb-style
 * reading page). 720 reading width, centred, 24 under the header.
 * - DRAFT notice (Warning light, until legal approves the text)
 * - Title (page title role), "Last updated" (Small regular Grey_3), intro
 * - "On this page": numbered links to each section
 * - Sections: numbered headings (detail-section title 22/26), body text
 *   16/24 Grey_2, bullet lists; 40 between sections
 * - Link to the other legal page at the end
 */
const props = defineProps<{ doc: LegalDoc; draft?: boolean }>()
const other = computed(() => (props.doc.slug === 'terms' ? { to: '/legal/privacy', label: 'Privacy Policy' } : { to: '/legal/terms', label: 'Terms of Service' }))
</script>

<template>
  <article class="legal">
    <p v-if="draft" class="legal__draft text-small-regular" role="note">
      <strong>Draft for legal review.</strong> This text has not been approved yet and is not final.
    </p>
    <header class="legal__head">
      <h1 class="legal__title text-page-title">{{ doc.title }}</h1>
      <p class="legal__updated text-small-regular">Last updated {{ doc.updated }}</p>
      <p class="legal__intro text-body-regular">{{ doc.intro }}</p>
    </header>

    <nav class="legal__toc" aria-labelledby="legal-toc">
      <h2 id="legal-toc" class="legal__toc-title text-small-semibold">On this page</h2>
      <ol class="legal__toc-list">
        <li v-for="s in doc.sections" :key="s.id"><a class="legal__toc-link text-small-regular" :href="`#${s.id}`">{{ s.title }}</a></li>
      </ol>
    </nav>

    <section v-for="(s, i) in doc.sections" :id="s.id" :key="s.id" class="legal__section" :aria-labelledby="`${s.id}-h`">
      <h2 :id="`${s.id}-h`" class="legal__h2 text-detail-section-title">{{ i + 1 }}. {{ s.title }}</h2>
      <template v-for="(p, j) in s.body" :key="j">
        <ul v-if="Array.isArray(p)" class="legal__list">
          <li v-for="(item, k) in p" :key="k" class="text-body-regular">{{ item }}</li>
        </ul>
        <p v-else class="legal__p text-body-regular">{{ p }}</p>
      </template>
    </section>

    <p class="legal__other text-body-regular">See also our <NuxtLink :to="other.to">{{ other.label }}</NuxtLink>.</p>
  </article>
</template>

<style scoped>
.legal {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2xl);
  width: 100%;
  max-width: calc(720px + 2 * var(--container-inset-mobile));
  margin-inline: auto;
  padding: var(--spacing-page-top) var(--container-inset-mobile) var(--spacing-4xl);
  color: var(--color-text-secondary);
}
.legal__draft { margin: 0; padding: var(--spacing-sm) var(--spacing-md); border-radius: var(--radius-md); background: var(--warning-light-3); color: var(--warning-dark-2); }
.legal__head { display: flex; flex-direction: column; gap: var(--spacing-xs); }
.legal__title { margin: 0; color: var(--color-text-strong); }
.legal__updated { margin: 0; color: var(--color-text-muted); }
.legal__intro { margin: var(--spacing-xs) 0 0; }
.legal__toc { padding: var(--spacing-md) var(--spacing-lg); border: var(--border-width-default) solid var(--color-border-default); border-radius: var(--radius-md); }
.legal__toc-title { margin: 0 0 var(--spacing-xs); color: var(--color-text-strong); }
.legal__toc-list { display: flex; flex-direction: column; gap: var(--spacing-xxs); margin: 0; padding-left: var(--spacing-lg); }
.legal__toc-link { color: var(--color-action-primary); text-decoration: none; }
.legal__toc-link:hover { text-decoration: underline; }
.legal__toc-link:focus-visible, .legal__other a:focus-visible { outline: var(--focus-ring-width) solid var(--focus-ring-color); outline-offset: 2px; border-radius: var(--radius-xs); }
.legal__section { display: flex; flex-direction: column; gap: var(--spacing-sm); scroll-margin-top: calc(var(--sizing-header-height) + var(--spacing-lg)); }
.legal__h2 { margin: 0; color: var(--color-text-strong); }
.legal__p { margin: 0; }
.legal__list { display: flex; flex-direction: column; gap: var(--spacing-xs); margin: 0; padding-left: var(--spacing-lg); }
.legal__other { margin: 0; padding-top: var(--spacing-lg); border-top: var(--border-width-default) solid var(--color-border-default); }
.legal__other a { color: var(--color-action-primary); }
@media (min-width: 768px) {
  .legal { max-width: calc(720px + 2 * var(--container-inset-tablet)); padding-inline: var(--container-inset-tablet); }
}
</style>
