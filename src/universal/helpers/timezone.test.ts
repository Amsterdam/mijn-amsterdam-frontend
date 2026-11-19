import { describe, expect, it } from 'vitest';

import { isAmsterdamTimezone } from './timezone.ts';

describe('isAmsterdamTimezone', () => {
  it('only matches the Amsterdam timezone', () => {
    expect(isAmsterdamTimezone('Europe/Amsterdam')).toBe(true);
    expect(isAmsterdamTimezone('Europe/Brussels')).toBe(false);
  });
});
