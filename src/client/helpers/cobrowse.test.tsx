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
  const isCobrowseScreensharing = false;
  test('if getRedactedClass returns empty string if there is nothing to redact', async () => {
    expect(getRedactedClass({ isCobrowseScreensharing })).toBe('');
  });
  test("if getRedactedClass returns the redacted class if a requested scope provided is 'full'", async () => {
    expect(
      getRedactedClass({ scopeRequested: 'full', isCobrowseScreensharing })
    ).toBe(REDACTED_CLASS);
  });
  test("if getRedactedClass returns empty string if 'full' was requested but there is nothing to redact according to the config found for provided themaId", async () => {
    expect(
      getRedactedClass({
        themaId: 'themaID',
        scopeRequested: 'full',
        isCobrowseScreensharing,
      })
    ).toBe('');
  });
  test('if getRedactedClass returns the redacted class for a non-existent thema', async () => {
    expect(
      getRedactedClass({ themaId: 'somerandomthema', isCobrowseScreensharing })
    ).toBe(REDACTED_CLASS);
  });
  test('if getRedactedClass returns the redacted class for an existent redacted thema', async () => {
    expect(
      getRedactedClass({ themaId: 'themaIDRedacted', isCobrowseScreensharing })
    ).toBe(REDACTED_CLASS);
    expect(
      getRedactedClass({
        themaId: 'someNonExistingThemaName',
        isCobrowseScreensharing,
      })
    ).toBe(REDACTED_CLASS);
  });
  test('if getRedactedClass does not return the redacted class for an existent non-redacted thema', async () => {
    expect(
      getRedactedClass({ themaId: 'themaID', isCobrowseScreensharing })
    ).toBe('');
  });
  test('if getRedactedClass returns the redacted class for a non-existent thema', async () => {
    expect(
      getRedactedClass({
        themaId: 'someNonExistingThemaName',
        isCobrowseScreensharing,
      })
    ).toBe(REDACTED_CLASS);
  });
  test('if getRedactedClass returns the redacted class correctly for a content scope', async () => {
    expect(
      getRedactedClass({
        themaId: 'themaIDScopeRedacted',
        isCobrowseScreensharing,
      })
    ).toBe('');
    expect(
      getRedactedClass({
        themaId: 'themaIDScopeRedacted',
        scopeRequested: 'content',
        isCobrowseScreensharing,
      })
    ).toBe(REDACTED_CLASS);
    expect(
      getRedactedClass({
        themaId: 'themaIDRedacted',
        scopeRequested: 'content',
        isCobrowseScreensharing,
      })
    ).toBe(REDACTED_CLASS);
    expect(
      getRedactedClass({
        themaId: 'themaID',
        scopeRequested: 'content',
        isCobrowseScreensharing,
      })
    ).toBe('');
  });
});
