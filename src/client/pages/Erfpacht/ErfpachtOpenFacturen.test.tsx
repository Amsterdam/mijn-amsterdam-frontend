import { render } from '@testing-library/react';
import { generatePath } from 'react-router-dom';
import { MutableSnapshot } from 'recoil';

import ERFPACHTv2_DOSSIERS from '../../../../mocks/fixtures/erfpacht-v2-dossiers.json';
import {
  ErfpachtV2DossiersResponse,
  transformDossierResponse,
} from '../../../server/services/erfpacht/erfpacht';
import { AppRoutes } from '../../../universal/config/routes';
import { AppState } from '../../../universal/types/App.types';
import { appStateAtom } from '../../hooks/useAppState';
import MockApp from '../MockApp';
import { ErfpachtOpenFacturen } from './ErfpachtOpenFacturen';

describe('<ErfpachtOpenFacturen />', () => {
  const routeEntry = generatePath(AppRoutes['ERFPACHTv2/OPEN_FACTUREN']);
  const routePath = AppRoutes['ERFPACHTv2/OPEN_FACTUREN'];

  const dossiersTransformed = transformDossierResponse(
    ERFPACHTv2_DOSSIERS as unknown as ErfpachtV2DossiersResponse,
    'xxx-relatie-code-xxx'
  );

  function Component({
    initializeState,
  }: {
    initializeState: (snapshot: MutableSnapshot) => void;
  }) {
    return (
      <MockApp
        routeEntry={routeEntry}
        routePath={routePath}
        component={ErfpachtOpenFacturen}
        initializeState={initializeState}
      />
    );
  }

  test('Renders Open Facturen List Page no data', () => {
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
      screen.getByRole('heading', { name: 'Openstaande facturen' })
    ).toBeInTheDocument();
    expect(
      screen.getByText('U heeft (nog) geen gegevens op deze pagina.')
    ).toBeInTheDocument();
  });

  test('Renders Open Facturen List Page with data', () => {
    const testState = {
      ERFPACHTv2: {
        status: 'OK',
        content: dossiersTransformed,
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
      screen.getByRole('heading', { name: 'Openstaande facturen' })
    ).toBeInTheDocument();
    expect(
      screen.queryByText('U heeft (nog) geen gegevens op deze pagina.')
    ).not.toBeInTheDocument();

    expect(screen.getByText('Bijkehuim 44 H')).toBeInTheDocument();
    expect(screen.getByText('Dit en Dat plein 66')).toBeInTheDocument();
    expect(screen.getByText('Kweikade 33 H')).toBeInTheDocument();

    expect(screen.getByText('A.123123123')).toBeInTheDocument();
    expect(screen.getByText('B.123123123')).toBeInTheDocument();
    expect(screen.getByText('C.123123123')).toBeInTheDocument();

    expect(screen.getByText('€ 55,02')).toBeInTheDocument();
    expect(screen.getByText('€ 43,02')).toBeInTheDocument();
    expect(screen.getByText('€ 123,02')).toBeInTheDocument();

    expect(screen.getByText('16 april 2023')).toBeInTheDocument();
    expect(screen.getByText('16 maart 2023')).toBeInTheDocument();
    expect(screen.getByText('16 december 2023')).toBeInTheDocument();
  });

  test('Renders Open Facturen List Page with data on a small screen device', () => {
    const testState = {
      ERFPACHTv2: {
        status: 'OK',
        content: dossiersTransformed,
      },
    } as AppState;

    const screen = render(
      <Component
        initializeState={(snapshot) => {
          snapshot.set(appStateAtom, testState);
        }}
      />
    );

    vi.doMock('../../hooks/media.hook', (importActual) => {
      return {
        ...importActual(),
        useMediumScreen: vi.fn().mockReturnValueOnce(true),
      };
    });

    expect(
      screen.getByRole('heading', { name: 'Openstaande facturen' })
    ).toBeInTheDocument();
    expect(
      screen.queryByText('U heeft (nog) geen gegevens op deze pagina.')
    ).not.toBeInTheDocument();

    expect(screen.getByText('Bijkehuim 44 H')).toBeInTheDocument();
    expect(screen.getByText('Dit en Dat plein 66')).toBeInTheDocument();
    expect(screen.getByText('Kweikade 33 H')).toBeInTheDocument();

    expect(screen.getByText('A.123123123')).toBeInTheDocument();
    expect(screen.getByText('B.123123123')).toBeInTheDocument();
    expect(screen.getByText('C.123123123')).toBeInTheDocument();

    expect(screen.getByText('€ 55,02')).toBeInTheDocument();
    expect(screen.getByText('€ 43,02')).toBeInTheDocument();
    expect(screen.getByText('€ 123,02')).toBeInTheDocument();

    expect(screen.getByText('16 april 2023')).toBeInTheDocument();
    expect(screen.getByText('16 maart 2023')).toBeInTheDocument();
    expect(screen.getByText('16 december 2023')).toBeInTheDocument();
  });

  test('Renders Open Facturen List Page with error', () => {
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
      screen.getByText('We kunnen op dit moment niet alle gegevens tonen.')
    ).toBeInTheDocument();
  });
});
