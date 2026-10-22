// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2026-10-01',
  devtools: { enabled: true },
  // Design tokens first, then the global base styles.
  css: ['~/assets/styles/tokens/index.css', '~/assets/styles/base.css'],
  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      title: 'Vegaz',
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        // Outfit weights used by the system: 300, 400, 500 (letter avatars), 600, 700.
        // OPEN ITEM (engineering): Google Fonts vs self-hosted.
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap' },
      ],
    },
  },
})
