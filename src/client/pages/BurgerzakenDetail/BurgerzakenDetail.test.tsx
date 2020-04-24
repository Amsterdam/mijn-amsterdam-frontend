import React from 'react';
import { shallow } from 'enzyme';
import BurgerzakenDetail from './BurgerzakenDetail';
import { MockAppStateProvider } from '../../AppStateProvider';

const APP_STATE = {}; // Add slice of the AppState here

it('Renders without crashing', () => {
  shallow(
    <MockAppStateProvider value={APP_STATE}>
      <BurgerzakenDetail />
    </MockAppStateProvider>
  );
});
