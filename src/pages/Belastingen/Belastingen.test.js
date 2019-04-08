import React from 'react';
import { shallow } from 'enzyme';
import Belastingen from './Belastingen';

it('Renders without crashing', () => {
  shallow(<Belastingen />);
});
