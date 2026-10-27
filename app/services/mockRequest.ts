/**
 * Stand-in for a network request in the mock services (decision 27 Oct).
 * Waits like a real request, and fails like one when the device is offline,
 * so the "Something went wrong / Try again", "You're offline" and "Not sent"
 * states can be seen and tested. Engineering: delete with the mocks; real
 * requests fail on their own.
 */
export class RequestError extends Error {
  constructor(public offline: boolean) {
    super(offline ? 'You’re offline' : 'Request failed')
    this.name = 'RequestError'
  }
}

const isOffline = () => import.meta.client && typeof navigator !== 'undefined' && navigator.onLine === false

export async function mockRequest(ms = 150): Promise<void> {
  if (isOffline()) throw new RequestError(true)
  await new Promise(resolve => setTimeout(resolve, ms))
  if (isOffline()) throw new RequestError(true)
}
