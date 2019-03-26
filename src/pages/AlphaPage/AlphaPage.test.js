import React from 'react';
import { shallow } from 'enzyme';
import AlphaPage from './AlphaPage';

it('Renders without crashing', () => {
  shallow(<AlphaPage />);
});
