import type { SessionUser } from '~/types/auth'
import { placeholderPhoto } from './placeholders'
/**
 * Mock auth rules for the preview. NOT real behaviour: engineering replaces
 * services/auth.ts with the real API. Agreed with design (2026-10-20):
 *  - this email belongs to an existing account, so it goes to LOGIN;
 *    any other valid email goes to SIGNUP
 *  - code 000000 is wrong (shows the error state); any other 6 digits passes
 */
export const mockExistingEmails = ['johnbade@gmail.com']
/**
 * Who signs in with the existing email: the user drawn in the Figma signed-in
 * headers (HOME/LOGGED IN). FLAG: the email and the person don't match; both are
 * demo data.
 */
export const mockExistingAccount: SessionUser = {
  firstName: 'Esther',
  lastName: 'Marie',
  username: 'estiloo',
  avatarUrl: placeholderPhoto(3), // placeholder portrait; new sign-ups keep the letter avatar
  email: 'johnbade@gmail.com',
  phone: '08123456789', // demo number (Figma checkout frames)
  gender: 'female',
  // No birthday or bio yet, so the birthday prompt and an incomplete profile show (decision 26 Oct)
}
export const mockWrongCode = '000000'
/** Usernames treated as taken (no "taken" state is designed yet) */
export const mockTakenUsernames: string[] = []
/** Seconds before "Resend code" becomes available (Figma shows 14:15 counting down) */
export const mockResendSeconds = 15 * 60
export const mockLatencyMs = 300
