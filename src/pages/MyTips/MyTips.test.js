import React from 'react';
import { shallow } from 'enzyme';
import MyTips from './MyTips';

it('Renders without crashing', () => {
  shallow(<MyTips />);
});
