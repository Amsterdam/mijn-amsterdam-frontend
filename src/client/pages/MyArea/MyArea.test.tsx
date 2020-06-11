import { AppState } from '../../AppState';

import MyArea from './MyArea';
import React from 'react';
import { shallow } from 'enzyme';
import { MockAppStateProvider } from '../../AppStateProvider';

const appState: Partial<AppState> = {
  BRP: {
    content: null,
    status: 'PRISTINE',
  },
};

it('Renders without crashing', () => {
  shallow(
    <MockAppStateProvider value={appState}>
      <MyArea />
    </MockAppStateProvider>
  );
});
