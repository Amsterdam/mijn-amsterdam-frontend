import sanitizeHtml from 'sanitize-html';

const OPTIONS = {
  allowedTags: [],
  allowedAttributes: {},
};

export function sanitizeToPlainText(content: string) {
  return sanitizeHtml(content, OPTIONS);
}
