import React from 'react';
import { shallow } from 'enzyme';
import DirectLinks from './DirectLinks';
import { RecoilRoot } from 'recoil';

it('Renders without crashing', () => {
  expect(
    shallow(
      <RecoilRoot>
        <DirectLinks />
      </RecoilRoot>
    ).html()
  ).toMatchSnapshot();
});
