import { shallow, mount } from 'enzyme';
import React from 'react';
import { AppState } from '../../AppState';
import { MockAppStateProvider } from '../../AppStateProvider';
import VergunningDetail from './VergunningDetail';
import { transformVergunningenData } from '../../../server/services/vergunningen';
import vergunningenData from '../../../server/mock-data/json/vergunningen.json';
import { generatePath, MemoryRouter, Route } from 'react-router-dom';
import { AppRoutes } from '../../../universal/config/routing';

const STATE_KEY = 'VERGUNNINGEN'; // Use correct state
const content = transformVergunningenData(vergunningenData as any);
const APP_STATE: Partial<AppState> = {
  [STATE_KEY]: {
    content,
    status: 'OK',
  },
};

describe('VergunningDetail', () => {
  const testDetailPageUrl = generatePath(AppRoutes['VERGUNNINGEN/DETAIL'], {
    id: content[0].id,
  });

  it('Renders without crashing', () => {
    shallow(
      <MockAppStateProvider value={APP_STATE}>
        <VergunningDetail />
      </MockAppStateProvider>
    );
  });

  it('Matches the snapshot', () => {
    expect(
      mount(
        <MemoryRouter initialEntries={[testDetailPageUrl]}>
          <MockAppStateProvider value={APP_STATE}>
            <Route path={AppRoutes['VERGUNNINGEN/DETAIL']}>
              <VergunningDetail />
            </Route>
          </MockAppStateProvider>
        </MemoryRouter>
      ).html()
    ).toMatchSnapshot();
  });
});
