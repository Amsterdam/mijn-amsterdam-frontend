import InfoDetail from './InfoDetail';
import React from 'react';
import { shallow } from 'enzyme';

it('Renders without crashing', () => {
  shallow(<InfoDetail />);
});
