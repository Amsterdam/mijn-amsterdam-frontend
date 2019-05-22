import React from 'react';
import { shallow } from 'enzyme';
import ErrorMessages from './ErrorMessages';

it('Renders without crashing', () => {
  shallow(<ErrorMessages />);
});
