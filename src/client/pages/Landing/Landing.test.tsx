import { shallow } from 'enzyme';
import React from 'react';
import Landing from './Landing';
import { RecoilRoot } from 'recoil';
import { sessionAtom, SessionState } from '../../hooks/api/useSessionApi';

const appState = { isAuthenticated: false } as SessionState;

describe('<Landing />', () => {
  it('Renders without crashing', () => {
    expect(
      shallow(
        <RecoilRoot
          initializeState={snapshot => snapshot.set(sessionAtom, appState)}
        >
          <Landing />
        </RecoilRoot>
      ).html()
    ).toMatchSnapshot();
  });
});
