export function isAmsterdamTimezone(
  timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
) {
  return timeZone === 'Europe/Amsterdam';
}
