import React from 'react';
import { shallow } from 'enzyme';
import MainHeaderHero from './MainHeaderHero';
import { BrowserRouter } from 'react-router-dom';

it('Renders without crashing', () => {
  shallow(
    <BrowserRouter>
      <MainHeaderHero />
    </BrowserRouter>
  );
});
