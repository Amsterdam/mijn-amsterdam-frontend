import React from 'react';
import { shallow } from 'enzyme';
import Tutorial from './Tutorial';

it('Renders without crashing', () => {
  shallow(<Tutorial />);
});
