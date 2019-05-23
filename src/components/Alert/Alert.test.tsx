import React from 'react';
import { shallow } from 'enzyme';
import Alert from './Alert';

it('Renders without crashing', () => {
  shallow(<Alert />);
});
