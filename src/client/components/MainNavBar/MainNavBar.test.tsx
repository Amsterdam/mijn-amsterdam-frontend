import * as bliep from '../../hooks/media.hook';
import * as session from '../../hooks/api/api.session';

import { mount, shallow } from 'enzyme';

import { BrowserRouter } from 'react-router-dom';
import MainNavBar from './MainNavBar';
import React from 'react';
import { SessionState } from '../../SessionState';
import { MockAppStateProvider } from '../../AppStateProvider';

const sessionState: any = {
  isAuthenticated: true,
  isLoading: false,
  isError: false,
  isDirty: true,
  isPristine: false,
  validUntil: new Date().getTime(),
  validityInSeconds: 300,
  refetch: () => void 0,
  userType: 'BURGER',
};

const appState: any = {
  SESSION: sessionState,
  CHAPTERS: {
    isLoading: false,
    items: [],
  },
  BRP: {
    isLoading: false,
    isError: false,
    isDirty: true,
    isPristine: false,
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
            <MockAppStateProvider value={appState}>
              <MainNavBar />
            </MockAppStateProvider>
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
            isLoading: false,
            isAuthenticated: true,
            validUntil: 0,
            validityInSeconds: 0,
            userType: 'BURGER',
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
              <MockAppStateProvider value={appState}>
                <MainNavBar />
              </MockAppStateProvider>
            </SessionState>
          </BrowserRouter>
        ).html()
      ).toMatchSnapshot();
    });
    it('Opens and closes the burger menu', () => {
      const component = mount(
        <BrowserRouter>
          <SessionState value={sessionState}>
            <MockAppStateProvider value={appState}>
              <MainNavBar />
            </MockAppStateProvider>
          </SessionState>
        </BrowserRouter>
      );

      expect(component.find('BurgerButton')).toHaveLength(1);
      component.find('BurgerButton').simulate('click');
      expect(component.find('.MainNavBar.BurgerMenuVisible')).toHaveLength(1);
    });
  });
});
