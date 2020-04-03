import { MyTip } from '../../hooks/api/my-tips-api.hook';
import MyTips from './MyTips';
import React from 'react';
import { shallow } from 'enzyme';

const TIPS: MyTip[] = [];

it('Renders without crashing', () => {
  shallow(<MyTips isLoading={false} items={TIPS} />);
});
