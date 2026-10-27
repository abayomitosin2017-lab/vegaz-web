// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2026-10-01',
  devtools: { enabled: true },
  // Design tokens first, then the global base styles.
  css: ['~/assets/styles/tokens/index.css', '~/assets/styles/base.css', '~/assets/styles/motion.css'],
  // Page-to-page fade and the card photo growing into the event page use the
  // browser's View Transitions (decision 22 Oct). Off for "reduce motion".
  experimental: { viewTransition: true },
  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      title: 'Vegaz',
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        // Outfit weights used by the system: 300, 400, 500 (letter avatars), 600, 700, 900 (promo banner titles).
        // OPEN ITEM (engineering): Google Fonts vs self-hosted.
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;900&display=swap' },
        // Installable web app (PWA, decision 27 Oct). OPEN ITEM (engineering):
        // service worker / offline caching is not set up.
        { rel: 'manifest', href: '/manifest.webmanifest' },
        { rel: 'apple-touch-icon', href: '/icons/apple-touch-icon.png' },
      ],
      meta: [
        { name: 'theme-color', content: '#4B099F' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-title', content: 'Vegaz' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
      ],
    },
  },
})
