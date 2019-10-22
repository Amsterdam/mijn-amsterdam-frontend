import React from 'react';
import { shallow, mount } from 'enzyme';
import Profile from './Profile';
import AppState, { AppState as AppStateInterface } from 'AppState';
import { BrpResponseData } from 'data-formatting/brp';
import slug from 'slug';
import { ReactNode } from 'react';
import { withRouter } from 'react-router';
import { BrowserRouter } from 'react-router-dom';

const responseData = {
  notifications: [],
  adres: {
    huisletter: null,
    huisnummer: '1',
    huisnummertoevoeging: null,
    postcode: '1064 BH',
    straatnaam: 'Burgemeester R\u00f6ellstr',
    woonplaatsNaam: 'Amsterdam',
    begindatumVerblijf: null,
  },
  persoon: {
    aanduidingNaamgebruikOmschrijving: 'Eigen geslachtsnaam',
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
    ],
    omschrijvingBurgerlijkeStaat: 'Gehuwd',
    omschrijvingGeslachtsaanduiding: 'Man',
    opgemaakteNaam: 'W. Beemsterboer',
    voornamen: 'Wesley',
    voorvoegselGeslachtsnaam: null,
    mokum: true,
  },
  verbintenis: {
    datumOntbinding: null,
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
};

function getAppState() {
  return {
    BRP: {
      isDirty: true,
      isLoading: false,
      isPristine: false,
      isError: false,
      errorMessage: '',
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

  it('Doesdisplay verbintenis/maritalstatus information if present', () => {
    const appState = getAppState();
    const page = mountWithAppstate(appState, <Profile />);

    expect(
      page.find(
        `.InfoPanelContent__${slug('Burgerlijke staat', { lower: true })}`
      )
    ).toHaveLength(1);
  });

  it('Does not display verbintenis/maritalstatus information if not present', () => {
    const appState = getAppState();
    delete appState.BRP.data.verbintenis;

    const page = mountWithAppstate(appState, <Profile />);

    expect(
      page.find(
        `.InfoPanelContent__${slug('Burgerlijke staat', { lower: true })}`
      )
    ).toHaveLength(0);
  });

  it('Does not display country and place of birth when NOT a resident of Amsterdam', () => {
    const appState = getAppState();
    appState.BRP.data.persoon.mokum = false;
    appState.BRP.data.persoon.geboorteplaatsnaam = '';
    appState.BRP.data.persoon.geboortelandnaam = '';

    const page = mountWithAppstate(appState, <Profile />);

    expect(page.find(`.InfoPanelTableRow__geboorteplaats td`)).toHaveLength(0);
    expect(page.find(`.InfoPanelTableRow__geboorteland td`)).toHaveLength(0);
  });

  it('Displays onbekend as value for country and place of birth when IS resident of Amsterdam', () => {
    const appState = getAppState();
    appState.BRP.data.persoon.mokum = true;
    appState.BRP.data.persoon.geboorteplaatsnaam = '';
    appState.BRP.data.persoon.geboortelandnaam = '';

    const page = mountWithAppstate(appState, <Profile />);

    expect(page.find(`.InfoPanelTableRow__geboorteplaats td`).text()).toBe(
      'Onbekend'
    );
    expect(page.find(`.InfoPanelTableRow__geboorteland td`).text()).toBe(
      'Onbekend'
    );
  });

  it('Displays an alert when adres.inOnderzoek and/or persoon.vertrokkenOnbekendWaarheen is true', () => {
    const appState = getAppState();
    appState.BRP.data.persoon.vertrokkenOnbekendWaarheen = true;
    appState.BRP.data.adres.inOnderzoek = true;

    const page = mountWithAppstate(appState, <Profile />);

    expect(page.find('.vertrokkenOnbekendWaarheen')).not.toBeNull();
    expect(page.find('.inOnderzoek')).not.toBeNull();
  });

  it('Displays an alert if the api responds with an error', () => {
    const appState = getAppState();
    appState.BRP.isError = true;
    appState.BRP.isDirty = true;

    const page = mountWithAppstate(appState, <Profile />);

    expect(
      page.find(
        `.InfoPanelContent__${slug('Burgerlijke staat', { lower: true })}`
      )
    ).toHaveLength(0);
    expect(page.find('[class*="Alert_Alert"]')).not.toBeNull();
  });
});
