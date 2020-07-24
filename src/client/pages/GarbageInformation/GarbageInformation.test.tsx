import { shallow } from 'enzyme';
import React from 'react';
import { RecoilRoot } from 'recoil';
import GarbageInformation from './GarbageInformation';

it('Renders without crashing', () => {
  shallow(
    <RecoilRoot>
      <GarbageInformation />
    </RecoilRoot>
  );
});
