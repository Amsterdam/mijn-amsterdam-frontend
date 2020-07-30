import { mount, shallow } from 'enzyme';
import React from 'react';
import { generatePath } from 'react-router-dom';
import { MutableSnapshot } from 'recoil';
import { AppRoutes } from '../../../universal/config';
import * as session from '../../hooks/api/useSessionApi';
import * as mediaHook from '../../hooks/media.hook';
import { appStateAtom } from '../../hooks/useAppState';
import MockApp from '../../pages/MockApp';
import MainNavBar from './MainNavBar';

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

const testState = {
  SESSION: sessionState,
  CHAPTERS: {
    isLoading: false,
    items: [],
  },
  BRP: {
    status: 'OK',
    content: {
      persoon: {
        opgemaakteNaam: 'Hey ho!',
      },
    },
  },
};

function initializeState(snapshot: MutableSnapshot) {
  snapshot.set(appStateAtom, testState);
}

describe('<MainNavBar />', () => {
  const routeEntry = generatePath(AppRoutes.ROOT);
  const routePath = AppRoutes.ROOT;

  beforeAll(() => {
    (window.matchMedia as any) = jest.fn(() => {
      return {
        addListener: jest.fn(),
        removeListener: jest.fn(),
      };
    });
  });

  const Component = () => (
    <MockApp
      routeEntry={routeEntry}
      routePath={routePath}
      component={MainNavBar}
      initializeState={initializeState}
    />
  );

  it('Renders without crashing', () => {
    shallow(<Component />);
  });

  it('Matches the Desktop snapshot', () => {
    expect(mount(<Component />).html()).toMatchSnapshot();
  });

  describe('Small screen version of <MainNavBar />', () => {
    let hookSpies: any = {};

    beforeEach(() => {
      hookSpies.useTabletScreen = jest
        .spyOn(mediaHook, 'useTabletScreen')
        .mockImplementation(() => true);
      hookSpies.useDesktopScreen = jest
        .spyOn(mediaHook, 'useDesktopScreen')
        .mockImplementation(() => false);
      hookSpies.useSessionApi = jest
        .spyOn(session, 'useSessionApi')
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
            logout: () => void 0,
          };
        });
    });

    afterEach(() => {
      hookSpies.useTabletScreen.mockRestore();
      hookSpies.useDesktopScreen.mockRestore();
      hookSpies.useSessionApi.mockRestore();
    });

    it('Renders burger menu on small screens', () => {
      expect(mount(<Component />).html()).toMatchSnapshot();
    });

    it('Opens and closes the burger menu', () => {
      const component = mount(<Component />);

      expect(component.find('BurgerButton')).toHaveLength(1);
      component.find('BurgerButton').simulate('click');
      expect(component.find('.MainNavBar.BurgerMenuVisible')).toHaveLength(1);
    });
  });
});
