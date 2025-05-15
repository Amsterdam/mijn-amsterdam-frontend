export function sanitizeStringTemplate(stringTemplate: string) {
  return stringTemplate
    .trim()
    .replace(/[\r\n\t]+/g, '')
    .replace(/\s\s+/g, ' ');
}
