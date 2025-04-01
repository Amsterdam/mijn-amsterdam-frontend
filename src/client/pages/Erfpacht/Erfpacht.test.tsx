import { render } from '@testing-library/react';
import { generatePath } from 'react-router-dom';
import { MutableSnapshot } from 'recoil';

import ERFPACHT_DOSSIERS from '../../../../mocks/fixtures/erfpacht-v2-dossiers.json';
import { transformDossierResponse } from '../../../server/services/erfpacht/erfpacht';
import { AppRoutes } from '../../../universal/config/routes';
import { appStateAtom } from '../../hooks/useAppState';
import MockApp from '../MockApp';
import { Erfpacht } from './Erfpacht';
import { AppState } from '../../../universal/types/App.types';

describe('<Erfpacht />', () => {
  const routeEntry = generatePath(AppRoutes.ERFPACHT);
  const routePath = AppRoutes.ERFPACHT;

  function Component({
    initializeState,
  }: {
    initializeState: (snapshot: MutableSnapshot) => void;
  }) {
    return (
      <MockApp
        routeEntry={routeEntry}
        routePath={routePath}
        component={Erfpacht}
        initializeState={initializeState}
      />
    );
  }

  test('Renders Overviewpage no data', () => {
    const testState = {
      ERFPACHT: {
        status: 'OK',
        content: null,
      },
    } as AppState;

    const screen = render(
      <Component
        initializeState={(snapshot) => {
          snapshot.set(appStateAtom, testState);
        }}
      />
    );

    expect(
      screen.getByText('Hieronder ziet u de gegevens van uw erfpachtrechten.')
    ).toBeInTheDocument();
    expect(screen.getByText('Erfpachtrechten')).toBeInTheDocument();
    expect(
      screen.getByText('U heeft (nog) geen erfpachtrechten')
    ).toBeInTheDocument();
    expect(screen.getByText('Openstaande facturen')).toBeInTheDocument();
    expect(
      screen.getByText('U heeft (nog) geen openstaande facturen')
    ).toBeInTheDocument();
  });

  test('Renders Overviewpage with error', () => {
    const testState = {
      ERFPACHT: {
        status: 'ERROR',
        content: null,
      },
    } as AppState;

    const screen = render(
      <Component
        initializeState={(snapshot) => {
          snapshot.set(appStateAtom, testState);
        }}
      />
    );

    expect(screen.getByText('Foutmelding')).toBeInTheDocument();
    expect(
      screen.getByText('We kunnen op dit moment niet alle gegevens tonen.')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Hieronder ziet u de gegevens van uw erfpachtrechten.')
    ).toBeInTheDocument();
    expect(screen.queryByText('Erfpachtrechten')).not.toBeInTheDocument();
    expect(
      screen.queryByText('U heeft geen erfpachtrechten.')
    ).not.toBeInTheDocument();
    expect(screen.queryByText('Openstaande facturen')).not.toBeInTheDocument();
    expect(
      screen.queryByText('U heeft geen openstaande facturen.')
    ).not.toBeInTheDocument();
  });

  test('Renders Overviewpage with data', () => {
    const testState = {
      ERFPACHT: {
        status: 'OK',
        content: transformDossierResponse(ERFPACHT_DOSSIERS as any, '123-abc'),
      },
    } as AppState;

    const screen = render(
      <Component
        initializeState={(snapshot) => {
          snapshot.set(appStateAtom, testState);
        }}
      />
    );

    expect(
      screen.getByText('Hieronder ziet u de gegevens van uw erfpachtrechten.')
    ).toBeInTheDocument();
    expect(screen.getByText('Erfpachtrechten')).toBeInTheDocument();
    expect(
      screen.queryByText('U heeft geen erfpachtrechten.')
    ).not.toBeInTheDocument();
    expect(screen.getByText('Openstaande facturen')).toBeInTheDocument();
    expect(
      screen.queryByText('U heeft geen openstaande facturen.')
    ).not.toBeInTheDocument();

    expect(screen.getByText('E477/48')).toBeInTheDocument();
    expect(screen.getByText('E7418/35')).toBeInTheDocument();
    expect(screen.getByText('E900/33')).toBeInTheDocument();
    expect(screen.getByText('E123/456')).toBeInTheDocument();
    expect(screen.getByText('E6470/243')).toBeInTheDocument();

    expect(screen.getAllByText('Toon meer').length).toBe(1);

    expect(screen.getByText('Bijkehuim 44 H')).toBeInTheDocument();
    expect(screen.getByText('Dit en Dat plein 66')).toBeInTheDocument();
    expect(screen.queryByText('Kweikade 33 H')).not.toBeInTheDocument();
  });
});
