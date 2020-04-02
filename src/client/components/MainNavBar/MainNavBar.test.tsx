import * as bliep from '../../hooks/media.hook';
import * as session from '../../hooks/api/session.api.hook';

import AppState, { SessionState } from '../../AppState';
import { mount, shallow } from 'enzyme';

import { BrowserRouter } from 'react-router-dom';
import MainNavBar from './MainNavBar';
import React from 'react';

const sessionState: session.SessionApiState = {
  isAuthenticated: true,
  isLoading: false,
  isError: false,
  isDirty: true,
  isPristine: false,
  errorMessage: '',
  validUntil: new Date().getTime(),
  validityInSeconds: 300,
  refetch: () => void 0,
  userType: 'BURGER',
};

const appState: any = {
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

  describe('Small screen version of MainNavBar', () => {
    let hookSpies: any = {};

    beforeEach(() => {
      hookSpies.useTabletScreen = jest
        .spyOn(bliep, 'useTabletScreen')
        .mockImplementation(() => true);
      hookSpies.useDesktopScreen = jest
        .spyOn(bliep, 'useDesktopScreen')
        .mockImplementation(() => false);
      hookSpies.useSessionApi = jest
        .spyOn(session, 'default')
        .mockImplementation(() => {
          return {
            isError: false,
            isPristine: false,
            errorMessage: '',
            isLoading: false,
            isAuthenticated: true,
            validUntil: 0,
            validityInSeconds: 0,
            isDirty: true,
            refetch: () => void 0,
          };
        });
    });
    afterEach(() => {
      hookSpies.useTabletScreen.mockRestore();
      hookSpies.useDesktopScreen.mockRestore();
      hookSpies.useSessionApi.mockRestore();
    });
    it('Renders burger menu on small screens', () => {
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
    it('Opens and closes the burger menu', () => {
      const component = mount(
        <BrowserRouter>
          <SessionState value={sessionState}>
            <AppState value={appState}>
              <MainNavBar />
            </AppState>
          </SessionState>
        </BrowserRouter>
      );

      expect(component.find('BurgerButton')).toHaveLength(1);
      component.find('BurgerButton').simulate('click');
      expect(component.find('.MainNavBar.BurgerMenuVisible')).toHaveLength(1);
    });
  });
});
