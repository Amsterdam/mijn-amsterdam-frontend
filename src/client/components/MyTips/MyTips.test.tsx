import MyTips from './MyTips';
import React from 'react';
import { shallow } from 'enzyme';
import { MyTip } from '../../../universal/types';

const TIPS: MyTip[] = [];

it('Renders without crashing', () => {
  shallow(<MyTips isLoading={false} items={TIPS} />);
});
