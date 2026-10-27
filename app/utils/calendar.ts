/**
 * "Add to calendar" links and file (decision 27 Oct).
 * - Google Calendar and Outlook (web) open with the event filled in.
 * - Apple / other calendars: an .ics file the device opens in its calendar.
 * OPEN ITEM: events have a start time only. Until an end time exists, the
 * calendar entry lasts DEFAULT_HOURS (PRODUCT TO CONFIRM).
 */
export const DEFAULT_HOURS = 2

export interface CalendarEvent { title: string; startsAt: string; location: string; details: string; url: string }

const stamp = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '') // 20260531T110000Z
const range = (e: CalendarEvent) => {
  const start = new Date(e.startsAt)
  return { start, end: new Date(start.getTime() + DEFAULT_HOURS * 3600_000) }
}
const body = (e: CalendarEvent) => [e.details.trim().slice(0, 500), e.url].filter(Boolean).join('\n\n')

export function googleCalendarUrl(e: CalendarEvent) {
  const { start, end } = range(e)
  const q = new URLSearchParams({ action: 'TEMPLATE', text: e.title, dates: `${stamp(start)}/${stamp(end)}`, location: e.location, details: body(e) })
  return `https://calendar.google.com/calendar/render?${q}`
}

export function outlookCalendarUrl(e: CalendarEvent) {
  const { start, end } = range(e)
  const q = new URLSearchParams({ path: '/calendar/action/compose', rru: 'addevent', subject: e.title, startdt: start.toISOString(), enddt: end.toISOString(), location: e.location, body: body(e) })
  return `https://outlook.live.com/calendar/0/deeplink/compose?${q}`
}

const esc = (s: string) => s.replace(/\\/g, '\\\\').replace(/;/g, '\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n')

export function icsFile(e: CalendarEvent, uid: string) {
  const { start, end } = range(e)
  return [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Vegaz//Events//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}@vegaz`, `DTSTAMP:${stamp(new Date())}`, `DTSTART:${stamp(start)}`, `DTEND:${stamp(end)}`,
    `SUMMARY:${esc(e.title)}`, `LOCATION:${esc(e.location)}`, `DESCRIPTION:${esc(body(e))}`, `URL:${e.url}`,
    'END:VEVENT', 'END:VCALENDAR',
  ].join('\r\n')
}
