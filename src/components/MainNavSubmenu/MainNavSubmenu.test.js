import React from 'react';
import { shallow } from 'enzyme';
import MainNavSubmenu from './MainNavSubmenu';

it('Renders without crashing', () => {
  shallow(<MainNavSubmenu />);
});
