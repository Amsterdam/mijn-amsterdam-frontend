import { apiSuccessResult } from '../universal/helpers/api.ts';
import type { ServiceResults } from '../server/services/content-tips/tip-types.ts';
import { forTesting } from './generate-user-data-overview.ts';
import type { ApiPatternResponseA } from '../server/services/patroon-c/api-service.ts';

const apiPatternResponseA: ApiPatternResponseA = {
  tips: [],
  isKnown: true,
  url: 'https://mock.mo',
  notifications: [],
};

const mockServiceResults: ServiceResults = {
  BRP: apiSuccessResult({ persoon: { geboortedatum: '1990-01-01' } }),
  AFVAL: apiSuccessResult([]),
  HLI: apiSuccessResult({
    isKnown: true,
    stadspas: null,
    regelingen: [],
    specificaties: [],
  }),
  MOCK: apiSuccessResult(apiPatternResponseA),
  MOCK_B: apiSuccessResult({}),
};

test('test', () => {
  const availableUserThemas =
    forTesting.getAvailableUserThemas(mockServiceResults);
  expect(availableUserThemas).toMatchInlineSnapshot(`
    {
      "BRP": "Mijn gegevens",
      "HLI": "Stadspas en regelingen bij laag inkomen",
      "MOCK": undefined,
    }
  `);
});
