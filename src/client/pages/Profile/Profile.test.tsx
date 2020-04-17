import AppState, { AppState as AppStateInterface } from '../../AppState';
import { mount, shallow } from 'enzyme';

import { BrowserRouter } from 'react-router-dom';
import Profile from './Profile';
import React from 'react';
import { ReactNode } from 'react';

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
      inOnderzoek: true,
      huisletter: null,
      huisnummer: '1',
      huisnummertoevoeging: null,
      postcode: '1064 BH',
      straatnaam: 'Burgemeester R\u00f6ellstr',
      woonplaatsNaam: 'Amsterdam',
      begindatumVerblijf: '1967-01-01T00:00:00Z',
    },
    {
      inOnderzoek: true,
      huisletter: null,
      huisnummer: '1',
      huisnummertoevoeging: null,
      postcode: '1064 BH',
      straatnaam: 'Burgemeester R\u00f6ellstr',
      woonplaatsNaam: 'Amsterdam',
      begindatumVerblijf: '1967-01-01T00:00:00Z',
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

function getAppState() {
  return {
    BRP: {
      isDirty: true,
      isLoading: false,
      isPristine: false,
      isError: false,
      data: JSON.parse(JSON.stringify(responseData)),
    },
  } as AppStateInterface;
}

function mountWithAppstate(appState: AppStateInterface, component: ReactNode) {
  return mount(
    <BrowserRouter>
      <AppState value={appState as AppStateInterface}>{component}</AppState>
    </BrowserRouter>
  );
}

describe('BRP Profile page', () => {
  beforeAll(() => {
    (window.matchMedia as any) = jest.fn(() => {
      return {
        addListener: jest.fn(),
        removeListener: jest.fn(),
      };
    });
  });

  it('Renders without crashing', () => {
    shallow(
      <AppState value={getAppState()}>
        <Profile />
      </AppState>
    );
  });

  it('Renders all the information provided', () => {
    const appState = getAppState();
    const page = mountWithAppstate(appState, <Profile />);

    expect(page.html()).toMatchSnapshot();
  });

  it('Does display verbintenis information if present', () => {
    const appState = getAppState();
    const page = mountWithAppstate(appState, <Profile />);

    expect(page.find(`.InfoPanel.Verbintenis`)).toHaveLength(2);
  });

  it('Does not display verbintenis information if not present', () => {
    const appState = getAppState();
    delete appState.BRP.data.verbintenis;
    delete appState.BRP.data.verbintenisHistorisch;

    const page = mountWithAppstate(appState, <Profile />);

    expect(page.find(`.InfoPanel.Verbintenis`)).toHaveLength(0);
  });

  it('Does not display country and place of birth when NOT a resident of Amsterdam', () => {
    const appState = getAppState();
    appState.BRP.data.persoon.mokum = false;
    appState.BRP.data.persoon.geboorteplaatsnaam = '';
    appState.BRP.data.persoon.geboortelandnaam = '';

    const page = mountWithAppstate(appState, <Profile />);

    expect(
      page
        .find('.InfoPanel')
        .at(0)
        .find(`.InfoPanelTableRow__geboorteplaats td`)
    ).toHaveLength(0);
    expect(
      page
        .find('.InfoPanel')
        .at(0)
        .find(`.InfoPanelTableRow__geboorteland td`)
    ).toHaveLength(0);
  });

  it('Displays onbekend as value for country and place of birth when IS resident of Amsterdam', () => {
    const appState = getAppState();
    appState.BRP.data.persoon.geboorteplaatsnaam = '';
    appState.BRP.data.persoon.geboortelandnaam = '';

    const page = mountWithAppstate(appState, <Profile />);

    expect(
      page
        .find('.InfoPanel')
        .at(0)
        .find(`.InfoPanelTableRow__geboorteplaats td`)
        .text()
    ).toBe('Onbekend');
    expect(
      page
        .find('.InfoPanel')
        .at(0)
        .find(`.InfoPanelTableRow__geboorteland td`)
        .text()
    ).toBe('Onbekend');
  });

  it('Displays an alert when adres.inOnderzoek and/or persoon.vertrokkenOnbekendWaarheen is true', () => {
    const appState = getAppState();
    const page = mountWithAppstate(appState, <Profile />);

    expect(page.find('.vertrokkenOnbekendWaarheen')).not.toBeNull();
    expect(page.find('.inOnderzoek')).not.toBeNull();
  });

  it('Displays an alert if the api responds with an error', () => {
    const appState = getAppState();
    appState.BRP.isError = true;
    appState.BRP.isDirty = true;

    const page = mountWithAppstate(appState, <Profile />);

    expect(page.find(`.InfoPanel.Verbintenis`)).toHaveLength(0);
    expect(page.find('[class*="Alert_Alert"]')).not.toBeNull();
  });
});
