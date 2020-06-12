import { shallow } from 'enzyme';
import React from 'react';
import { AppState } from '../../AppState';
import { MockAppStateProvider } from '../../AppStateProvider';
import Vergunningen from './Vergunningen';

const STATE_KEY = 'BRP'; // Use correct state
const APP_STATE: Partial<AppState> = {
  [STATE_KEY]: { content: null, status: 'OK' },
}; // Add slice of the AppState here

it('Renders without crashing', () => {
  shallow(
    <MockAppStateProvider value={APP_STATE}>
      <Vergunningen />
    </MockAppStateProvider>
  );
});
