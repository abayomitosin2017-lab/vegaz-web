/**
 * Whether the device has a connection (the browser's online / offline
 * events). Shared by every component; true on the server.
 */
const online = ref(true)
let listening = false

export function useOnline() {
  if (import.meta.client && !listening) {
    listening = true
    online.value = navigator.onLine
    window.addEventListener('online', () => { online.value = true })
    window.addEventListener('offline', () => { online.value = false })
  }
  return online
}
