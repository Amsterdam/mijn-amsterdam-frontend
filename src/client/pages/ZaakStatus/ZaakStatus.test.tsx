import { render, screen } from '@testing-library/react';
import { generatePath } from 'react-router';
import { MutableSnapshot } from 'recoil';
import { describe, expect, vi } from 'vitest';

import { ZaakStatus } from './ZaakStatus';
import { AppRoutes } from '../../../universal/config/routes';
import { AppState } from '../../../universal/types';
import { appStateAtom, appStateReadyAtom } from '../../hooks/useAppState';
import MockApp from '../MockApp';

const mocks = vi.hoisted(() => {
  return {
    pushMock: vi.fn(),
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
    useNavigate: mocks.pushMock,
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

    expect(mocks.pushMock).not.toHaveBeenCalled();

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

    expect(mocks.pushMock).not.toHaveBeenCalled();

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

    expect(mocks.pushMock).not.toHaveBeenCalled();

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

    expect(mocks.pushMock).toHaveBeenCalled();
  });
});
