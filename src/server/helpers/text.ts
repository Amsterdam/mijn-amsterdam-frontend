import outdent from 'outdent';
export function htmlTextContent(stringTemplate: string) {
  return outdent.string(stringTemplate).trim().replaceAll(/\n/g, ' ');
}
