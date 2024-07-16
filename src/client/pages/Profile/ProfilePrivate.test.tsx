import { render, screen } from '@testing-library/react';

import { generatePath } from 'react-router-dom';
import { MutableSnapshot } from 'recoil';
import { AppRoutes } from '../../../universal/config/routes';
import { appStateAtom } from '../../hooks/useAppState';
import MockApp from '../MockApp';
import Profile from './ProfilePrivate';

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
    vertrokkenOnbekendWaarheen: true,
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
    adresInOnderzoek: '080000',
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
};

const testState = (content = responseData) => ({
  BRP: { status: 'OK', content },
});

function initializeState(testState: any) {
  return (snapshot: MutableSnapshot) => snapshot.set(appStateAtom, testState);
}

describe('<Profile />', () => {
  const routeEntry = generatePath(AppRoutes.BRP);
  const routePath = AppRoutes.BRP;

  beforeAll(() => {
    (window.matchMedia as any) = vi.fn(() => {
      return {
        addListener: vi.fn(),
        removeListener: vi.fn(),
      };
    });
  });

  it('Matches the Full Page snapshot', () => {
    const Component = () => (
      <MockApp
        routeEntry={routeEntry}
        routePath={routePath}
        component={Profile}
        initializeState={initializeState(testState())}
      />
    );
    expect(render(<Component />).asFragment()).toMatchSnapshot();
  });

  it('Matches the Full Page snapshot Non-Mokum', () => {
    const Component = () => (
      <MockApp
        routeEntry={routeEntry}
        routePath={routePath}
        component={Profile}
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
    expect(render(<Component />).asFragment()).toMatchSnapshot();
  });

  it('Matches the Full Page snapshot No verbintenis', () => {
    const Component = () => (
      <MockApp
        routeEntry={routeEntry}
        routePath={routePath}
        component={Profile}
        initializeState={initializeState(
          testState({
            ...responseData,
            verbintenis: null,
          } as any)
        )}
      />
    );
    expect(render(<Component />).asFragment()).toMatchSnapshot();
  });

  it('Matches the Full Page snapshot Not living in Netherlands', () => {
    const Component = () => (
      <MockApp
        routeEntry={routeEntry}
        routePath={routePath}
        component={Profile}
        initializeState={initializeState(
          testState({
            ...responseData,
            adres: {
              ...responseData.adres,
              landnaam: 'Nicaragua',
            },
          } as any)
        )}
      />
    );
    expect(render(<Component />).asFragment()).toMatchSnapshot();
  });

  it('Matches the Full Page snapshot no address known', () => {
    const Component = () => (
      <MockApp
        routeEntry={routeEntry}
        routePath={routePath}
        component={Profile}
        initializeState={initializeState(
          testState({
            ...responseData,
            adres: null,
          } as any)
        )}
      />
    );
    expect(render(<Component />).asFragment()).toMatchSnapshot();
  });

  it('Matches the Full Page snapshot "Punt adres" in onderzoek', () => {
    const Component = () => (
      <MockApp
        routeEntry={routeEntry}
        routePath={routePath}
        component={Profile}
        initializeState={initializeState(
          testState({
            ...responseData,
            persoon: {
              ...responseData.persoon,
              adresInOnderzoek: '089999',
            },
          } as any)
        )}
      />
    );
    expect(render(<Component />).asFragment()).toMatchSnapshot();
  });

  it('Shows foreign nationalities', () => {
    const Component = () => (
      <MockApp
        routeEntry={routeEntry}
        routePath={routePath}
        component={Profile}
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
          } as any)
        )}
      />
    );
    render(<Component />);
    expect(screen.getByText('Armeense, Turkse')).toBeInTheDocument();
  });

  it('Only shows dutch nationality', () => {
    const Component = () => (
      <MockApp
        routeEntry={routeEntry}
        routePath={routePath}
        component={Profile}
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
          } as any)
        )}
      />
    );
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
      const Component = () => (
        <MockApp
          routeEntry={routeEntry}
          routePath={routePath}
          component={Profile}
          initializeState={initializeState(
            testState({
              ...responseData,
              persoon: {
                ...responseData.persoon,
                indicatieGeboortedatum,
              },
            } as any)
          )}
        />
      );
      render(<Component />);

      expect(screen.getAllByText('Geboortedatum')[0]).toBeInTheDocument();
      expect(
        await screen.findByText(geformateerdeGeboortedatum)
      ).toBeInTheDocument();
    }
  );
});
