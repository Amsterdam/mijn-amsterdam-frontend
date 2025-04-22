import { render, screen } from '@testing-library/react';
import { generatePath } from 'react-router';
import { MutableSnapshot } from 'recoil';
import { describe, expect, vi } from 'vitest';

import { forTesting, ZaakStatus } from './ZaakStatus';
import { AppRoutes } from '../../../universal/config/routes';
import { AppState } from '../../../universal/types/App.types';
import { appStateAtom, appStateReadyAtom } from '../../hooks/useAppState';
import MockApp from '../MockApp';

const mocks = vi.hoisted(() => {
  return {
    navigate: vi.fn(),
    location: { pathname: '/', search: '' },
  };
});

const testState = {
  VERGUNNINGEN: {
    status: 'OK',
    content: [
      {
        identifier: 'Z/000/000001.c',
        link: {
          to: '/vergunningen/vergunning/Z/000/000001.c',
        },
      },
    ],
  },
} as unknown as AppState;

function initializeState(snapshot: MutableSnapshot) {
  snapshot.set(appStateAtom, testState);
  snapshot.set(appStateReadyAtom, true);
}

vi.mock('react-router', async (requireActual) => {
  const origModule: object = await requireActual();
  return {
    ...origModule,
    useLocation: () => {
      return mocks.location;
    },
    useNavigate: () => mocks.navigate,
  };
});

describe('ZaakStatus', () => {
  const routeEntry = generatePath(AppRoutes.ZAAK_STATUS);
  const routePath = AppRoutes.ZAAK_STATUS;

  test('No query params passed', async () => {
    function Component() {
      return (
        <MockApp
          routeEntry={routeEntry}
          routePath={routePath}
          component={ZaakStatus}
          initializeState={initializeState}
        />
      );
    }
    const { asFragment } = render(<Component />);

    expect(mocks.navigate).not.toHaveBeenCalled();

    expect(asFragment()).toMatchSnapshot();
  });

  it('should show error alert', () => {
    mocks.location = {
      pathname: '/',
      search: 'thema=vergunningen&id=Z/000/000.c&payment=true',
    };

    function Component() {
      return (
        <MockApp
          routeEntry={routePath}
          routePath={routePath}
          component={ZaakStatus}
          initializeState={(snapshot) =>
            snapshot.set(appStateAtom, {
              VERGUNNINGEN: { status: 'ERROR', content: null },
            } as unknown as AppState)
          }
        />
      );
    }

    const { asFragment } = render(<Component />);

    expect(asFragment()).toMatchSnapshot();
  });

  it('should show not found message', () => {
    mocks.location = {
      pathname: '/',
      search: 'thema=vergunningen&id=Z/000/000.c',
    };

    function Component() {
      return (
        <MockApp
          routeEntry={routePath}
          routePath={routePath}
          component={ZaakStatus}
          initializeState={initializeState}
        />
      );
    }

    const { asFragment } = render(<Component />);

    expect(
      screen.getByText('Wij kunnen de status van uw aanvraag niet laten zien.')
    ).toBeInTheDocument();

    expect(mocks.navigate).not.toHaveBeenCalled();

    expect(asFragment()).toMatchSnapshot();
  });

  it('should show wachten op betaling', () => {
    mocks.location = {
      pathname: '/',
      search: 'thema=vergunningen&id=Z/000/000.c&payment=true',
    };

    function Component() {
      return (
        <MockApp
          routeEntry={routePath}
          routePath={routePath}
          component={ZaakStatus}
          initializeState={initializeState}
        />
      );
    }

    const { asFragment } = render(<Component />);

    expect(
      screen.getByText('Wij kunnen de status van uw aanvraag niet laten zien.')
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'U heeft betaald voor deze aanvraag. Het kan even duren voordat uw aanvraag op Mijn Amsterdam te zien is.'
      )
    ).toBeInTheDocument();

    expect(mocks.navigate).not.toHaveBeenCalled();

    expect(asFragment()).toMatchSnapshot();
  });

  it('should call navigate when a route is found', () => {
    mocks.location = {
      pathname: '/',
      search: 'thema=vergunningen&id=Z/000/000001.c',
    };

    function Component() {
      return (
        <MockApp
          routeEntry={routePath}
          routePath={routePath}
          component={ZaakStatus}
          initializeState={initializeState}
        />
      );
    }

    render(<Component />);

    expect(mocks.navigate).toHaveBeenCalled();
  });

  describe('baseThemaConfig', () => {
    const { baseThemaConfig } = forTesting;

    it('should return NOT_ABLE_TO_DETERMINE_ROUTE when state is loading', () => {
      const getRoute = baseThemaConfig(
        AppRoutes.VERGUNNINGEN,
        'VERGUNNINGEN'
      ).getRoute;

      const result = getRoute('Z/000/000001.c', {
        VERGUNNINGEN: { status: 'PRISTINE', content: null },
      } as unknown as AppState);

      expect(result).toBeUndefined();
    });

    it('should return STATE_ERROR when state is error', () => {
      const getRoute = baseThemaConfig(
        AppRoutes.VERGUNNINGEN,
        'VERGUNNINGEN'
      ).getRoute;

      const result = getRoute('Z/000/000001.c', {
        VERGUNNINGEN: { status: 'ERROR', content: null },
      } as unknown as AppState);

      expect(result).toBe('state-error');
    });

    it('should return ITEM_NOT_FOUND when zaken array is not found', () => {
      const getRoute = baseThemaConfig(
        AppRoutes.VERGUNNINGEN,
        'VERGUNNINGEN'
      ).getRoute;

      const result = getRoute('Z/000/000001.c', {
        VERGUNNINGEN: { status: 'OK', content: null },
      } as unknown as AppState);

      expect(result).toBe('not-found');
    });

    it('should return the correct route when zaken array contains the identifier', () => {
      const getRoute = baseThemaConfig(
        AppRoutes.VERGUNNINGEN,
        'VERGUNNINGEN'
      ).getRoute;

      const result = getRoute('Z/000/000001.c', {
        VERGUNNINGEN: {
          status: 'OK',
          content: [
            {
              identifier: 'Z/000/000001.c',
              link: { to: '/vergunningen/vergunning/Z-000-000001.c' },
            },
          ],
        },
      } as unknown as AppState);

      expect(result).toBe('/vergunningen/vergunning/Z-000-000001.c');
    });

    it('should return ITEM_NOT_FOUND when zaken array does not contain the identifier', () => {
      const getRoute = baseThemaConfig(
        AppRoutes.VERGUNNINGEN,
        'VERGUNNINGEN'
      ).getRoute;

      const result = getRoute('Z/000/000002.c', {
        VERGUNNINGEN: {
          status: 'OK',
          content: [
            {
              identifier: 'Z/000/000001.c',
              link: { to: '/vergunningen/vergunning/Z-000-000001.c' },
            },
          ],
        },
      } as unknown as AppState);

      expect(result).toBe('not-found');
    });

    it('should use a custom getZaken function', () => {
      const customGetZaken = (stateSlice: any) => {
        return stateSlice?.customZaken || null;
      };

      const getRoute = baseThemaConfig(
        AppRoutes.VERGUNNINGEN,
        'VERGUNNINGEN',
        customGetZaken
      ).getRoute;

      const result = getRoute('Z/000/000003.c', {
        VERGUNNINGEN: {
          status: 'OK',
          customZaken: [
            {
              identifier: 'Z/000/000003.c',
              link: { to: '/custom/route/Z-000-000003.c' },
            },
          ],
        },
      } as unknown as AppState);

      expect(result).toBe('/custom/route/Z-000-000003.c');
    });
  });
});
