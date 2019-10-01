import React from 'react';
import { shallow } from 'enzyme';
import MyTips from './MyTips';
import { MyTip } from 'hooks/api/my-tips-api.hook';

const MY_TIPS: MyTip[] = [];

it('Renders without crashing', () => {
  shallow(<MyTips isLoading={false} items={MY_TIPS} />);
});
