import AppState from '../../AppState';
import MyTips from './MyTips';
import React from 'react';
import { shallow } from 'enzyme';

const APP_STATE = { MIJN_TIPS: { data: { items: [] } } };

it('Renders without crashing', () => {
  shallow(
    <AppState value={APP_STATE}>
      <MyTips />
    </AppState>
  );
});
