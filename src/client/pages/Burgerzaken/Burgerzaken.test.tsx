import { shallow } from 'enzyme';
import React from 'react';
import { MockAppStateProvider } from '../../AppStateProvider';
import Burgerzaken from './Burgerzaken';

const APP_STATE = {}; // Add slice of the AppState here

it('Renders without crashing', () => {
  shallow(
    <MockAppStateProvider value={APP_STATE}>
      <Burgerzaken />
    </MockAppStateProvider>
  );
});
