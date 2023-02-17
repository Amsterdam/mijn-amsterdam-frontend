import { render } from '@testing-library/react';

import { generatePath } from 'react-router-dom';
import { MutableSnapshot } from 'recoil';
import { AppRoutes } from '../../../universal/config';
import { appStateAtom } from '../../hooks/useAppState';
import MockApp from '../MockApp';
import GarbageInformation from './GarbageInformation';

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

const testState: any = {
  BRP: {
    status: 'OK',
    content: {
      adres: {
        straatnaam: 'Teststraat',
        huisnummer: '24',
        huisnummertoevoeging: 'x',
        huisletter: null,
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
        ophaaldagen: null,
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
        ophaaldagen:
          'maandag, dinsdag, woensdag, donderdag, vrijdag, zaterdag, zondag',
        buitenzetten: '',
        waar: '',
        opmerking:
          'Tuinafval kunt u ook laten <a href="https://www.amsterdam.nl/tuinafval">ophalen.</a>',
        kalendermelding: null,
        fractieCode: 'GFT',
      },
    ],
  },
  AFVALPUNTEN: { status: 'OK', content: { centers: [afvalpunt] } },
  MY_LOCATION: { status: 'OK', content: [{ latlng: { lat: 'x', lng: 'y' } }] },
};

function initializeState(snapshot: MutableSnapshot) {
  snapshot.set(appStateAtom, testState);
}

describe('<GarbageInformation />', () => {
  const routeEntry = generatePath(AppRoutes.AFVAL);
  const routePath = AppRoutes.AFVAL;

  const Component = () => (
    <MockApp
      routeEntry={routeEntry}
      routePath={routePath}
      component={GarbageInformation}
      initializeState={initializeState}
    />
  );

  it('Matches the Full Page snapshot', () => {
    const { asFragment } = render(<Component />);
    expect(asFragment()).toMatchSnapshot();
  });
});
