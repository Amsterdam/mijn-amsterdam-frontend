import React from 'react';
import { shallow } from 'enzyme';
import MainFooter from './MainFooter';

it('Renders without crashing', () => {
  shallow(<MainFooter />);
});
