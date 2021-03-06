import { render } from '@testing-library/react';

import Landing from './Landing';
import { RecoilRoot } from 'recoil';
import { sessionAtom, SessionState } from '../../hooks/api/useSessionApi';

const appState = { isAuthenticated: false } as SessionState;

describe('<Landing />', () => {
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
