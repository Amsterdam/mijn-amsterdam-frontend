import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MutableSnapshot } from 'recoil';

import { MijnBedrijfsGegevensThema } from './ProfileCommercial.tsx';
import { KVKData } from '../../../../../server/services/profile/kvk.ts';
import { AppState } from '../../../../../universal/types/App.types.ts';
import { appStateAtom } from '../../../../hooks/useAppState.ts';
import MockApp from '../../../MockApp.tsx';
import { routeConfig } from '../Profile-thema-config.ts';

const responseData = {
  eigenaar: {
    naam: 'Hendrika Johanna Theodora Grupstal',
    geboortedatum: '1976-10-01',
    bsn: '123460013',
    adres: {
      huisletter: null,
      huisnummer: '199',
      huisnummertoevoeging: 'K',
      postcode: '1234 AB',
      straatnaam: 'Straat',
      woonplaatsNaam: 'Amsterdam',
    },
  },
  gemachtigden: [
    {
      functie: 'Boekhouder',
      naam: 'Georges Rudy Janssen van Son',
      datumIngangMachtiging: '1976-10-01',
    },
  ],
  overigeFunctionarissen: [
    {
      functie: 'Commissaris',
      naam: 'Georges Rudy Janssen van Son',
      geboortedatum: '1976-10-01',
    },
    {
      functie: 'Commissaris',
      naam: 'Jan Jansen',
      geboortedatum: '1976-10-01',
    },
    {
      functie: 'Commissaris',
      naam: 'Boris Johnsson',
      geboortedatum: '1976-10-01',
    },
    {
      functie: 'Enig aandeelhouder',
      naam: 'Kamlawatie Katar',
      geboortedatum: '1976-10-01',
    },
  ],
  bestuurders: [
    {
      functie: 'Bestuurder',
      soortBevoegdheid: 'AlleenZelfstandigBevoegd',
      naam: 'Wesley Vlag',
      geboortedatum: '1976-10-01',
    },
    {
      functie: 'Bestuurder',
      soortBevoegdheid: 'AlleenZelfstandigBevoegd',
      naam: 'Hendrika Johanna Theodora Grupstal',
      geboortedatum: '1976-10-01',
    },
    {
      functie: 'Bestuurder',
      soortBevoegdheid: 'AlleenZelfstandigBevoegd',
      naam: 'Pierre Vlag',
      geboortedatum: '1976-10-01',
    },
    {
      functie: 'Bestuurder',
      soortBevoegdheid: 'AlleenZelfstandigBevoegd',
      naam: 'Dennis Uiersin',
      geboortedatum: '1976-10-01',
    },
  ],
  mokum: true,
  onderneming: {
    datumAanvang: null,
    datumEinde: null,
    handelsnamen: ['Ballonenverkoop B.V.'],
    hoofdactiviteit: 'Detailhandel via internet in kleding en mode-artikelen',
    overigeActiviteiten: ['Elektrotechnische bouwinstallatie'],
    rechtsvorm: 'BeslotenVennootschap',
    handelsnaam: 'Feestwinkel',
  },
  rechtspersonen: [
    {
      bsn: null,
      kvkNummer: '90006151',
      rsin: '999999999',
      statutaireNaam: 'Ballonenverkoop B.V.',
      statutaireZetel: 'Amsterdam',
    },
  ],
  vestigingen: [
    {
      activiteiten: [
        'Geestelijke gezondheids- en verslavingszorg met overnachting',
        'Elektrotechnische bouwinstallatie',
      ],
      bezoekadres: {
        huisletter: null,
        huisnummer: '66',
        huisnummertoevoeging: null,
        postcode: '1076 DE',
        straatnaam: 'Laan der Hesperiden',
        woonplaatsNaam: 'Amsterdam',
      },
      datumAanvang: '2020-01-01',
      datumEinde: null,
      emailadres: 'info@electrotechniek.amsterdam.nl',
      faxnummer: '+310204107999',
      handelsnamen: ['Ballonenverkoop B.V.'],
      postadres: {
        huisletter: null,
        huisnummer: '66',
        huisnummertoevoeging: null,
        postcode: null,
        straatnaam: 'Laan der Hesperiden',
        woonplaatsNaam: 'Amsterdam',
      },
      telefoonnummer: '+310209991362',
      typeringVestiging: 'Hoofdvestiging',
      vestigingsNummer: '990000996064',
      websites: ['www.electrotechniek.amsterdam.nl'],
      isHoofdvestiging: true,
    },
    {
      activiteiten: ['Winkels in boeken'],
      bezoekadres: {
        huisletter: null,
        huisnummer: '18',
        huisnummertoevoeging: null,
        postcode: '1114 BD',
        straatnaam: 'Borchlandweg',
        woonplaatsNaam: 'Amsterdam-Duivendrecht',
      },
      datumAanvang: '2020-05-01',
      datumEinde: null,
      emailadres: 'info@feestwinkel.nl',
      faxnummer: '+310204107765',
      handelsnamen: ['Ballonenverkoop B.V.', 'Feestwinkel'],
      postadres: {
        huisletter: null,
        huisnummer: '18',
        huisnummertoevoeging: null,
        postcode: null,
        straatnaam: 'Borchlandweg',
        woonplaatsNaam: 'Amsterdam-Duivendrecht',
      },
      telefoonnummer: '+310208451362',
      typeringVestiging: 'Nevenvestiging',
      vestigingsNummer: '990000996080',
      websites: ['www.feestwinkel.nl'],
      isHoofdvestiging: false,
    },
    {
      activiteiten: ['Detailhandel via internet in kleding en mode-artikelen'],
      bezoekadres: {
        huisletter: null,
        huisnummer: '590',
        huisnummertoevoeging: null,
        postcode: '1101 DS',
        straatnaam: 'Arena boulevard',
        woonplaatsNaam: 'Amsterdam',
      },
      datumAanvang: '2020-05-01',
      datumEinde: null,
      emailadres: null,
      faxnummer: null,
      handelsnamen: ['Ballonenverkoop B.V.'],
      postadres: {
        huisletter: null,
        huisnummer: '590',
        huisnummertoevoeging: null,
        postcode: null,
        straatnaam: 'Arena boulevard',
        woonplaatsNaam: 'Amsterdam',
      },
      telefoonnummer: '+310205641954',
      typeringVestiging: 'Nevenvestiging',
      vestigingsNummer: '990000996072',
      websites: [],
      isHoofdvestiging: false,
    },
  ],
} as unknown as KVKData;

const testState = {
  KVK: { status: 'OK', content: responseData },
} as unknown as AppState;

function initializeState(snapshot: MutableSnapshot) {
  snapshot.set(appStateAtom, testState);
}

const panelHeadings = [
  'Onderneming',
  'Hoofdvestiging',
  'Gemachtigde',
  'Eigenaar',
  'Rechtspersoon',
  'Bestuurders',
  'Vestigingen',
  'Overige functionarissen',
];

describe('<MijnBedrijfsGegevensThema />', () => {
  const routeEntry = routeConfig.themaPageKVK.path;

  function Component() {
    return (
      <MockApp
        routeEntry={routeEntry}
        routePath={routeEntry}
        component={MijnBedrijfsGegevensThema}
        initializeState={initializeState}
      />
    );
  }

  test('Shows complete profile', async () => {
    render(<Component />);
    const user = userEvent.setup();

    expect(
      screen.getByRole('heading', {
        name: 'Mijn onderneming',
      })
    ).toBeInTheDocument();

    panelHeadings.forEach((heading) => {
      expect(screen.getByText(heading)).toBeInTheDocument();
    });

    expect(
      screen.getAllByText(`${responseData.rechtspersonen?.[0].statutaireNaam}`)
    ).toHaveLength(2);

    await user.click(screen.getAllByText('Toon')[0]);

    expect(
      screen.getByText(`${responseData.eigenaar?.naam}`)
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        `${responseData.eigenaar?.adres?.postcode} ${responseData.eigenaar?.adres.woonplaatsNaam}`
      )
    ).toBeInTheDocument();
  });
});
