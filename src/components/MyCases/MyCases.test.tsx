import React from 'react';
import { shallow } from 'enzyme';
import MyCases from './MyCases';

it('Renders without crashing', () => {
  shallow(<MyCases />);
});
