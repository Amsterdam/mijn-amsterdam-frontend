import React from 'react';
import { shallow } from 'enzyme';
import MyArea from './MyArea';

it('Renders without crashing', () => {
  shallow(<MyArea url="" />);
});
