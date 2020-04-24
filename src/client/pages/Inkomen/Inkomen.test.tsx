import { shallow } from 'enzyme';
import React from 'react';
import { MockAppStateProvider } from '../../AppStateProvider';
import Inkomen from './Inkomen';
import { AppState } from '../../AppState';

const APP_STATE = { WMO: { content: { items: [] }, status: 'OK' } } as Partial<
  AppState
>;

it('Renders without crashing', () => {
  shallow(
    <MockAppStateProvider value={APP_STATE}>
      <Inkomen />
    </MockAppStateProvider>
  );
});
