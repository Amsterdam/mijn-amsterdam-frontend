import React from 'react';
import { shallow } from 'enzyme';
import MyUpdates from './MyUpdates';

it('Renders without crashing', () => {
  shallow(<MyUpdates />);
});
