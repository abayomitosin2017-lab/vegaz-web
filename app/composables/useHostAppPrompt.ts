/**
 * "Don't show again" for the host app modal (decision 27 Oct).
 * MOCK: remembered in this browser only (localStorage). With the API this
 * should be saved on the account so it holds on every device (ENGINEERING).
 */
const KEY = 'vegaz:host-app-prompt-off'

export function useHostAppPrompt() {
  const off = useState('host-app-prompt-off', () => false)
  if (import.meta.client) {
    try { off.value = off.value || localStorage.getItem(KEY) === '1' } catch { /* storage blocked: show it */ }
  }
  function turnOff() {
    off.value = true
    try { localStorage.setItem(KEY, '1') } catch { /* ignore */ }
  }
  return { off, turnOff }
}
