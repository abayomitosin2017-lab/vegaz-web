/**
 * Share a link (decision 21 Oct, used by Share Event and Invite Friend):
 * opens the device's share sheet; where there is none (most desktop
 * browsers), copies the link and sets `toast` to "Link copied".
 * Render the message with <UiToast :message="toast" @done="toast = ''" />.
 */
export function useShareLink() {
  const toast = ref('')

  async function share(data: { url: string; title: string; text?: string }) {
    if (navigator.share && (!navigator.canShare || navigator.canShare(data))) {
      try { await navigator.share(data); return }
      catch (e) { if ((e as DOMException).name === 'AbortError') return } // closed the sheet
    }
    await copy(data.url, 'Link copied')
  }

  /** Copies any text and confirms with `message` */
  async function copy(text: string, message: string) {
    try {
      await navigator.clipboard.writeText(text)
      toast.value = message
    } catch {
      toast.value = 'Couldn’t copy' // OPEN ITEM: copy failure copy
    }
  }

  return { toast, share, copy }
}

/** Public link of an event page. OPEN ITEM: real public URL / domain. */
export function eventUrl(eventId: string): string {
  return new URL(`/events/${eventId}`, window.location.origin).href
}
