import React from 'react';
import { shallow, mount } from 'enzyme';
import MainNavBar from './MainNavBar';
import AppState, {
  AppState as AppStateInterface,
  SessionState,
} from 'AppState';
import { BrowserRouter } from 'react-router-dom';
import { SessionApiState } from '../../hooks/api/session.api.hook';
import * as bliep from '../../hooks/media.hook';
import { fireEvent } from 'react-test-renderer';

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

  describe('Small screen version of MainNavBar', () => {
    let hookSpies: any = {};

    beforeEach(() => {
      hookSpies.useTabletScreen = jest
        .spyOn(bliep, 'useTabletScreen')
        .mockImplementation(() => true);
      hookSpies.useDesktopScreen = jest
        .spyOn(bliep, 'useDesktopScreen')
        .mockImplementation(() => false);
    });
    afterEach(() => {
      hookSpies.useTabletScreen.mockRestore();
      hookSpies.useDesktopScreen.mockRestore();
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
    it('Opens and closes the burger menu', async () => {
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
