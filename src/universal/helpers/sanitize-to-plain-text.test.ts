import { describe, expect, it } from 'vitest';

import { sanitizeToPlainText } from './sanitize-to-plain-text.ts';

describe('sanitizeToPlainText', () => {
  it('preserves plain text', () => {
    expect(sanitizeToPlainText('Er is een storing.')).toBe(
      'Er is een storing.'
    );
  });

  it('removes HTML tags and attributes while preserving their text', () => {
    expect(
      sanitizeToPlainText(
        '<p>Er is een <strong>storing</strong>.</p><iframe srcdoc="&lt;script&gt;alert(1)&lt;/script&gt;"></iframe><img src=x onerror=alert(1)>'
      )
    ).toBe('Er is een storing.');
  });
});
