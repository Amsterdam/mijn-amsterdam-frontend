import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { PartialDeep } from 'type-fest';

import { MijnGegevensThema } from './ProfilePrivate';
import type { Adres } from '../../../../../server/services/brp/brp-types';
import type { BRPData } from '../../../../../server/services/profile/brp.types';
import { ContactMoment } from '../../../../../server/services/salesforce/contactmomenten.types';
import { AppState } from '../../../../../universal/types/App.types';
import MockApp from '../../../MockApp';
import { routeConfig } from '../Profile-thema-config';

const testState = (
  responseBRP: BRPData | object = {},
  responseSF: ContactMoment[] = []
) => ({
  BRP: { status: 'OK', content: responseBRP },
  KVK: { status: 'OK', content: null },
  KLANT_CONTACT: { status: 'OK', content: responseSF },
});

const panelHeadings = [
  'Persoonlijke gegevens',
  'Adres',
  'Partner',
  'Ouders',
  'Kinderen',
];

describe('<Profile />', () => {
  const routeEntry = routeConfig.themaPageBRP.path;

  function Component({
    state,
  }: {
    state?: PartialDeep<BRPData, { recurseIntoArrays: true }>;
  }) {
    return (
      <MockApp
        routeEntry={routeEntry}
        routePath={routeEntry}
        component={MijnGegevensThema}
        state={testState(state) as AppState}
      />
    );
  }

  test('Lives in Mokum + verbintenis: displays all data', async () => {
    render(
      <Component
        state={{
          persoon: {
            geslachtsnaam: 'Mooier',
            geboorteplaatsnaam: 'Neverland',
            mokum: true,
          },
          adres: {
            straatnaam: 'Mooie Straat',
            huisnummer: '1',
            landnaam: 'Nederland',
            _adresSleutel: 'x',
          },
          verbintenis: {
            datumSluiting: '2020-01-01',
          },
          ouders: [
            {
              voornamen: 'Piet',
              geslachtsnaam: 'Mooier',
            },
          ],
          kinderen: [
            {
              voornamen: 'Klein',
              geslachtsnaam: 'Mooier',
            },
          ],
        }}
      />
    );
    expect(
      screen.getByRole('heading', {
        name: 'Mijn gegevens',
      })
    ).toBeInTheDocument();
    expect(screen.getByText('Mooier')).toBeInTheDocument();
    expect(screen.getByText('Neverland')).toBeInTheDocument();

    const panelHeadings = [
      'Persoonlijke gegevens',
      'Adres',
      'Partner',
      'Ouders',
      'Kinderen',
    ];

    panelHeadings.forEach((heading) => {
      expect(screen.getByText(heading)).toBeInTheDocument();
    });

    expect(screen.getByText('Verhuizing doorgeven')).toBeInTheDocument();
    expect(
      screen.getByText('Onjuiste inschrijving melden')
    ).toBeInTheDocument();
    expect(screen.queryByText('Adres in onderzoek')).not.toBeInTheDocument();
    expect(
      screen.queryByText('Vertrokken Onbekend Waarheen')
    ).not.toBeInTheDocument();
  });

  test('Lives in Mokum and has no verbintenis: display all data', async () => {
    render(
      <Component
        state={{
          persoon: { mokum: true },
          adres: {
            straatnaam: 'Prachtige Straat',
            huisnummer: '13',
            landnaam: 'Nederland',
            _adresSleutel: 'x',
          },
          verbintenis: undefined,
          ouders: [{ voornamen: 'Hendrik' }, { voornamen: 'Marie' }],
          kinderen: [{ voornamen: 'Dirkje' }],
        }}
      />
    );

    screen.getByText('Prachtige Straat 13');

    const button = screen.getByTitle('Toon inhoud over Ouders');
    await userEvent.click(button);

    screen.getByText('Hendrik');
    screen.getByText('Marie');

    const button2 = screen.getByTitle('Toon inhoud over Kinderen');
    await userEvent.click(button2);

    screen.getByText('Dirkje');
  });

  test('Matches the Full Page snapshot Non-Mokum', async () => {
    render(
      <Component
        state={{
          persoon: { mokum: false },
          adres: { landnaam: 'Nederland', _adresSleutel: 'x' },
          ouders: [{ voornamen: 'Hendrik' }, { voornamen: 'Marie' }],
        }}
      />
    );

    const panelHeadingsNonMokum = ['Persoonlijke gegevens', 'Adres'];

    panelHeadingsNonMokum.forEach((heading) => {
      expect(screen.getByText(heading)).toBeInTheDocument();
    });

    panelHeadings
      .filter((heading) => !panelHeadingsNonMokum.includes(heading))
      .forEach(async (heading) => {
        expect(await screen.findByText(heading)).not.toBeInTheDocument();
      });

    expect(screen.queryByText('Ouders')).not.toBeInTheDocument();
    expect(
      screen.getByText('Verhuizing naar Amsterdam doorgeven')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Onjuiste inschrijving melden')
    ).toBeInTheDocument();
  });

  test('Matches the Full Page snapshot Not living in Netherlands', async () => {
    render(
      <Component
        state={{
          persoon: {},
          adres: {
            landnaam: 'Nicaragua',
          },
        }}
      />
    );

    expect(
      await screen.queryByText('Onjuiste inschrijving melden')
    ).not.toBeInTheDocument();
    expect(await screen.queryByText('Nicaragua')).not.toBeInTheDocument();
  });

  test('Matches the Full Page snapshot no address known', async () => {
    render(
      <Component
        state={{ persoon: {}, adres: {} as Adres, adresHistorisch: [] }}
      />
    );
    expect(screen.queryByText('Gegevens')).toBeInTheDocument();
    expect(screen.queryByText('onbekend')).toBeInTheDocument();
  });

  test('Matches the Full Page snapshot "Punt adres" in onderzoek', async () => {
    {
      const comp = render(
        <Component state={{ persoon: { adresInOnderzoek: '089999' } }} />
      );
      expect(comp.getByText('Adres in onderzoek')).toBeInTheDocument();
      const adresInfo = await comp.queryByText(
        /U woont niet meer op het adres waarop u staat ingeschreven\./
      );
      expect(adresInfo).toBeInTheDocument();
    }
    // Render can only be called once in per test.
    cleanup();
    {
      const comp = render(
        <Component state={{ persoon: { adresInOnderzoek: '080000' } }} />
      );
      expect(comp.getByText('Adres in onderzoek')).toBeInTheDocument();
      const adresInfo2 = await comp.queryByText(
        /Op dit moment onderzoeken wij of u nog steeds woont op het adres/
      );
      expect(adresInfo2).toBeInTheDocument();
    }
  });

  test('Shows vertrokken onbekend waarheen', () => {
    render(
      <Component state={{ persoon: { vertrokkenOnbekendWaarheen: true } }} />
    );

    expect(
      screen.getByText('Vertrokken Onbekend Waarheen')
    ).toBeInTheDocument();
  });

  test('Shows foreign nationalities', () => {
    render(
      <Component
        state={{
          persoon: {
            nationaliteiten: [
              {
                omschrijving: 'Armeense',
              },
              {
                omschrijving: 'Turkse',
              },
            ],
          },
        }}
      />
    );
    expect(screen.getByText('Armeense, Turkse')).toBeInTheDocument();
  });

  test('Shows max 3 contactmomenten', async () => {
    const user = userEvent.setup();

    function Component() {
      return (
        <MockApp
          routeEntry={routeEntry}
          routePath={routeEntry}
          component={MijnGegevensThema}
          state={
            testState({ persoon: { mokum: true } }, [
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
            ]) as AppState
          }
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
    render(
      <Component
        state={{
          persoon: {
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
        }}
      />
    );
    expect(screen.getByText('Nederlandse')).toBeInTheDocument();
    expect(screen.queryByText('Armeense, Turkse')).toBeNull();
  });
});
