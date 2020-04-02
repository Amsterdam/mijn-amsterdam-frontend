import React from 'react';
import { shallow } from 'enzyme';
import Heading from './Heading';

it('Renders without crashing', () => {
  shallow(<Heading>Test</Heading>);
});
