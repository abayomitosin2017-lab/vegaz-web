/** Start listening for the browser's install prompt as early as possible (PWA nudge) */
export default defineNuxtPlugin(() => { usePwaInstall().listen() })
