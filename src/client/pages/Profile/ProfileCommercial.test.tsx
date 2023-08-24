import { render } from '@testing-library/react';

import { generatePath } from 'react-router-dom';
import { MutableSnapshot } from 'recoil';
import { AppRoutes } from '../../../universal/config';
import { appStateAtom } from '../../hooks/useAppState';
import MockApp from '../MockApp';
import Profile from './ProfileCommercial';

const responseData = {
  content: {
    aandeelhouders: [],
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
        activiteiten: [
          'Detailhandel via internet in kleding en mode-artikelen',
        ],
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
  },
  status: 'OK',
};

const testState: any = {
  KVK: responseData,
};

function initializeState(snapshot: MutableSnapshot) {
  snapshot.set(appStateAtom, testState);
}

describe('<ProfileCommercial />', () => {
  const routeEntry = generatePath(AppRoutes.KVK);
  const routePath = AppRoutes.KVK;

  const Component = () => (
    <MockApp
      routeEntry={routeEntry}
      routePath={routePath}
      component={Profile}
      initializeState={initializeState}
    />
  );

  beforeAll(() => {
    (window.matchMedia as any) = vi.fn(() => {
      return {
        addListener: vi.fn(),
        removeListener: vi.fn(),
      };
    });
  });

  it('Matches the Full Page snapshot', () => {
    const { asFragment } = render(<Component />);
    expect(asFragment()).toMatchSnapshot();
  });
});
