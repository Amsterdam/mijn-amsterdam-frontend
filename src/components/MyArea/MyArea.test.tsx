import React from 'react';
import { shallow } from 'enzyme';
import { MyAreaMap } from './MyArea';

it('Renders without crashing', () => {
  shallow(<MyAreaMap url="" />);
});
