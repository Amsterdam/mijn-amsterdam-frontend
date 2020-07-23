import { shallow, mount } from 'enzyme';
import React from 'react';
import { AppState } from '../../AppState';
import { MockAppStateProvider } from '../../AppStateProvider';
import Vergunningen from './Vergunningen';
import vergunningenData from '../../../server/mock-data/json/vergunningen.json';
import { transformVergunningenData } from '../../../server/services/vergunningen';
import { BrowserRouter } from 'react-router-dom';

const STATE_KEY = 'VERGUNNINGEN'; // Use correct state
const APP_STATE: Partial<AppState> = {
  [STATE_KEY]: {
    content: transformVergunningenData(vergunningenData as any),
    status: 'OK',
  },
};

describe('Vergunningen.tsx', () => {
  it('Renders without crashing', () => {
    shallow(
      <MockAppStateProvider value={APP_STATE}>
        <Vergunningen />
      </MockAppStateProvider>
    );
  });

  it('Matches the snapshot', () => {
    expect(
      mount(
        <BrowserRouter>
          <MockAppStateProvider value={APP_STATE}>
            <Vergunningen />
          </MockAppStateProvider>
        </BrowserRouter>
      ).html()
    ).toMatchSnapshot();
  });
});
