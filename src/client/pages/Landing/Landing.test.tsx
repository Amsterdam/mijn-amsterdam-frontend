import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { LandingPage } from './Landing.tsx';
import { bffApi } from '../../../testing/utils.ts';
import { SessionState, sessionAtom } from '../../hooks/api/useSessionApi.ts';
import MockApp from '../MockApp.tsx';

const appState = { isAuthenticated: false } as SessionState;

describe('<Landing />', () => {
  bffApi
    .get('/services/cms/maintenance-notifications?page=landingspagina')
    .reply(200);

  it('Renders without crashing', () => {
    const { asFragment } = render(
      <MockApp
        routeEntry="/"
        routePath="/"
        component={LandingPage}
        initializeState={(snapshot) => snapshot.set(sessionAtom, appState)}
      />
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
