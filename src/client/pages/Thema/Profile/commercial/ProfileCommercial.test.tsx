import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { MijnBedrijfsGegevensThema } from './ProfileCommercial';
import type { KvkResponseFrontend } from '../../../../../server/services/hr-kvk/hr-kvk.types';
import { getFullAddress } from '../../../../../universal/helpers/brp';
import { AppState } from '../../../../../universal/types/App.types';
import MockApp from '../../../MockApp';
import { routeConfig } from '../Profile-thema-config';

const responseData: KvkResponseFrontend = {
  eigenaar: {
    naam: 'Hendrika Johanna Theodora Grupstal',
    geboortedatum: '1976-10-01',
  },
  mokum: true,
  onderneming: {
    datumAanvang: '',
    datumEinde: null,
    handelsnamen: ['Ballonenverkoop B.V.'],
    hoofdactiviteit: 'Detailhandel via internet in kleding en mode-artikelen',
    overigeActiviteiten: ['Elektrotechnische bouwinstallatie'],
    rechtsvorm: 'BeslotenVennootschap',
    handelsnaam: 'Feestwinkel',
    kvknummer: '',
  },
  vestigingen: [
    {
      activiteiten: [
        'Geestelijke gezondheids- en verslavingszorg met overnachting',
        'Elektrotechnische bouwinstallatie',
      ],
      bezoekadres: getFullAddress({
        huisletter: null,
        huisnummer: '66',
        huisnummertoevoeging: null,
        postcode: '1076 DE',
        straatnaam: 'Laan der Hesperiden',
        woonplaatsNaam: 'Amsterdam',
      }),
      datumAanvang: '2020-01-01',
      datumEinde: null,
      emailadres: 'info@electrotechniek.amsterdam.nl',
      faxnummer: '+310204107999',
      handelsnamen: ['Ballonenverkoop B.V.'],
      postadres: getFullAddress({
        huisletter: null,
        huisnummer: '66',
        huisnummertoevoeging: null,
        postcode: null,
        straatnaam: 'Laan der Hesperiden',
        woonplaatsNaam: 'Amsterdam',
      }),
      telefoonnummer: '+310209991362',
      typeringVestiging: 'Hoofdvestiging',
      vestigingsNummer: '990000996064',
      websites: ['www.electrotechniek.amsterdam.nl'],
      isHoofdvestiging: true,
      eersteHandelsnaam: null,
    },
    {
      activiteiten: ['Winkels in boeken'],
      bezoekadres: getFullAddress({
        huisletter: null,
        huisnummer: '18',
        huisnummertoevoeging: null,
        postcode: '1114 BD',
        straatnaam: 'Borchlandweg',
        woonplaatsNaam: 'Amsterdam-Duivendrecht',
      }),
      datumAanvang: '2020-05-01',
      datumEinde: null,
      emailadres: 'info@feestwinkel.nl',
      faxnummer: '+310204107765',
      handelsnamen: ['Ballonenverkoop B.V.', 'Feestwinkel'],
      postadres: getFullAddress({
        huisletter: null,
        huisnummer: '18',
        huisnummertoevoeging: null,
        postcode: null,
        straatnaam: 'Borchlandweg',
        woonplaatsNaam: 'Amsterdam-Duivendrecht',
      }),
      telefoonnummer: '+310208451362',
      typeringVestiging: 'Nevenvestiging',
      vestigingsNummer: '990000996080',
      websites: ['www.feestwinkel.nl'],
      isHoofdvestiging: false,
      eersteHandelsnaam: null,
    },
    {
      activiteiten: ['Detailhandel via internet in kleding en mode-artikelen'],
      bezoekadres: getFullAddress({
        huisletter: null,
        huisnummer: '590',
        huisnummertoevoeging: null,
        postcode: '1101 DS',
        straatnaam: 'Arena boulevard',
        woonplaatsNaam: 'Amsterdam',
      }),
      datumAanvang: '2020-05-01',
      datumEinde: null,
      emailadres: null,
      faxnummer: null,
      handelsnamen: ['Ballonenverkoop B.V.'],
      postadres: getFullAddress({
        huisletter: null,
        huisnummer: '590',
        huisnummertoevoeging: null,
        postcode: null,
        straatnaam: 'Arena boulevard',
        woonplaatsNaam: 'Amsterdam',
      }),
      telefoonnummer: '+310205641954',
      typeringVestiging: 'Nevenvestiging',
      vestigingsNummer: '990000996072',
      websites: [],
      isHoofdvestiging: false,
      eersteHandelsnaam: null,
    },
  ],
};

const testState = {
  KVK: { status: 'OK', content: responseData },
} as unknown as AppState;

const panelHeadings = [
  'Onderneming',
  'Hoofdvestiging',
  'Eigenaar',
  'Vestigingen',
];

describe('<MijnBedrijfsGegevensThema />', () => {
  const routeEntry = routeConfig.themaPageKVK.path;

  function Component() {
    return (
      <MockApp
        routeEntry={routeEntry}
        routePath={routeEntry}
        component={MijnBedrijfsGegevensThema}
        state={testState}
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

    expect(screen.getAllByText(`${responseData.eigenaar?.naam}`)).toHaveLength(
      2
    );

    await user.click(screen.getAllByText('Toon')[0]);

    expect(
      screen.getByText(`${responseData.eigenaar?.naam}`)
    ).toBeInTheDocument();
  });
});
