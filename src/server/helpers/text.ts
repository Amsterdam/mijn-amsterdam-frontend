export function htmlTextContent(stringTemplate: string) {
  return stringTemplate.trim().replaceAll(/[\r\n\t]+/g, '');
}
