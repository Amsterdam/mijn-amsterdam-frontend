import React from 'react';
import { shallow } from 'enzyme';
import MainNavBar from './MainNavBar';
import AppState, {
  AppState as AppStateInterface,
  SessionState,
} from 'AppState';
import { BrowserRouter } from 'react-router-dom';
import { SessionApiState } from '../../hooks/api/session.api.hook';

const sessionState: SessionApiState = {
  isAuthenticated: true,
  isLoading: false,
  isError: false,
  isDirty: true,
  isPristine: false,
  errorMessage: '',
  validUntil: new Date().getTime(),
  validityInSeconds: 300,
  refetch: () => void 0,
};

const appState: Partial<AppStateInterface> = {
  SESSION: sessionState,
  MY_CHAPTERS: {
    isLoading: false,
    items: [],
  },
  BRP: {
    isLoading: false,
    isError: false,
    isDirty: true,
    isPristine: false,
    errorMessage: '',
    data: {
      persoon: {
        opgemaakteNaam: 'Hey ho!',
      },
    },
  },
};

describe('MainNavBar', () => {
  it('Renders correctly', () => {
    expect(
      shallow(
        <BrowserRouter>
          <SessionState value={sessionState}>
            <AppState value={appState}>
              <MainNavBar />
            </AppState>
          </SessionState>
        </BrowserRouter>
      ).html()
    ).toMatchSnapshot();
  });
});
