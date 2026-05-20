import { forTesting } from './generate-user-data-overview.ts';
import type { ServiceResults } from '../server/services/content-tips/tip-types.ts';
import { apiSuccessResult } from '../universal/helpers/api.ts';

describe('getAvailableUserThemas', () => {
  function wrap(results: Record<string, any>): ServiceResults {
    const entries = Object.entries(results);
    const wrapped = entries.map(([k, v]) => [k, apiSuccessResult(v)]);
    return Object.fromEntries(wrapped);
  }

  test('Available themas', () => {
    const mockServiceResults: ServiceResults = wrap({
      BRP: { persoon: { geboortedatum: '1990-01-01' } },
      HLI: {
        isKnown: true,
        stadspas: null,
        regelingen: [],
        specificaties: [],
      },
    });
    const availableUserThemas =
      forTesting.getAvailableUserThemas(mockServiceResults);
    expect(availableUserThemas).toStrictEqual({
      BRP: 'Mijn gegevens',
      HLI: 'Stadspas en regelingen bij laag inkomen',
    });
  });

  test('Not available themas', () => {
    const mockServiceResults: ServiceResults = wrap({
      A: [],
      B: {},
      C: null,
      D: {
        isKnown: false,
        url: 'https://mock.mo',
      },
      E: {
        a: null,
      },
      F: {
        a: [],
        b: [],
        c: [],
      },
    });
    const availableUserThemas =
      forTesting.getAvailableUserThemas(mockServiceResults);
    expect(availableUserThemas).toStrictEqual({});
  });
});
