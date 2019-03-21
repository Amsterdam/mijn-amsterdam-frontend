import React from 'react';
import { shallow } from 'enzyme';
import MainNavBar from './MainNavBar';

it('Renders without crashing', () => {
  shallow(<MainNavBar />);
});
