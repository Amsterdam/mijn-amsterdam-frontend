import React from 'react';
import { shallow } from 'enzyme';
import MainHeaderHero from './MainHeaderHero';

it('Renders without crashing', () => {
  shallow(<MainHeaderHero />);
});
