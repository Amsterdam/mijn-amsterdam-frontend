import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { generatePath } from 'react-router';
import { MutableSnapshot } from 'recoil';

import { MijnGegevensThema } from './ProfilePrivate';
import { ContactMoment } from '../../../../server/services/salesforce/contactmomenten.types';
import { Adres, AppState, BRPData } from '../../../../universal/types';
import { appStateAtom } from '../../../hooks/useAppState';
import MockApp from '../../MockApp';
import { routes } from '../Profile-thema-config';

const responseData = {
  adres: {
    huisletter: null,
    huisnummer: '1',
    huisnummertoevoeging: null,
    postcode: '1064 BH',
    straatnaam: 'Burgemeester R\u00f6ellstr',
    landnaam: 'Nederland',
    woonplaatsNaam: 'Amsterdam',
    begindatumVerblijf: '1967-01-01T00:00:00Z',
    _adresSleutel: 'foo:bar',
  },
  adresHistorisch: [
    {
      begindatumVerblijf: '2005-09-01T00:00:00Z',
      einddatumVerblijf: '2012-08-01T00:00:00Z',
      huisletter: null,
      huisnummer: '9',
      huisnummertoevoeging: 'H',
      postcode: '1098 NK',
      straatnaam: 'Ampèrestraat',
      woonplaatsNaam: 'Amsterdam',
    },
    {
      begindatumVerblijf: '1990-01-01T00:00:00Z',
      einddatumVerblijf: '2005-09-01T00:00:00Z',
      huisletter: null,
      huisnummer: '9',
      huisnummertoevoeging: '3',
      postcode: '1098 AA',
      straatnaam: 'Middenweg',
      woonplaatsNaam: 'Amsterdam',
    },
  ],

  persoon: {
    vertrokkenOnbekendWaarheen: false,
    datumVertrekUitNederland: '1967-01-01T00:00:00Z',
    aanduidingNaamgebruikOmschrijving: 'Eigen geslachtsnaam',
    omschrijvingAdellijkeTitel: 'Hertogin',
    bsn: '129095205',
    geboortedatum: '1950-01-01T00:00:00Z',
    geboortelandnaam: 'Nederland',
    geboorteplaatsnaam: 'Lochem',
    gemeentenaamInschrijving: 'Amsterdam',
    geslachtsnaam: 'Beemsterboer',
    nationaliteiten: [
      {
        omschrijving: 'Nederlandse',
      },
      {
        omschrijving: 'Turkse',
      },
    ],
    omschrijvingBurgerlijkeStaat: 'Gehuwd',
    omschrijvingGeslachtsaanduiding: 'Man',
    opgemaakteNaam: 'W. Beemsterboer',
    voornamen: 'Wesley',
    voorvoegselGeslachtsnaam: null,
    mokum: true,
    // adresInOnderzoek: '080000',
  },
  ouders: [
    {
      geboortedatum: '1920-01-01T00:00:00Z',
      geboortelandnaam: 'Nederland',
      geboorteplaatsnaam: 'Lochem',
      geslachtsnaam: 'Beemsterboer',
      nationaliteiten: [
        {
          omschrijving: 'Nederlandse',
        },
      ],
      omschrijvingGeslachtsaanduiding: 'Man',
      opgemaakteNaam: 'S. Beemsterboer',
      voornamen: 'Senior',
      bsn: '123456780',
      voorvoegselGeslachtsnaam: null,
    },
    {
      geboortedatum: '1920-01-01T00:00:00Z',
      geboortelandnaam: 'Nederland',
      geboorteplaatsnaam: 'Lochem',
      geslachtsnaam: 'Beemsterboerin',
      bsn: '123456780',
      nationaliteiten: [
        {
          omschrijving: 'Nederlandse',
        },
      ],
      omschrijvingGeslachtsaanduiding: 'Vrouw',
      opgemaakteNaam: 'Sa. Beemsterboer',
      voornamen: 'Seniora',
      voorvoegselGeslachtsnaam: null,
    },
  ],
  verbintenis: {
    datumOntbinding: null,
    datumSluiting: '1999-01-01T01:01:01.000Z',
    landnaamSluiting: 'Marokko',
    persoon: {
      bsn: '123456780',
      geboortedatum: '2019-07-08T09:14:58.963Z',
      geslachtsaanduiding: null,
      geslachtsnaam: 'Bakker',
      overlijdensdatum: null,
      voornamen: 'Souad',
      voorvoegselGeslachtsnaam: null,
    },
    plaatsnaamSluitingOmschrijving: 'Asilah',
    soortVerbintenis: 'H',
    soortVerbintenisOmschrijving: 'Huwelijk',
  },
  verbintenisHistorisch: [
    {
      datumOntbinding: '1998-07-08T09:14:58.963Z',
      datumSluiting: '1912-01-01T01:01:01.000Z',
      landnaamSluiting: 'Marokko',
      persoon: {
        bsn: '123456780',
        geboortedatum: '2019-07-08T09:14:58.963Z',
        geslachtsaanduiding: null,
        geslachtsnaam: 'Bakker',
        overlijdensdatum: null,
        voornamen: 'Souad',
        voorvoegselGeslachtsnaam: null,
      },
      plaatsnaamSluitingOmschrijving: 'Asilah',
      soortVerbintenis: 'H',
      soortVerbintenisOmschrijving: 'Huwelijk',
    },
    {
      datumOntbinding: '2019-07-08T09:14:58.963Z',
      datumSluiting: '',
      landnaamSluiting: 'Marokko',
      persoon: {
        bsn: '123456780',
        geboortedatum: '2019-07-08T09:14:58.963Z',
        geslachtsaanduiding: null,
        geslachtsnaam: 'Bakker',
        overlijdensdatum: null,
        voornamen: 'Souad',
        voorvoegselGeslachtsnaam: null,
      },
      plaatsnaamSluitingOmschrijving: 'Asilah',
      soortVerbintenis: 'H',
      soortVerbintenisOmschrijving: 'Huwelijk',
    },
  ],
  kinderen: [
    {
      bsn: '123456780',
      geboortedatum: '2019-07-08T09:14:58.963Z',
      geslachtsaanduiding: 'M',
      geslachtsnaam: 'Kosterijk',
      overlijdensdatum: null,
      voornamen: 'Yassine',
      voorvoegselGeslachtsnaam: null,
    },
    {
      bsn: '123456780',
      geboortedatum: '2019-07-08T09:14:58.963Z',
      geslachtsaanduiding: 'M',
      geslachtsnaam: 'Kosterijk',
      overlijdensdatum: '2019-07-08T09:14:58.963Z',
      voornamen: 'Marwan',
      voorvoegselGeslachtsnaam: null,
    },
  ],
} as unknown as BRPData;

const testState = (
  responseBRP: BRPData = responseData,
  responseSF: ContactMoment[] = []
) => ({
  BRP: { status: 'OK', content: responseBRP },
  KVK: { status: 'OK', content: null },
  KLANT_CONTACT: { status: 'OK', content: responseSF },
  // PARKEREN: { status: 'OK', content: null },
});

function initializeState(testState: unknown) {
  return (snapshot: MutableSnapshot) =>
    snapshot.set(appStateAtom, testState as AppState);
}

const panelHeadings = [
  'Persoonlijke gegevens',
  'Adres',
  'Burgerlijke staat',
  'Eerdere huwelijken of partnerschappen',
  'Ouders',
  'Kinderen',
  'Vorige adressen',
];

describe('<Profile />', () => {
  const routeEntry = generatePath(routes.BRP);
  const routePath = routes.BRP;

  beforeAll(() => {
    (window.matchMedia as unknown) = vi.fn(() => {
      return {
        addListener: vi.fn(),
        removeListener: vi.fn(),
      };
    });
  });

  test('Matches the Full Page snapshot', async () => {
    function Component() {
      return (
        <MockApp
          routeEntry={routeEntry}
          routePath={routePath}
          component={MijnGegevensThema}
          initializeState={initializeState(testState())}
        />
      );
    }
    render(<Component />);
    expect(
      screen.getByRole('heading', {
        name: 'Mijn gegevens',
      })
    ).toBeInTheDocument();
    expect(
      screen.getByText(responseData.persoon.geslachtsnaam as string)
    ).toBeInTheDocument();
    expect(
      screen.getByText(responseData.persoon.geboorteplaatsnaam as string)
    ).toBeInTheDocument();

    const panelHeadings = [
      'Persoonlijke gegevens',
      'Adres',
      'Burgerlijke staat',
      'Eerdere huwelijken of partnerschappen',
      'Ouders',
      'Kinderen',
      'Vorige adressen',
    ];

    panelHeadings.forEach((heading) => {
      expect(screen.getByText(heading)).toBeInTheDocument();
    });

    expect(screen.getByText('Verhuizing doorgeven')).toBeInTheDocument();
    expect(
      screen.getByText('Onjuiste inschrijving melden')
    ).toBeInTheDocument();
    expect(
      await screen.queryByText('Adres in onderzoek')
    ).not.toBeInTheDocument();
    expect(
      await screen.queryByText('Vertrokken Onbekend Waarheen')
    ).not.toBeInTheDocument();
  });

  test('Matches the Full Page snapshot Non-Mokum', async () => {
    function Component() {
      return (
        <MockApp
          routeEntry={routeEntry}
          routePath={routePath}
          component={MijnGegevensThema}
          initializeState={initializeState(
            testState({
              ...responseData,
              persoon: {
                ...responseData.persoon,
                mokum: false,
              },
            })
          )}
        />
      );
    }

    render(<Component />);

    const panelHeadingsNonMokum = ['Persoonlijke gegevens', 'Adres'];

    panelHeadingsNonMokum.forEach((heading) => {
      expect(screen.getByText(heading)).toBeInTheDocument();
    });

    panelHeadings
      .filter((heading) => !panelHeadingsNonMokum.includes(heading))
      .forEach(async (heading) => {
        expect(await screen.findByText(heading)).not.toBeInTheDocument();
      });

    expect(
      screen.getByText('Verhuizing naar Amsterdam doorgeven')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Onjuiste inschrijving melden')
    ).toBeInTheDocument();
  });

  test('Matches the Full Page snapshot No verbintenis', () => {
    function Component() {
      return (
        <MockApp
          routeEntry={routeEntry}
          routePath={routePath}
          component={MijnGegevensThema}
          initializeState={initializeState(
            testState({
              ...responseData,
              verbintenis: undefined,
            })
          )}
        />
      );
    }

    render(<Component />);

    const panelHeadingsNotHere = ['Verbintenis'];

    panelHeadings
      .filter((heading) => !panelHeadingsNotHere.includes(heading))
      .forEach((heading) => {
        expect(screen.getByText(heading)).toBeInTheDocument();
      });

    panelHeadingsNotHere.forEach(async (heading) => {
      expect(await screen.queryByText(heading)).not.toBeInTheDocument();
    });
  });

  test('Matches the Full Page snapshot Not living in Netherlands', async () => {
    function Component() {
      return (
        <MockApp
          routeEntry={routeEntry}
          routePath={routePath}
          component={MijnGegevensThema}
          initializeState={initializeState(
            testState({
              ...responseData,
              adres: {
                ...responseData.adres,
                landnaam: 'Nicaragua',
              },
            })
          )}
        />
      );
    }
    render(<Component />);

    expect(
      await screen.queryByText('Onjuiste inschrijving melden')
    ).not.toBeInTheDocument();
    expect(await screen.queryByText('Nicaragua')).not.toBeInTheDocument();
  });

  test('Matches the Full Page snapshot no address known', async () => {
    function Component() {
      return (
        <MockApp
          routeEntry={routeEntry}
          routePath={routePath}
          component={MijnGegevensThema}
          initializeState={initializeState(
            testState({
              ...responseData,
              adres: null as unknown as Adres,
              adresHistorisch: [],
            })
          )}
        />
      );
    }
    render(<Component />);
    expect(screen.getByText('Adres onbekend')).toBeInTheDocument();
  });

  test('Matches the Full Page snapshot "Punt adres" in onderzoek', async () => {
    function Component({
      adresInOnderzoek,
    }: {
      adresInOnderzoek: '080000' | '089999' | null;
    }) {
      return (
        <MockApp
          routeEntry={routeEntry}
          routePath={routePath}
          component={MijnGegevensThema}
          initializeState={initializeState(
            testState({
              ...responseData,
              persoon: {
                ...responseData.persoon,
                adresInOnderzoek,
              },
            })
          )}
        />
      );
    }
    {
      const comp = render(<Component adresInOnderzoek="089999" />);
      expect(comp.getByText('Adres in onderzoek')).toBeInTheDocument();
      const adresInfo = await comp.queryByText(
        /U woont niet meer op het adres waarop u staat ingeschreven\./
      );
      expect(adresInfo).toBeInTheDocument();
    }
    // Render can only be called once in per test.
    cleanup();
    {
      const comp = render(<Component adresInOnderzoek="080000" />);
      expect(comp.getByText('Adres in onderzoek')).toBeInTheDocument();
      const adresInfo2 = await comp.queryByText(
        /Op dit moment onderzoeken wij of u nog steeds woont op het adres/
      );
      expect(adresInfo2).toBeInTheDocument();
    }
  });

  test('Shows vertrokken onbekend waarheen', () => {
    function Component() {
      return (
        <MockApp
          routeEntry={routeEntry}
          routePath={routePath}
          component={MijnGegevensThema}
          initializeState={initializeState(
            testState({
              ...responseData,
              persoon: {
                ...responseData.persoon,
                vertrokkenOnbekendWaarheen: true,
              },
            })
          )}
        />
      );
    }

    render(<Component />);

    expect(
      screen.getByText('Vertrokken Onbekend Waarheen')
    ).toBeInTheDocument();
  });

  test('Shows foreign nationalities', () => {
    function Component() {
      return (
        <MockApp
          routeEntry={routeEntry}
          routePath={routePath}
          component={MijnGegevensThema}
          initializeState={initializeState(
            testState({
              ...responseData,
              persoon: {
                ...responseData.persoon,
                nationaliteiten: [
                  {
                    omschrijving: 'Armeense',
                  },
                  {
                    omschrijving: 'Turkse',
                  },
                ],
              },
            })
          )}
        />
      );
    }
    render(<Component />);
    expect(screen.getByText('Armeense, Turkse')).toBeInTheDocument();
  });

  test('Shows max 3 contactmomenten', async () => {
    const user = userEvent.setup();

    function Component() {
      return (
        <MockApp
          routeEntry={routeEntry}
          routePath={routePath}
          component={MijnGegevensThema}
          initializeState={initializeState(
            testState(responseData, [
              {
                datePublished: '2024-05-29 08:02:38',
                datePublishedFormatted: '2024-05-29 08:02:38',
                subject: 'Meldingen',
                referenceNumber: '00002032',
                themaKanaal: 'Contactformulier',
              },
              {
                datePublished: '2024-05-29 08:02:38',
                datePublishedFormatted: '2024-05-29 08:02:38',
                subject: 'Meldingen',
                referenceNumber: '00002032',
                themaKanaal: 'Kanaal Foo',
              },
              {
                datePublished: '2024-05-29 08:02:38',
                datePublishedFormatted: '2024-05-29 08:02:38',
                subject: 'Meldingen',
                referenceNumber: '00002032',
                themaKanaal: 'Kanaal Bar',
              },
              {
                datePublished: '2024-05-29 08:02:38',
                datePublishedFormatted: '2024-05-29 08:02:38',
                subject: 'Meldingen',
                referenceNumber: '00002032',
                themaKanaal: 'Kanaal world',
              },
            ])
          )}
        />
      );
    }
    render(<Component />);
    expect(screen.getByText('Contactmomenten')).toBeInTheDocument();
    await user.click(screen.getAllByText('Toon')[0]);

    ['Contactformulier', 'Kanaal Foo', 'Kanaal Bar'].forEach((kanaal) => {
      expect(screen.getByText(kanaal)).toBeInTheDocument();
    });

    expect(await screen.queryByText('Kanaal world')).not.toBeInTheDocument();
  });

  test('Only shows dutch nationality', () => {
    function Component() {
      return (
        <MockApp
          routeEntry={routeEntry}
          routePath={routePath}
          component={MijnGegevensThema}
          initializeState={initializeState(
            testState({
              ...responseData,
              persoon: {
                ...responseData.persoon,
                nationaliteiten: [
                  {
                    omschrijving: 'Nederlandse',
                  },
                  {
                    omschrijving: 'Armeense',
                  },
                  {
                    omschrijving: 'Turkse',
                  },
                ],
              },
            })
          )}
        />
      );
    }
    render(<Component />);
    expect(screen.getByText('Nederlandse')).toBeInTheDocument();
    expect(screen.queryByText('Armeense, Turkse')).toBeNull();
  });

  it.each([
    [' ', '01 januari 1950'],
    ['A', '01 januari 1950'],
    ['J', '00 00 0000'],
    ['M', '00 00 1950'],
    ['D', '00 januari 1950'],
    ['V', '01 januari 1950'],
  ])(
    'Shows the correctly formatted birthday for indicatieGeboortedatum %s',
    async (indicatieGeboortedatum, geformateerdeGeboortedatum) => {
      function Component() {
        return (
          <MockApp
            routeEntry={routeEntry}
            routePath={routePath}
            component={MijnGegevensThema}
            initializeState={initializeState(
              testState({
                ...responseData,
                persoon: {
                  ...responseData.persoon,
                  indicatieGeboortedatum:
                    indicatieGeboortedatum as typeof responseData.persoon.indicatieGeboortedatum,
                },
              })
            )}
          />
        );
      }
      render(<Component />);

      expect(screen.getAllByText('Geboortedatum')[0]).toBeInTheDocument();
      expect(
        await screen.findByText(geformateerdeGeboortedatum)
      ).toBeInTheDocument();
    }
  );
});
