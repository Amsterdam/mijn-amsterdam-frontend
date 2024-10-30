import outdent from 'outdent';
export function htmlTextContent(stringTemplate: string) {
  return outdent.string(stringTemplate).replaceAll(/\n/g, ' ').trim();
}
