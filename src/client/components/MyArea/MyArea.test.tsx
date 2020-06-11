import React from 'react';
import { shallow } from 'enzyme';
import { MyAreaDashboard } from './MyArea';
import { DEFAULT_LAT, DEFAULT_LNG } from '../../../universal/config';

const center = {
  lat: DEFAULT_LAT,
  lng: DEFAULT_LNG,
};

it('Renders without crashing', () => {
  shallow(<MyAreaDashboard center={center} title="My Map! test." />);
});
