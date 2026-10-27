/**
 * "Add Vegaz to your Home Screen" (PWA install nudge), Figma page "PWA install"
 * (decision 27 Oct).
 *
 * When (decision 27 Oct, replaces "after a meaningful action"): every time
 * someone lands on Home, the Home page calls `nudge()`. The banner shows on
 * phones only, when Vegaz isn't already installed, and then stays (on every
 * page) until they close it or add Vegaz. Closing it hides it for this visit
 * only; it comes back the next time they open Vegaz and land on Home.
 * It waits while a conversation fills the phone screen.
 *
 * Tapping the banner:
 *   iPhone (Safari): opens the sheet with the 3 picture steps (Safari has no
 *     install button a site can press).
 *   Android (Chrome and others with an install prompt): opens the browser's
 *     own install pop-up straight away; no sheet.
 *   Anything else (no install prompt, other iPhone browsers): the banner
 *     isn't shown.
 * X on the banner, "Not now" and "Got it" hide it for this visit.
 */
interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

let deferred: InstallPromptEvent | null = null
let listening = false

function isInstalled(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true
}
function isIosSafari(): boolean {
  const ua = navigator.userAgent
  const ios = /iPhone|iPod/.test(ua) || (/iPad/.test(ua))
  return ios && /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS|GSA\//.test(ua)
}

export function usePwaInstall() {
  const pending = useState('pwa-pending', () => false) // a meaningful action happened
  const sheetOpen = useState('pwa-sheet', () => false)
  const hidden = useState('pwa-hidden', () => false) // closed or installed during this visit
  const wanted = useState('pwa-wanted', () => false) // landed on Home before Android's install prompt was ready

  /** Called once on the client (plugins/pwa.client.ts) */
  function listen() {
    if (listening || !import.meta.client) return
    listening = true
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault()
      deferred = e as InstallPromptEvent
      if (wanted.value && eligible()) pending.value = true
    })
    window.addEventListener('appinstalled', () => { deferred = null; hidden.value = true; sheetOpen.value = false })
  }

  /** Can this phone be nudged right now? */
  function eligible(): boolean {
    if (!import.meta.client || hidden.value) return false
    if (!window.matchMedia('(max-width: 767px)').matches) return false
    if (isInstalled()) return false
    return isIosSafari() || !!deferred
  }

  /** Landed on Home */
  function nudge() {
    wanted.value = true
    if (eligible()) pending.value = true
  }

  /** Tap on the banner */
  async function install() {
    if (isIosSafari()) { sheetOpen.value = true; pending.value = false; return }
    const prompt = deferred
    if (!prompt) return
    pending.value = false
    deferred = null // a prompt can only be used once
    await prompt.prompt()
    await prompt.userChoice // added, or cancelled the browser pop-up: either way the banner leaves
    hidden.value = true
  }

  /** X / Not now / Got it */
  function dismiss() {
    pending.value = false
    sheetOpen.value = false
    hidden.value = true
  }

  return { pending, sheetOpen, hidden, listen, nudge, install, dismiss, eligible }
}
