import Fuse from 'fuse.js';
import { renderRecoilHook } from 'react-recoil-hooks-testing-library';
import { useRecoilValue } from 'recoil';
import { appStateAtom } from '../../hooks';
import { ApiBaseItem, ApiSearchConfig, apiSearchConfigs } from './searchConfig';
import {
  generateSearchIndexPageEntries,
  generateSearchIndexPageEntry,
  isIndexReadyQuery,
  searchConfigAtom,
  useSearch,
  useSearchIndex,
} from './useSearch';

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

const financieleHulpData = {
  deepLinks: {
    budgetbeheer: {
      title: 'Beheer uw budget op FiBu',
      url: 'http://host/bbr/2064866/3',
    },
    lening: {
      title:
        'Kredietsom \u20ac1.689,12 met openstaand termijnbedrag \u20ac79,66',
      url: 'http://host/pl/2442531/1',
    },
    schuldhulp: {
      title: 'Afkoopvoorstellen zijn verstuurd',
      url: 'http://host/srv/2442531/2',
    },
  },
};

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
      keywordsGeneratedFromProps: (item: ApiBaseItem): string[] => [
        'somePropName',
      ],
      keywords: (item: ApiBaseItem): string[] => ['jup'],
      url: (item: ApiBaseItem) => item.link.to,
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
          "url": "/vergunningen/detail/1370220470",
        },
      ]
    `);
  });

  test('generateSearchIndexPageEntries with disabled/enabled feature', () => {
    const config = apiSearchConfigs.find(
      (config) => config.apiName === 'FINANCIELE_HULP'
    )!;
    const origVal = config.isEnabled;
    config.isEnabled = false;
    const pageEntries = generateSearchIndexPageEntries(
      'private',
      'FINANCIELE_HULP',
      financieleHulpData
    );
    expect(pageEntries).toMatchInlineSnapshot(`Array []`);
    config.isEnabled = true;
    const pageEntriesEnabled = generateSearchIndexPageEntries(
      'private',
      'FINANCIELE_HULP',
      financieleHulpData
    );
    expect(pageEntriesEnabled).toMatchInlineSnapshot(`
      Array [
        Object {
          "description": "Bekijk Beheer uw budget op FiBu",
          "displayTitle": [Function],
          "keywords": Array [
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
        Object {
          "description": "Bekijk Kredietsom €1.689,12 met openstaand termijnbedrag €79,66",
          "displayTitle": [Function],
          "keywords": Array [
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
        Object {
          "description": "Bekijk Afkoopvoorstellen zijn verstuurd",
          "displayTitle": [Function],
          "keywords": Array [
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
            "url": "/vergunningen/detail/1726584505",
          },
          "refIndex": 20,
        },
      ]
    `);
    expect(state.index?.search('paspoort')[0].item.displayTitle?.('paspoort'))
      .toMatchInlineSnapshot(`
      <React.Fragment>
        <span
          className="DisplayPath"
        >
          <Memo(InnerHtmlTag)
            className="DisplayPathSegment"
            el="span"
          >
            Burgerzaken
          </Memo(InnerHtmlTag)>
        </span>
      </React.Fragment>
    `);

    expect(state.index?.search('aktes')[0].item.displayTitle?.('aktes'))
      .toMatchInlineSnapshot(`
      <React.Fragment>
        <span
          className="DisplayPath"
        >
          <Memo(InnerHtmlTag)
            className="DisplayPathSegment"
            el="span"
          >
            Burgerzaken
          </Memo(InnerHtmlTag)>
        </span>
      </React.Fragment>
    `);
    expect(
      state.index
        ?.search('Identiteitskaart')[0]
        .item.displayTitle?.('Identiteitskaart')
    ).toMatchInlineSnapshot(`
      <React.Fragment>
        <span
          className="DisplayPath"
        >
          <Memo(InnerHtmlTag)
            className="DisplayPathSegment"
            el="span"
          >
            Burgerzaken
          </Memo(InnerHtmlTag)>
        </span>
      </React.Fragment>
    `);
    expect(state.index?.search('Stadspas')[0].item.displayTitle?.('Stadspas'))
      .toMatchInlineSnapshot(`
      <React.Fragment>
        <span
          className="DisplayPath"
        >
          <Memo(InnerHtmlTag)
            className="DisplayPathSegment"
            el="span"
          >
            &lt;em&gt;Stadspas&lt;/em&gt;
          </Memo(InnerHtmlTag)>
        </span>
      </React.Fragment>
    `);
  });
});
