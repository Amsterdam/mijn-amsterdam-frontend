import AlphaComponent from './AlphaComponent';
import React from 'react';
import { shallow } from 'enzyme';

it('Renders without crashing', () => {
  shallow(<AlphaComponent />);
});
