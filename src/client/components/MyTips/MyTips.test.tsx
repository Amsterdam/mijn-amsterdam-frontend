import MyTips from './MyTips';
import React from 'react';
import { shallow } from 'enzyme';
import { MyTip } from '../../../universal/types';
import * as profileTypeHook from '../../hooks/useProfileType';

const TIPS: MyTip[] = [];

describe('<MyTips />', () => {
  const profileTypeHookMock = ((profileTypeHook as any).useProfileTypeValue = jest.fn(
    () => 'prive'
  ));

  afterAll(() => {
    profileTypeHookMock.mockRestore();
  });

  it('Renders without crashing', () => {
    shallow(<MyTips isLoading={false} items={TIPS} />);
  });
});
