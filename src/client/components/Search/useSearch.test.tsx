import { render, screen } from '@testing-library/react';
import {
  generateSearchIndexPageEntry,
  generateSearchIndexPageEntries,
  useSearch,
  useSearchIndex,
  useSearchTerm,
  useSearchResults,
  searchConfigAtom,
  isIndexReadyQuery,
} from './useSearch';
import { renderRecoilHook } from 'react-recoil-hooks-testing-library';
import { ApiBaseItem, ApiSearchConfig } from './searchConfig';
import { appStateAtom } from '../../hooks';
import { useRecoilValue } from 'recoil';
import Fuse from 'fuse.js';

const vergunningenData = [
  {
    caseType: 'GPK',
    title: 'Europse gehandicaptenparkeerkaart (GPK)',
    identifier: 'Z/000/000008',
    status: 'Ontvangen',
    description: 'Amstel 1 GPK aanvraag',
    link: {
      to: '/vergunningen/detail/1726584505',
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

describe('Search hooks and helpers', () => {
  test('useSearch', () => {
    const {
      result: {
        current: [state],
      },
    } = renderRecoilHook(useSearch, {
      states: [
        {
          recoilState: searchConfigAtom,
          initialValue: {
            index: null,
            apiNames: ['test'],
          },
        },
      ],
    });

    expect(state).toEqual({
      index: null,
      apiNames: ['test'],
    });
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
      getApiBaseItems: () => [],
      displayTitle,
      keywordSourceProps: (item: ApiBaseItem): string[] => ['somePropName'],
      keywords: (item: ApiBaseItem): string[] => ['jup'],
      title: (item: ApiBaseItem) => item.link.title,
      url: (item: ApiBaseItem) => item.link.to,
      description: (item: ApiBaseItem) => {
        return `Bekijk ${item.title}`;
      },
      profileTypes: ['private'],
    };
    const entry = generateSearchIndexPageEntry(item1, configItem);

    expect(entry.title).toBe('test-link');
    expect(entry.url).toBe('/test/to/id');
    expect(entry.description).toBe('Bekijk test item 1');
    expect(entry.keywords).toEqual(['yes-no-maybe', 'jup']);
  });

  test('generateSearchIndexPageEntries', () => {
    const pageEntries = generateSearchIndexPageEntries(
      'private',
      'VERGUNNINGEN',
      vergunningenData
    );
    expect(pageEntries).toMatchInlineSnapshot(`
      Array [
        Object {
          "description": "Bekijk Europse gehandicaptenparkeerkaart (GPK)",
          "displayTitle": [Function],
          "keywords": Array [
            "GPK",
            "Europse gehandicaptenparkeerkaart (GPK)",
            "Z/000/000008",
            "Ontvangen",
            "Amstel 1 GPK aanvraag",
            "vergunningsaanvraag",
          ],
          "title": "Europse gehandicaptenparkeerkaart (GPK) Z/000/000008",
          "url": "/vergunningen/detail/1726584505",
        },
        Object {
          "description": "Bekijk Tijdelijke verkeersmaatregel",
          "displayTitle": [Function],
          "keywords": Array [
            "Omzettingsvergunning",
            "Tijdelijke verkeersmaatregel",
            "Z/000/000001",
            "Amstel 1 Omzettingsvergunning voor het een en ander",
            "Ontvangen",
            "vergunningsaanvraag",
          ],
          "title": "Tijdelijke verkeersmaatregel Z/000/000001",
          "url": "/vergunningen/detail/1467362160",
        },
        Object {
          "description": "Bekijk Parkeerontheffingen Blauwe zone particulieren",
          "displayTitle": [Function],
          "keywords": Array [
            "Parkeerontheffingen Blauwe zone particulieren",
            "Z/21/1500000",
            "Afgehandeld",
            "vergunningsaanvraag",
          ],
          "title": "Parkeerontheffingen Blauwe zone particulieren Z/21/1500000",
          "url": "/vergunningen/detail/1370220470",
        },
      ]
    `);
  });

  test('useSearchIndex index not ready', () => {
    const {
      result: { current: state },
    } = renderRecoilHook(
      () => {
        useSearchIndex();
        return useRecoilValue(isIndexReadyQuery);
      },
      {
        states: [
          {
            recoilState: searchConfigAtom,
            initialValue: {
              index: null,
              apiNames: [],
            },
          },
          {
            recoilState: appStateAtom,
            initialValue: {
              VERGUNNINGEN: { content: [], status: 'PRISTINE' },
            },
          },
        ],
      }
    );
    expect(state).toBe(false);
  });

  test('useSearchIndex index is ready', () => {
    const {
      result: { current: state },
    } = renderRecoilHook(
      () => {
        useSearchIndex();
        return useRecoilValue(isIndexReadyQuery);
      },
      {
        states: [
          {
            recoilState: searchConfigAtom,
            initialValue: {
              index: null,
              apiNames: [],
            },
          },
          {
            recoilState: appStateAtom,
            initialValue: {
              VERGUNNINGEN: { content: vergunningenData, status: 'OK' },
            },
          },
        ],
      }
    );
    expect(state).toBe(true);
  });

  test('useSearchIndex', () => {
    const {
      result: {
        current: [state],
      },
    } = renderRecoilHook(
      () => {
        useSearchIndex();
        return useSearch();
      },
      {
        states: [
          {
            recoilState: searchConfigAtom,
            initialValue: {
              index: null,
              apiNames: [],
            },
          },
          {
            recoilState: appStateAtom,
            initialValue: {
              VERGUNNINGEN: { content: vergunningenData, status: 'OK' },
            },
          },
        ],
      }
    );

    expect(state.apiNames).toEqual(['VERGUNNINGEN']);
    expect(state.index).not.toBeNull();
    expect(state.index instanceof Fuse).toBe(true);
    expect(state.index?.search('gehandicaptenparkeerkaart'))
      .toMatchInlineSnapshot(`
      Array [
        Object {
          "item": Object {
            "description": "Bekijk Europse gehandicaptenparkeerkaart (GPK)",
            "displayTitle": [Function],
            "keywords": Array [
              "GPK",
              "Europse gehandicaptenparkeerkaart (GPK)",
              "Z/000/000008",
              "Ontvangen",
              "Amstel 1 GPK aanvraag",
              "vergunningsaanvraag",
            ],
            "title": "Europse gehandicaptenparkeerkaart (GPK) Z/000/000008",
            "url": "/vergunningen/detail/1726584505",
          },
          "refIndex": 18,
        },
      ]
    `);
    expect(state.index?.search('paspoort')[0].item.title).toBe(
      'Burgerzaken overzicht'
    );
    expect(state.index?.search('aktes')[0].item.title).toBe(
      'Burgerzaken overzicht'
    );
    expect(state.index?.search('Identiteitskaart')[0].item.title).toBe(
      'Burgerzaken overzicht'
    );
    expect(state.index?.search('Stadspas')[0].item.title).toBe(
      'Stadspas | overzicht'
    );
  });
});
