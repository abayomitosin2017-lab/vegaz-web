/**
 * "Add Vegaz to your Home Screen" (PWA install nudge), Figma page "PWA install"
 * (decision 27 Oct).
 *
 * When: after a meaningful action (joining a community, buying a ticket or
 * RSVP) the page calls `nudge()`. The banner then shows on phones only, when
 * Vegaz isn't already installed and wasn't dismissed in the last 14 days
 * (PROPOSED). It waits while a conversation fills the phone screen.
 *
 * Tapping the banner:
 *   iPhone (Safari): opens the sheet with the 3 picture steps (Safari has no
 *     install button a site can press).
 *   Android (Chrome and others with an install prompt): opens the browser's
 *     own install pop-up straight away; no sheet.
 *   Anything else (no install prompt, other iPhone browsers): the banner
 *     isn't shown.
 * X on the banner, "Not now" and "Got it" hide it for 14 days (kept on this
 * device only).
 */
interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const SNOOZE_KEY = 'vegaz-pwa-snooze'
const SNOOZE_DAYS = 14
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
function snoozed(): boolean {
  try { return Number(localStorage.getItem(SNOOZE_KEY) ?? 0) > Date.now() } catch { return false }
}
function snooze() {
  try { localStorage.setItem(SNOOZE_KEY, String(Date.now() + SNOOZE_DAYS * 864e5)) } catch { /* storage unavailable */ }
}

export function usePwaInstall() {
  const pending = useState('pwa-pending', () => false) // a meaningful action happened
  const sheetOpen = useState('pwa-sheet', () => false)
  const hidden = useState('pwa-hidden', () => false) // dismissed or installed this session

  /** Called once on the client (plugins/pwa.client.ts) */
  function listen() {
    if (listening || !import.meta.client) return
    listening = true
    window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferred = e as InstallPromptEvent })
    window.addEventListener('appinstalled', () => { deferred = null; hidden.value = true; sheetOpen.value = false })
  }

  /** Can this phone be nudged right now? */
  function eligible(): boolean {
    if (!import.meta.client || hidden.value) return false
    if (!window.matchMedia('(max-width: 767px)').matches) return false
    if (isInstalled() || snoozed()) return false
    return isIosSafari() || !!deferred
  }

  /** After a meaningful action */
  function nudge() { if (eligible()) pending.value = true }

  /** Tap on the banner */
  async function install() {
    if (isIosSafari()) { sheetOpen.value = true; pending.value = false; return }
    const prompt = deferred
    if (!prompt) return
    pending.value = false
    deferred = null // a prompt can only be used once
    await prompt.prompt()
    const { outcome } = await prompt.userChoice
    if (outcome === 'dismissed') snooze()
    hidden.value = true
  }

  /** X / Not now / Got it */
  function dismiss() {
    snooze()
    pending.value = false
    sheetOpen.value = false
    hidden.value = true
  }

  return { pending, sheetOpen, hidden, listen, nudge, install, dismiss, eligible }
}
