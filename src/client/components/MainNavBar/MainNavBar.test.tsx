import { render, screen } from '@testing-library/react';

import { MemoryRouter } from 'react-router-dom';
import { RecoilRoot } from 'recoil';
import {
  useMediaQueryContext,
  MediaQueryContextType,
} from '../../hooks/media.hook';
import MainNavBar from './MainNavBar';
import userEvent from '@testing-library/user-event';

jest.mock('../../hooks/media.hook');
jest.mock('react-router-dom', () => ({
  ...(jest.requireActual('react-router-dom') as object),
  useLocation: () => {
    return { pathname: '/' };
  },
  generatePth: (r: any) => r,
}));
jest.mock('./MainNavBar.constants', () => {
  return {
    mainMenuItems: [
      {
        id: 'TEST-MENU-ITEM',
        title: 'Test Menu Item',
        to: '/test/a/path',
      },
    ],
    mainMenuItemId: {
      'TEST-MENU-ITEM': 'TEST-MENU-ITEM',
    },
  };
});

describe('<MainNavBar />', () => {
  it('Renders without crashing', () => {
    render(
      <MemoryRouter>
        <RecoilRoot>
          <MainNavBar isAuthenticated={true} />
        </RecoilRoot>
      </MemoryRouter>
    );

    expect(screen.getByText(/Test Menu Item/)).toBeInTheDocument();
  });

  describe('Small screen version of <MainNavBar />', () => {
    it('Renders burger menu on small screens', () => {
      (useMediaQueryContext as MediaQueryContextType).mockReturnValue({
        isPhoneScreen: false,
        isDesktopScreen: false,
        isTabletScreen: true,
        isWideScreen: false,
        hasScreen: false,
      });

      render(
        <MemoryRouter>
          <RecoilRoot>
            <MainNavBar isAuthenticated={true} />
          </RecoilRoot>
        </MemoryRouter>
      );

      expect(screen.getByText('Test Menu Item')).toBeInTheDocument();
      expect(screen.getByText('Toon navigatie')).toBeInTheDocument();
      userEvent.click(screen.getByText('Toon navigatie'));
      expect(screen.getByText('Verberg navigatie')).toBeInTheDocument();
      expect(screen.getByText('Uitloggen')).toBeInTheDocument();
    });
  });
});
