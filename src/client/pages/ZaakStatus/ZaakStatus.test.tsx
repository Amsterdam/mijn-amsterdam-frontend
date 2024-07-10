import { describe, expect, vi } from 'vitest';
import ZaakStatus from './ZaakStatus';
import { render, screen } from '@testing-library/react';
import {
  addLinks,
  horecaVergunningTypes,
  toeristischeVerhuurVergunningTypes,
  transformVergunningenData,
  VergunningenSourceData,
} from '../../../server/services';
import vergunningenData from '../../../../mocks/fixtures/vergunningen.json';
import { AppRoutes } from '../../../universal/config/routes';
import { generatePath } from 'react-router-dom';
import MockApp from '../MockApp';
import { MutableSnapshot } from 'recoil';
import { appStateAtom } from '../../hooks/useAppState';

const pushMock = vi.fn();

const testState: any = {
  VERGUNNINGEN: {
    status: 'OK',
    content: addLinks(
      transformVergunningenData(
        vergunningenData as VergunningenSourceData
      ).filter(
        (vergunning) =>
          ![
            ...toeristischeVerhuurVergunningTypes,
            ...horecaVergunningTypes,
          ].includes(vergunning.caseType)
      ),
      AppRoutes['VERGUNNINGEN/DETAIL']
    ),
  },
};

function initializeState(snapshot: MutableSnapshot) {
  snapshot.set(appStateAtom, testState);
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

  it('should show an error', async () => {
    const Component = () => (
      <MockApp
        routeEntry={routeEntry}
        routePath={routePath}
        component={ZaakStatus}
        initializeState={initializeState}
      />
    );
    const asFragment = render(<Component />);

    expect(
      screen.getByText(
        'Wij kunnen de status van uw aanvraag nu niet laten zien.'
      )
    ).toBeInTheDocument();

    expect(pushMock).not.toHaveBeenCalled();

    expect(asFragment).toMatchSnapshot();
  });

  it('should show wachten op betaling', () => {
    historyReturnValue = {
      location: {
        pathname: '/',
        search: 'thema=vergunningen&id=Z/000/000.c&payment=true',
      },
      push: pushMock,
    };

    const Component = () => (
      <MockApp
        routeEntry={routePath}
        routePath={routePath}
        component={ZaakStatus}
        initializeState={initializeState}
      />
    );

    const asFragment = render(<Component />);

    expect(
      screen.getByText(
        'U heeft betaald voor deze aanvraag. Het kan even duren voordat uw aanvraag op Mijn Amsterdam te zien is.'
      )
    ).toBeInTheDocument();

    expect(pushMock).not.toHaveBeenCalled();

    expect(asFragment).toMatchSnapshot();
  });

  it('should call history push when a route is found', () => {
    historyReturnValue = {
      location: {
        pathname: '/',
        search: 'thema=vergunningen&id=Z/000/000001.c',
      },
      push: pushMock,
    };

    const Component = () => (
      <MockApp
        routeEntry={routePath}
        routePath={routePath}
        component={ZaakStatus}
        initializeState={initializeState}
      />
    );

    render(<Component />);

    expect(pushMock).toHaveBeenCalled();
  });
});
