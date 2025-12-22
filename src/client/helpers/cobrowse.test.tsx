import { describe } from 'vitest';

import { getRedactedClass } from './cobrowse';

vi.mock('../config/thema', () => ({
  myThemasMenuItems: [
    {
      id: 'themaIDRedacted',
      redactedScope: 'full',
    },
    {
      id: 'themaIDScopeRedacted',
      redactedScope: 'content',
    },
    {
      id: 'themaID',
    },
  ],
}));

const REDACTED_CLASS = 'redacted';
describe('Cobrowse', () => {
  test('if getRedactedClass returns empty string if there is nothing to redact', async () => {
    expect(getRedactedClass(null)).toBe('');
  });
  test("if getRedactedClass returns the redacted class if a requested scope provided is 'full'", async () => {
    expect(getRedactedClass(null, 'full')).toBe(REDACTED_CLASS);
  });
  test("if getRedactedClass returns empty string if 'full' was requested but there is nothing to redact according to the config found for provided themaId", async () => {
    expect(getRedactedClass('themaID', 'full')).toBe('');
  });
  test('if getRedactedClass returns the redacted class for a non-existent thema', async () => {
    expect(getRedactedClass('somerandomthema')).toBe(REDACTED_CLASS);
  });
  test('if getRedactedClass returns the redacted class for an existent redacted thema', async () => {
    expect(getRedactedClass('themaIDRedacted')).toBe(REDACTED_CLASS);
    expect(getRedactedClass('someNonExistingThemaName')).toBe(REDACTED_CLASS);
  });
  test('if getRedactedClass does not return the redacted class for an existent non-redacted thema', async () => {
    expect(getRedactedClass('themaID')).toBe('');
  });
  test('if getRedactedClass returns the redacted class for a non-existent thema', async () => {
    expect(getRedactedClass('someNonExistingThemaName')).toBe(REDACTED_CLASS);
  });
  test('if getRedactedClass returns the redacted class correctly for a content scope', async () => {
    expect(getRedactedClass('themaIDScopeRedacted')).toBe('');
    expect(getRedactedClass('themaIDScopeRedacted', 'content')).toBe(
      REDACTED_CLASS
    );
    expect(getRedactedClass('themaIDRedacted', 'content')).toBe(REDACTED_CLASS);
    expect(getRedactedClass('themaID', 'content')).toBe('');
  });
});
