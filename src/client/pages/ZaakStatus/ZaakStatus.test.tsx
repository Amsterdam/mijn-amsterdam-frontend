import { render, screen } from '@testing-library/react';
import { generatePath } from 'react-router-dom';
import { MutableSnapshot } from 'recoil';
import { describe, expect, vi } from 'vitest';

import ZaakStatus from './ZaakStatus';
import vergunningenData from '../../../../mocks/fixtures/vergunningen.json';
import {
  addLinks,
  horecaVergunningTypes,
  toeristischeVerhuurVergunningTypes,
  transformVergunningenData,
  VergunningenDecos,
} from '../../../server/services';
import { AppRoutes } from '../../../universal/config/routes';
import { AppState } from '../../../universal/types';
import { appStateAtom, appStateReadyAtom } from '../../hooks/useAppState';
import MockApp from '../MockApp';

const pushMock = vi.fn();

const testState = {
  VERGUNNINGEN: {
    status: 'OK',
    content: addLinks(
      transformVergunningenData(vergunningenData as VergunningenDecos).filter(
        (vergunning) =>
          ![
            ...toeristischeVerhuurVergunningTypes,
            ...horecaVergunningTypes,
          ].includes(vergunning.caseType)
      ),
      AppRoutes['VERGUNNINGEN/DETAIL']
    ),
  },
} as unknown as AppState;

function initializeState(snapshot: MutableSnapshot) {
  snapshot.set(appStateAtom, testState);
  snapshot.set(appStateReadyAtom, true);
}

let historyReturnValue = {
  location: { pathname: '/', search: '' },
  push: pushMock,
};

vi.mock('react-router-dom', async (requireActual) => {
  const origModule: object = await requireActual();
  return {
    ...origModule,
    useHistory: () => {
      return historyReturnValue;
    },
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

    expect(pushMock).not.toHaveBeenCalled();

    expect(asFragment()).toMatchSnapshot();
  });

  it('should show error alert', () => {
    historyReturnValue = {
      location: {
        pathname: '/',
        search: 'thema=vergunningen&id=Z/000/000.c&payment=true',
      },
      push: pushMock,
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
    historyReturnValue = {
      location: {
        pathname: '/',
        search: 'thema=vergunningen&id=Z/000/000.c',
      },
      push: pushMock,
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

    expect(pushMock).not.toHaveBeenCalled();

    expect(asFragment()).toMatchSnapshot();
  });

  it('should show wachten op betaling', () => {
    historyReturnValue = {
      location: {
        pathname: '/',
        search: 'thema=vergunningen&id=Z/000/000.c&payment=true',
      },
      push: pushMock,
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

    expect(pushMock).not.toHaveBeenCalled();

    expect(asFragment()).toMatchSnapshot();
  });

  it('should call history push when a route is found', () => {
    historyReturnValue = {
      location: {
        pathname: '/',
        search: 'thema=vergunningen&id=Z/000/000001.c',
      },
      push: pushMock,
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

    expect(pushMock).toHaveBeenCalled();
  });
});
