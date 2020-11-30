import { mount, shallow } from 'enzyme';
import React from 'react';
import { generatePath } from 'react-router-dom';
import { MutableSnapshot } from 'recoil';
import { AppRoutes } from '../../../universal/config/routing';
import { appStateAtom } from '../../hooks/useAppState';
import MockApp from '../MockApp';
import Profile from './ProfilePrivate';

const responseData = {
  adres: {
    inOnderzoek: true,
    huisletter: null,
    huisnummer: '1',
    huisnummertoevoeging: null,
    postcode: '1064 BH',
    straatnaam: 'Burgemeester R\u00f6ellstr',
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
      inOnderzoek: false,
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
      inOnderzoek: false,
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
    (window.matchMedia as any) = jest.fn(() => {
      return {
        addListener: jest.fn(),
        removeListener: jest.fn(),
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
    expect(mount(<Component />).html()).toMatchSnapshot();
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
    expect(mount(<Component />).html()).toMatchSnapshot();
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
          })
        )}
      />
    );
    expect(mount(<Component />).html()).toMatchSnapshot();
  });
});
