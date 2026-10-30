/** Start listening for the browser's install prompt as early as possible (PWA nudge) */
import { pwaInstallNudge } from '~/config/app'

export default defineNuxtPlugin(() => {
  // Nudge switched off (decision 30 Oct): don't catch the browser's prompt
  if (pwaInstallNudge) usePwaInstall().listen()
})
