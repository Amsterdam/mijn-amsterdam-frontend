import { ReactNode } from 'react';

import { renderHook } from '@testing-library/react';
import { RecoilRoot } from 'recoil';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import {
  API_SEARCH_CONFIG_DEFAULT,
  ApiBaseItem,
  ApiSearchConfig,
  apiSearchConfigs,
  displayPath,
} from './search-config';
import * as remoteConfig from './search-config.json';
import {
  generateSearchIndexPageEntries,
  generateSearchIndexPageEntry,
  requestID,
  useSearchIndex,
} from './useSearch';
import { VergunningFrontend } from '../../../server/services/vergunningen/config-and-types';
import { bffApi } from '../../../testing/utils';
import { AppState } from '../../../universal/types/App.types';
import { appStateAtom } from '../../hooks/useAppState';
import { routeConfig } from '../MyArea/MyArea-thema-config';

export function setupFetchStub(data: any) {
  return function fetchStub(_url: string) {
    return new Promise((resolve) => {
      resolve({
        json: () => Promise.resolve(data),
      });
    });
  };
}

const vergunningenData = [
  {
    caseType: 'GPK',
    title: 'Europse gehandicaptenparkeerkaart (GPK)',
    identifier: 'Z/000/000008',
    status: 'Ontvangen',
    description: 'Amstel 1 GPK aanvraag',
    link: {
      to: routeConfig.themaPage.path + '/vergunningen/detail/1726584505',
      title: 'Bekijk hoe het met uw aanvraag staat',
    },
  },
  {
    caseType: 'Omzettingsvergunning',
    title: 'Tijdelijke verkeersmaatregel',
    identifier: 'Z/000/000001',
    description: 'Amstel 1 Omzettingsvergunning voor het een en ander',
    status: 'Ontvangen',
    link: {
      to: '/vergunningen/detail/1467362160',
      title: 'Bekijk hoe het met uw aanvraag staat',
    },
  },
  {
    caseType: 'Parkeerontheffingen Blauwe zone particulieren',
    title: 'Parkeerontheffingen Blauwe zone particulieren',
    identifier: 'Z/21/1500000',
    kenteken: 'A0-03-48N',
    status: 'Afgehandeld',
    link: {
      to: '/vergunningen/detail/1370220470',
      title: 'Bekijk hoe het met uw aanvraag staat',
    },
  },
];

const krefiaData = {
  deepLinks: [
    {
      type: 'budgetbeheer',
      status: 'unread',
      link: {
        title: 'Beheer uw budget op FiBu',
        to: 'http://host/bbr/2064866/3',
      },
    },
    {
      type: 'lening',
      status: 'unread',
      link: {
        title:
          'Kredietsom \u20ac1.689,12 met openstaand termijnbedrag \u20ac79,66',
        to: 'http://host/pl/2442531/1',
      },
    },
    {
      type: 'schuldhulp',
      status: 'unread',
      link: {
        title: 'Afkoopvoorstellen zijn verstuurd',
        to: 'http://host/srv/2442531/2',
      },
    },
  ],
};

describe('Search hooks and helpers', () => {
  beforeEach(() => {
    bffApi.get('/services/search-config').reply(200, { content: remoteConfig });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test('generateSearchIndexPageEntry', () => {
    const item1: ApiBaseItem = {
      title: 'test item 1',
      description: 'foo and bar',
      somePropName: 'yes-no-maybe',
      link: {
        title: 'test-link',
        to: '/test/to/id',
      },
    };
    const displayTitle = (item: any) => {
      return (term: string) => {
        if ('somePropName' in item) {
          return 'FOUND-somePropName';
        }
        return item.title;
      };
    };
    const configItem: ApiSearchConfig = {
      stateKey: 'MY_LOCATION',
      getApiBaseItems: () => [],
      displayTitle,
      keywordsGeneratedFromProps: ['somePropName'],
      keywords: ['jup'],
      url: (item: ApiBaseItem) => item.link?.to || '/',
      description: (item: ApiBaseItem) => {
        return `Bekijk ${item.title}`;
      },
      profileTypes: ['private'],
    };

    const entry = generateSearchIndexPageEntry(item1, configItem);
    expect(entry.url).toBe('/test/to/id');
    expect(entry.description).toBe('Bekijk test item 1');
    expect(entry.keywords).toEqual(['yes-no-maybe', 'jup']);
  });

  test('generateSearchIndexPageEntries', () => {
    const apiConfigRemote = {
      keywordsGeneratedFromProps: [
        'caseType',
        'title',
        'status',
        'decision',
        'identifier',
        'description',
      ],
      keywords: ['vergunningsaanvraag'],
    };
    const pageEntries = generateSearchIndexPageEntries(
      'private',
      {
        VERGUNNINGEN: { content: vergunningenData, status: 'OK' },
      } as AppState,
      [
        {
          ...API_SEARCH_CONFIG_DEFAULT,
          stateKey: 'VERGUNNINGEN',
          displayTitle: (vergunning: VergunningFrontend) => (term: string) => {
            return displayPath(term, [vergunning.title, vergunning.identifier]);
          },
          ...apiConfigRemote,
        },
      ]
    );
    expect(pageEntries).toMatchInlineSnapshot(`
      [
        {
          "description": "Bekijk Europse gehandicaptenparkeerkaart (GPK)",
          "displayTitle": [Function],
          "keywords": [
            "GPK",
            "Europse gehandicaptenparkeerkaart (GPK)",
            "Z/000/000008",
            "Ontvangen",
            "Amstel 1 GPK aanvraag",
            "vergunningsaanvraag",
          ],
          "url": "/buurt/vergunningen/detail/1726584505",
        },
        {
          "description": "Bekijk Tijdelijke verkeersmaatregel",
          "displayTitle": [Function],
          "keywords": [
            "Omzettingsvergunning",
            "Tijdelijke verkeersmaatregel",
            "Z/000/000001",
            "Amstel 1 Omzettingsvergunning voor het een en ander",
            "Ontvangen",
            "vergunningsaanvraag",
          ],
          "url": "/vergunningen/detail/1467362160",
        },
        {
          "description": "Bekijk Parkeerontheffingen Blauwe zone particulieren",
          "displayTitle": [Function],
          "keywords": [
            "Parkeerontheffingen Blauwe zone particulieren",
            "Z/21/1500000",
            "Afgehandeld",
            "vergunningsaanvraag",
          ],
          "url": "/vergunningen/detail/1370220470",
        },
      ]
    `);
  });

  test('generateSearchIndexPageEntries with disabled/enabled feature', () => {
    const config = apiSearchConfigs.find(
      (config) => config.stateKey === 'KREFIA'
    )!;

    const remoteConfig = {
      keywords: [
        'lening',
        'fibu',
        'schuldhulpregeling',
        'regeling',
        'krediet',
        'budgetbeheer',
      ],
    };

    const origVal = config.isEnabled;
    config.isEnabled = false;

    const appState = {
      KREFIA: { content: krefiaData, status: 'OK' },
    } as unknown as AppState;

    const pageEntries = generateSearchIndexPageEntries('private', appState, [
      {
        ...config,
        ...remoteConfig,
      },
    ]);

    expect(pageEntries).toMatchInlineSnapshot('[]');

    config.isEnabled = true;

    const pageEntriesEnabled = generateSearchIndexPageEntries(
      'private',
      appState,
      [
        {
          ...config,
          ...remoteConfig,
        },
      ]
    );

    expect(pageEntriesEnabled).toMatchInlineSnapshot(`
      [
        {
          "description": "Bekijk Beheer uw budget op FiBu",
          "displayTitle": [Function],
          "keywords": [
            "Beheer uw budget op FiBu",
            "lening",
            "fibu",
            "schuldhulpregeling",
            "regeling",
            "krediet",
            "budgetbeheer",
          ],
          "url": "http://host/bbr/2064866/3",
        },
        {
          "description": "Bekijk Kredietsom €1.689,12 met openstaand termijnbedrag €79,66",
          "displayTitle": [Function],
          "keywords": [
            "Kredietsom €1.689,12 met openstaand termijnbedrag €79,66",
            "lening",
            "fibu",
            "schuldhulpregeling",
            "regeling",
            "krediet",
            "budgetbeheer",
          ],
          "url": "http://host/pl/2442531/1",
        },
        {
          "description": "Bekijk Afkoopvoorstellen zijn verstuurd",
          "displayTitle": [Function],
          "keywords": [
            "Afkoopvoorstellen zijn verstuurd",
            "lening",
            "fibu",
            "schuldhulpregeling",
            "regeling",
            "krediet",
            "budgetbeheer",
          ],
          "url": "http://host/srv/2442531/2",
        },
      ]
    `);
    config.isEnabled = origVal;
  });

  test('useSearchIndex <failure>', async () => {
    vi.spyOn(global, 'fetch').mockImplementation(() => Promise.reject());

    const wrapper = ({ children }: { children: ReactNode }) => (
      <RecoilRoot
        initializeState={(snapshot) => {
          snapshot.set(appStateAtom, {
            VERGUNNINGEN: { content: vergunningenData, status: 'OK' },
          } as AppState);

          snapshot.set(requestID, 1);
        }}
      >
        {children}
      </RecoilRoot>
    );

    const { result, rerender } = renderHook(useSearchIndex, {
      wrapper,
    });

    expect(result.current).toBeUndefined();

    rerender();

    expect(result.current).toBeUndefined();
  });
});
