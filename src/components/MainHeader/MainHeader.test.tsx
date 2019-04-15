import React from 'react';
import { shallow } from 'enzyme';
import MainHeader from './MainHeader';

it('Renders without crashing', () => {
  shallow(<MainHeader />);
});
