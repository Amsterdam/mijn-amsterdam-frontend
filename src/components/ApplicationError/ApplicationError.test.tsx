import React from 'react';
import { shallow } from 'enzyme';
import ApplicationError from './ApplicationError';

it('Renders without crashing', () => {
  shallow(<ApplicationError />);
});
