import { render } from '@testing-library/react';
import { MutableSnapshot } from 'recoil';

import { routeConfig } from './Afval-thema-config';
import { AfvalThemaPagina } from './AfvalThema';
import { AfvalFractionData } from '../../../../server/services/afval/afvalwijzer';
import { jsonCopy } from '../../../../universal/helpers/utils';
import { AppState } from '../../../../universal/types';
import { appStateAtom } from '../../../hooks/useAppState';
import MockApp from '../../MockApp';

//const { BRP, AFVAL, AFVALPUNTEN, MY_LOCATION } = useAppStateGetter();

const afvalpunt = {
  title: 'De afvalpuntenweg',
  latlng: { latng: { lat: 5, lng: 40 } },
  address: 'afvalpuntenweg 23, 1067 BA',
  phone: '123123123',
  email: 'afval@punt.com',
  distance: 34,
  website: 'http://example.org/afvalpunt',
};

const testState = {
  BRP: {
    status: 'OK',
    content: {
      adres: {
        straatnaam: 'Teststraat',
        huisnummer: '24',
        huisnummertoevoeging: 'x',
        huisletter: null,
      },
      persoon: {
        mokum: true,
      },
    },
  },
  AFVAL: {
    status: 'OK',
    content: [
      {
        titel: 'Glas',
        instructie: 'In de container voor glas',
        instructieCTA: null,
        ophaaldagen: '',
        buitenzetten: null,
        waar: {
          to: '/buurt?datasetIds=["afvalcontainers"]&zoom=14&filters={"afvalcontainers"%3A{"fractie_omschrijving"%3A{"values"%3A{"Glas"%3A1}}}}',
          title: 'Kaart met containers in de buurt',
        },
        opmerking: null,
        kalendermelding: null,
        fractieCode: 'Glas',
      },
      {
        titel: 'Groente-, fruit-, etensresten en tuinafval (gfe/t)',
        instructie: 'Bij het restafval',
        instructieCTA: null,
        ophaaldagen: '',
        buitenzetten: null,
        waar: '',
        opmerking:
          'Tuinafval dat niet in een vuilniszak past, mag u als grof afval weg doen',
        kalendermelding: null,
        fractieCode: 'GFT',
      },
      {
        titel: 'Grof afval',
        instructie: 'Laat uw grof afval ophalen door een erkend bedrijf',
        instructieCTA: null,
        ophaaldagen: '',
        buitenzetten: null,
        waar: '',
        opmerking:
          'Of breng het naar <a href="https://kaart.amsterdam.nl/afvalpunten">een Afvalpunt</a>',
        kalendermelding: null,
        fractieCode: 'GA',
      },
      {
        titel: 'Papier en karton',
        instructie: 'In de container voor papier',
        instructieCTA: null,
        ophaaldagen: '',
        buitenzetten: null,
        waar: {
          to: '/buurt?datasetIds=["afvalcontainers"]&zoom=14&filters={"afvalcontainers"%3A{"fractie_omschrijving"%3A{"values"%3A{"Papier"%3A1}}}}',
          title: 'Kaart met containers in de buurt',
        },
        opmerking: null,
        kalendermelding: null,
        fractieCode: 'Papier',
      },
      {
        titel: 'Restafval',
        instructie: 'In vuilniszak',
        instructieCTA: null,
        ophaaldagen: 'Maandag en donderdag',
        buitenzetten: 'Tussen 06.00 en 07.30 uur',
        waar: 'Aan de rand van de stoep of op de vaste plek',
        opmerking: null,
        kalendermelding: null,
        fractieCode: 'Rest',
      },
      {
        titel: 'Textiel',
        instructie: 'In de container voor textiel',
        instructieCTA: null,
        ophaaldagen: '',
        buitenzetten: null,
        waar: {
          to: '/buurt?datasetIds=["afvalcontainers"]&zoom=14&filters={"afvalcontainers"%3A{"fractie_omschrijving"%3A{"values"%3A{"Textiel"%3A1}}}}',
          title: 'Kaart met containers in de buurt',
        },
        opmerking: null,
        kalendermelding: null,
        fractieCode: 'Textiel',
      },
    ],
  } as unknown as AppState,
  AFVALPUNTEN: { status: 'OK', content: { centers: [afvalpunt] } },
  MY_LOCATION: {
    status: 'OK',
    content: [
      {
        latlng: { lat: 52.36764560314673, lng: 4.90016547413043 },
        address: {
          _adresSleutel: 'xxxcasdasfada',
          huisletter: null,
          huisnummer: '1',
          huisnummertoevoeging: null,
          postcode: '1057 XP',
          straatnaam: 'Amstel',
          landnaam: 'Nederland',
          woonplaatsNaam: 'Amsterdam',
          begindatumVerblijf: '1967-01-01',
          einddatumVerblijf: '1967-01-01',
          adresType: 'correspondentie',
        },
        bagNummeraanduidingId: '0363200012145295',
        profileType: 'private',
      },
      {
        // Only used to determine if a user also has commercial address registered.
        profileType: 'commercial',
        bagNummeraanduidingId: '123123123123',
      },
    ],
  },
};

function initializeState(snapshot: MutableSnapshot, state: any = testState) {
  snapshot.set(appStateAtom, state);
}

describe('<AfvalThemaPagina />', () => {
  const routePath = routeConfig.themaPage.path;

  function Component() {
    return (
      <MockApp
        routeEntry={routePath}
        routePath={routePath}
        component={AfvalThemaPagina}
        initializeState={(snapshot) => initializeState(snapshot)}
      />
    );
  }

  it('Matches the Full Page snapshot', () => {
    const { asFragment } = render(<Component />);
    expect(asFragment()).toMatchSnapshot();
  });

  it('Does not show warning concercing bedrijfsafval', () => {
    const testState2 = jsonCopy(testState);
    testState2.MY_LOCATION.content[1].bagNummeraanduidingId =
      testState2.MY_LOCATION.content[0].bagNummeraanduidingId;

    function Component() {
      return (
        <MockApp
          routeEntry={routePath}
          routePath={routePath}
          component={AfvalThemaPagina}
          initializeState={(snapshot) => initializeState(snapshot, testState2)}
        />
      );
    }

    const { asFragment } = render(<Component />);
    expect(asFragment()).toMatchSnapshot();
  });

  it('Does not show warning concercing woonfunctie', () => {
    const testState2 = jsonCopy(testState);
    testState2.AFVAL.content = testState2.AFVAL.content.map(
      (fractie: AfvalFractionData) => ({
        ...fractie,
        gebruiksdoelWoonfunctie: true,
      })
    );

    function Component() {
      return (
        <MockApp
          routeEntry={routePath}
          routePath={routePath}
          component={AfvalThemaPagina}
          initializeState={(snapshot) => initializeState(snapshot, testState2)}
        />
      );
    }

    const { asFragment } = render(<Component />);
    expect(asFragment()).toMatchSnapshot();
  });
});
