export function createNotificationId(...input: string[]): string {
  return input
    .join('-')
    .toLowerCase()
    .replace(/[^a-z0-9-_:.]/g, '');
}
