import type { AuthFlow, SessionUser, SignupProfile } from '~/types/auth'
import { mockExistingAccount, mockExistingEmails, mockLatencyMs, mockTakenUsernames, mockWrongCode } from '~/mocks/auth'

/**
 * Auth service (MOCK). Components call only these functions; replace the
 * bodies with real API calls and keep the signatures.
 * OPEN ITEMS (engineering): endpoints, how the code is sent and verified,
 * session handling, username rules, phone format, what "18 years old" checks.
 */
const wait = (ms = mockLatencyMs) => new Promise(resolve => setTimeout(resolve, ms))

/** Decides login vs signup for an email. */
export async function startWithEmail(email: string): Promise<{ flow: AuthFlow }> {
  await wait()
  return { flow: mockExistingEmails.includes(email.trim().toLowerCase()) ? 'login' : 'signup' }
}

/** Sends (or re-sends) a verification code to the email. */
export async function sendCode(_email: string): Promise<void> {
  await wait()
}

export async function verifyCode(_email: string, code: string): Promise<{ ok: boolean }> {
  await wait()
  return { ok: code !== mockWrongCode }
}

export async function checkUsername(username: string): Promise<{ available: boolean }> {
  await wait(200)
  return { available: !mockTakenUsernames.includes(username.trim().toLowerCase()) }
}

/** Creates the account and signs the new user in. */
export async function createAccount(profile: SignupProfile): Promise<SessionUser> {
  await wait()
  return { firstName: profile.firstName, lastName: profile.lastName, username: profile.username }
}

/** Signs an existing account in after the code is verified (login flow). */
export async function signIn(_email: string): Promise<SessionUser> {
  await wait()
  return { ...mockExistingAccount }
}

/** Ends the session. */
export async function signOut(): Promise<void> {
  await wait(150)
}
