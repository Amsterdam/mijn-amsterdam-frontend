import { render, screen } from '@testing-library/react';

import { MemoryRouter } from 'react-router-dom';
import { RecoilRoot } from 'recoil';
import { useTabletScreen } from '../../hooks/media.hook';
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
    expect(
      screen.queryByLabelText('Dit ziet u in Mijn Amsterdam')
    ).toBeInTheDocument();
  });

  describe('Small screen version of <MainNavBar />', () => {
    it('Renders burger menu on small screens', () => {
      (useTabletScreen as jest.Mock).mockReturnValue(true);

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
      expect(
        screen.queryByLabelText('Dit ziet u in Mijn Amsterdam')
      ).toBeInTheDocument();
    });

    // it('Opens and closes the burger menu', () => {
    //   const component = mount(<Component />);

    //   expect(component.find('BurgerButton')).toHaveLength(1);
    //   component.find('BurgerButton').simulate('click');
    //   expect(component.find('.MainNavBar.BurgerMenuVisible')).toHaveLength(1);
    // });
  });
});
