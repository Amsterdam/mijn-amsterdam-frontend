import React from 'react';
import { shallow, mount } from 'enzyme';
import Profile from './Profile';
import AppState from 'AppState';
import { BrpResponseData } from 'data-formatting/brp';
import slug from 'slug';

function getAppState(data: BrpResponseData) {
  return {
    BRP: {
      isDirty: true,
      isLoading: false,
      isPristine: false,
      isError: false,
      errorMessage: '',
      data,
    },
  };
}

const responseData = {
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
      <AppState value={getAppState(responseData)}>
        <Profile />
      </AppState>
    );
  });

  it('Doesdisplay verbintenis/maritalstatus information if present', () => {
    const responseDataCopy = JSON.parse(JSON.stringify(responseData));

    const page = mount(
      <AppState value={getAppState(responseDataCopy)}>
        <Profile />
      </AppState>
    );

    expect(
      page.find(
        `.InfoPanelContent__${slug('Burgerlijke staat', { lower: true })}`
      )
    ).toHaveLength(1);
  });

  it('Does not display verbintenis/maritalstatus information if not present', () => {
    const responseDataCopy = JSON.parse(JSON.stringify(responseData));
    responseDataCopy.verbintenis = null;

    const page = mount(
      <AppState value={getAppState(responseDataCopy)}>
        <Profile />
      </AppState>
    );

    expect(
      page.find(
        `.InfoPanelContent__${slug('Burgerlijke staat', { lower: true })}`
      )
    ).toHaveLength(0);
  });

  it('Does not display country and place of birth when NOT a resident of Amsterdam', () => {
    const responseDataCopy = JSON.parse(JSON.stringify(responseData));
    responseDataCopy.persoon.mokum = false;
    responseDataCopy.persoon.geboorteplaatsnaam = null;
    responseDataCopy.persoon.geboortelandnaam = null;

    const appState = getAppState(responseDataCopy);

    const page = mount(
      <AppState value={appState}>
        <Profile />
      </AppState>
    );

    expect(page.find(`.InfoPanelTableRow__geboorteplaats td`)).toHaveLength(0);
    expect(page.find(`.InfoPanelTableRow__geboorteland td`)).toHaveLength(0);
  });

  it('Displays onbekend as value for country and place of birth when IS resident of Amsterdam', () => {
    const responseDataCopy = JSON.parse(JSON.stringify(responseData));
    responseDataCopy.persoon.mokum = true;
    responseDataCopy.persoon.geboorteplaatsnaam = null;
    responseDataCopy.persoon.geboortelandnaam = null;

    const appState = getAppState(responseDataCopy);

    const page = mount(
      <AppState value={appState}>
        <Profile />
      </AppState>
    );

    expect(page.find(`.InfoPanelTableRow__geboorteplaats td`).text()).toBe(
      'Onbekend'
    );
    expect(page.find(`.InfoPanelTableRow__geboorteland td`).text()).toBe(
      'Onbekend'
    );
  });
});
