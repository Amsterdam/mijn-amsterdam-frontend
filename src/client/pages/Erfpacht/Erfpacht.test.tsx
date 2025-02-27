import { render } from '@testing-library/react';
import { generatePath } from 'react-router-dom';
import { MutableSnapshot } from 'recoil';

import ERFPACHTv2_DOSSIERS from '../../../../mocks/fixtures/erfpacht-v2-dossiers.json';
import { transformDossierResponse } from '../../../server/services/simple-connect/erfpacht';
import { AppRoutes } from '../../../universal/config/routes';
import { appStateAtom } from '../../hooks/useAppState';
import MockApp from '../MockApp';
import { Erfpacht } from './Erfpacht';
import { AppState } from '../../../universal/types/App.types';

describe('<Erfpacht />', () => {
  const routeEntry = generatePath(AppRoutes.ERFPACHTv2);
  const routePath = AppRoutes.ERFPACHTv2;

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
      ERFPACHTv2: {
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
      screen.getByText('U heeft geen erfpachtrechten.')
    ).toBeInTheDocument();
    expect(screen.getByText('Openstaande facturen')).toBeInTheDocument();
    expect(
      screen.getByText('U heeft geen openstaande facturen.')
    ).toBeInTheDocument();
  });

  test('Renders Overviewpage with error', () => {
    const testState = {
      ERFPACHTv2: {
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
      screen.getByText('We kunnen op dit moment geen erfpachtrechten tonen.')
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
      ERFPACHTv2: {
        status: 'OK',
        content: transformDossierResponse(
          ERFPACHTv2_DOSSIERS as any,
          '123-abc'
        ),
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

    expect(screen.getAllByText('Toon meer').length).toBe(1);

    expect(screen.queryByText('E123/456')).not.toBeInTheDocument();
    expect(screen.queryByText('E6470/243')).not.toBeInTheDocument();

    expect(screen.queryByText('Bijkehuim 44 H')).toBeInTheDocument();
    expect(screen.getByText('Dit en Dat plein 66')).toBeInTheDocument();
    expect(screen.getByText('Kweikade 33 H')).toBeInTheDocument();
  });
});
