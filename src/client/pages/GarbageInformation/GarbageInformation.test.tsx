import { shallow, mount } from 'enzyme';
import React from 'react';
import { generatePath } from 'react-router-dom';
import { MutableSnapshot } from 'recoil';
import { AppRoutes } from '../../../universal/config/routing';
import { appStateAtom } from '../../hooks/useAppState';
import MockApp from '../MockApp';
import GarbageInformation from './GarbageInformation';

//const { BRP, AFVAL, AFVALPUNTEN, HOME } = useAppStateAtom();

const restafval = {
  title: 'Gooi zakken in container',
  aanbiedwijze: 'In container',
  stadsdeel: 'Zuid-Oost',
  type: 'huisvuil',
  buitenZetten: '',
  ophaaldag: '',
  opmerking: 'Hou het netjes!',
};
const grofvuil = {
  title: 'Zetje afval aan de weg',
  aanbiedwijze: 'Aan de weg',
  stadsdeel: 'Zuid-Oost',
  type: 'grofvuil',
  buitenZetten: 'vanaf Woensdag 20:00 tot Donderdag 07:00',
  ophaaldag: 'Donderdag',
  opmerking: 'Hou het netjes!',
};

const afvalpunt = {
  title: 'De afvalpuntenweg',
  latlng: { latng: { lat: 5, lng: 40 } },
  url: 'http://example.org/afvalpunt',
  address: 'afvalpuntenweg 23, 1067 BA',
  phone: '123123123',
  email: 'afval@punt.com',
  distance: 34,
  openingHours: 'van maandag t/m vrijdag 09:00 16:30',
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
    },
  },
  AFVAL: { status: 'OK', content: [restafval, grofvuil] },
  AFVALPUNTEN: { status: 'OK', content: { centers: [afvalpunt] } },
  HOME: { status: 'OK', content: { latlng: { lat: 'x', lng: 'y' } } },
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

  it('Renders without crashing', () => {
    shallow(<Component />);
  });

  it('Matches the Full Page snapshot', () => {
    const html = mount(<Component />).html();

    expect(html).toMatchSnapshot();
  });
});
