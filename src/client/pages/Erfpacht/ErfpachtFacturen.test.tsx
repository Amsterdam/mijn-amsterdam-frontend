import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { generatePath } from 'react-router-dom';
import { MutableSnapshot } from 'recoil';

import ERFPACHTv2_DOSSIER_DETAIL from '../../../../mocks/fixtures/erfpacht-v2-dossierinfo-bsn.json';
import ERFPACHTv2_DOSSIERS from '../../../../mocks/fixtures/erfpacht-v2-dossiers.json';
import {
  ErfpachtV2DossiersResponse,
  transformDossierResponse,
  transformErfpachtDossierProperties,
} from '../../../server/services/simple-connect/erfpacht';
import { bffApi } from '../../../testing/utils';
import { AppRoutes } from '../../../universal/config/routes';
import { AppState } from '../../../universal/types/App.types';
import { appStateAtom } from '../../hooks/useAppState';
import MockApp from '../MockApp';
import { ErfpachtFacturen } from './ErfpachtFacturen';

describe('<ErfpachtOpenFacturen />', () => {
  const user = userEvent.setup();

  const routeEntry = generatePath(AppRoutes['ERFPACHTv2/ALLE_FACTUREN'], {
    dossierNummerUrlParam: 'E.123.123',
  });
  const routePath = AppRoutes['ERFPACHTv2/ALLE_FACTUREN'];

  const dossierDetailTransformed = transformErfpachtDossierProperties(
    ERFPACHTv2_DOSSIER_DETAIL as any
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
        component={ErfpachtFacturen}
        initializeState={initializeState}
      />
    );
  }

  test('Renders Facturen List Page no data', async () => {
    bffApi
      .get('/services/erfpachtv2/dossier/E.123.123')
      .reply(200, { content: null, status: 'OK' });

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

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: 'Facturen' })
      ).toBeInTheDocument();
      expect(screen.getByText('U heeft geen facturen.')).toBeInTheDocument();
    });
  });

  test('Renders Facturen List Page with data', async () => {
    bffApi
      .get('/services/erfpachtv2/dossier/E.123.123')
      .reply(200, { content: dossierDetailTransformed, status: 'OK' });

    const testState = {
      ERFPACHTv2: {
        status: 'OK',
        content: transformDossierResponse(
          ERFPACHTv2_DOSSIERS as unknown as ErfpachtV2DossiersResponse,
          'xxx-relatie-code-xxx'
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

    await waitFor(async () => {
      expect(
        screen.getByRole('heading', { name: 'Facturen' })
      ).toBeInTheDocument();
      expect(
        screen.queryByText('U heeft (nog) geen facturen.')
      ).not.toBeInTheDocument();

      const facturenPage1 = [
        { factuurNummer: 'A.123123123123', factuurBedrag: '€ 62,82' },
        { factuurNummer: 'B.123123123123', factuurBedrag: '€ 62,82' },
        { factuurNummer: 'C.123123123123', factuurBedrag: '€ 62,82' },
        { factuurNummer: 'D.123123123123', factuurBedrag: '€ 62,82' },
        { factuurNummer: 'E.123123123123', factuurBedrag: '€ 62,82' },
        { factuurNummer: 'F.123123123123', factuurBedrag: '€ 62,82' },
        { factuurNummer: 'G.123123123123', factuurBedrag: '€ 62,82' },
        { factuurNummer: 'H.123123123123', factuurBedrag: '€ 62,82' },
        { factuurNummer: 'I.123123123123', factuurBedrag: '€ 62,82' },
        { factuurNummer: 'J.123123123123', factuurBedrag: '€ 64,14' },
      ];

      for (const factuur of facturenPage1) {
        expect(screen.getByText(factuur.factuurNummer)).toBeInTheDocument();
      }

      expect(screen.queryByText('volgende')).not.toBeInTheDocument();
    });

    await waitFor(() => {
      const facturenPage2 = [
        // Next page
        { factuurNummer: 'K.123123123123', factuurBedrag: '€ 64,14' },
        { factuurNummer: 'L.123123123123', factuurBedrag: '€ 64,14' },
        { factuurNummer: 'M.123123123123', factuurBedrag: '€ 128,27' },
      ];

      for (const factuur of facturenPage2) {
        expect(screen.getByText(factuur.factuurNummer)).toBeInTheDocument();
      }
    });
  });

  test('Renders Facturen List Page with error', async () => {
    const testState = {
      ERFPACHTv2: {
        status: 'ERROR',
        content: null,
      },
    } as AppState;

    bffApi
      .get('/services/erfpachtv2/dossier/E.123.123')
      .reply(500, { content: null, status: 'ERROR' });

    const screen = render(
      <Component
        initializeState={(snapshot) => {
          snapshot.set(appStateAtom, testState);
        }}
      />
    );
    await waitFor(() => {
      expect(screen.getByText('Foutmelding')).toBeInTheDocument();
      expect(
        screen.getByText('We kunnen op dit moment geen facturen tonen.')
      ).toBeInTheDocument();
    });
  });
});
