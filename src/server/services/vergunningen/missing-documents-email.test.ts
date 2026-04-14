import { describe, expect, it } from 'vitest';

import { getMissingDocumentsEmailForCaseType } from './config-and-types.ts';

describe('getMissingDocumentsEmailForCaseType', () => {
  it('returns the configured email for eligible case types', () => {
    expect(getMissingDocumentsEmailForCaseType('Splitsingsvergunning')).toBe(
      'bedandbreakfast@amsterdam.nl'
    );
  });

  it('returns undefined for case types without configured email', () => {
    expect(getMissingDocumentsEmailForCaseType('RVV - Hele stad')).toBe(
      undefined
    );
  });

  it('returns undefined for null/undefined input', () => {
    expect(getMissingDocumentsEmailForCaseType(null)).toBe(undefined);
    expect(getMissingDocumentsEmailForCaseType(undefined)).toBe(undefined);
  });
});
