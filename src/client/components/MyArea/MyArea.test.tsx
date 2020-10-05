import React from 'react';
import { shallow } from 'enzyme';
import { MyAreaDashboard } from './MyArea';
import { DEFAULT_LAT, DEFAULT_LNG } from '../../../universal/config';
import { RecoilRoot } from 'recoil';

const center = {
  lat: DEFAULT_LAT,
  lng: DEFAULT_LNG,
};

it('Renders without crashing', () => {
  shallow(
    <RecoilRoot>
      <MyAreaDashboard center={center} title="My Map! test." />
    </RecoilRoot>
  );
});
