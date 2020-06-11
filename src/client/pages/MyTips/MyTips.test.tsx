import { shallow } from 'enzyme';
import React from 'react';
import { AppState } from '../../AppState';
import { MockAppStateProvider } from '../../AppStateProvider';
import MyTips from './MyTips';

const APP_STATE: Partial<AppState> = {
  TIPS: { content: { items: [] }, status: 'OK' },
};

it('Renders without crashing', () => {
  shallow(
    <MockAppStateProvider value={APP_STATE}>
      <MyTips />
    </MockAppStateProvider>
  );
});
