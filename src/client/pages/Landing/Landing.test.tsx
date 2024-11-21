import { render } from '@testing-library/react';
import { RecoilRoot } from 'recoil';
import { describe, expect, it } from 'vitest';

import Landing from './Landing';
import { bffApi } from '../../../testing/utils';
import { SessionState, sessionAtom } from '../../hooks/api/useSessionApi';

const appState = { isAuthenticated: false } as SessionState;

describe('<Landing />', () => {
  bffApi
    .get('/services/cms/maintenance-notifications?page=landingspagina')
    .reply(200);

  it('Renders without crashing', () => {
    const { asFragment } = render(
      <RecoilRoot
        initializeState={(snapshot) => snapshot.set(sessionAtom, appState)}
      >
        <Landing />
      </RecoilRoot>
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
