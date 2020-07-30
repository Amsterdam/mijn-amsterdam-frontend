import AlphaComponent from './AlphaComponent';
import React from 'react';
import { shallow } from 'enzyme';

describe('<AlphaComponent />', () => {
  it('Renders without crashing', () => {
    shallow(<AlphaComponent />);
  });

  it('Matches the default snapshot', () => {
    expect(shallow(<AlphaComponent />).html()).toMatchSnapshot();
  });
});
