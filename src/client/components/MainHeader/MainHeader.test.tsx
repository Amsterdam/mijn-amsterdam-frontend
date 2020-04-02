import React from 'react';
import { shallow } from 'enzyme';
import MainHeader from './MainHeader';
import { BrowserRouter } from 'react-router-dom';

it('Renders without crashing', () => {
  shallow(
    <BrowserRouter>
      <MainHeader />
    </BrowserRouter>
  );
});
