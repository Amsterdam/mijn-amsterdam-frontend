import React from 'react';
import { shallow } from 'enzyme';
import MyTips from './MyTips';
import AppState from 'AppState';

const APP_STATE = { MIJN_TIPS: { data: { items: [] } } };

it('Renders without crashing', () => {
  shallow(
    <AppState value={APP_STATE}>
      <MyTips />
    </AppState>
  );
});
