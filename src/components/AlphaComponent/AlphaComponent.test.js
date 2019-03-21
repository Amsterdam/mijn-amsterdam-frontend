import React from 'react';
import { shallow } from 'enzyme';
import AlphaComponent from './AlphaComponent';

it('Renders without crashing', () => {
  shallow(<AlphaComponent />);
});
