import React from 'react';
import { shallow } from 'enzyme';
import FontEnlarger from './FontEnlarger';

describe('Font enlarger information', () => {
  it('Renders without crashing', () => {
    shallow(<FontEnlarger />);
  });
});
