import { render, waitFor } from '@testing-library/react';
import { generatePath } from 'react-router';
import { MutableSnapshot } from 'recoil';

import { routeConfig } from './Erfpacht-thema-config.ts';
import { ErfpachtListFacturen } from './ErfpachtListFacturen.tsx';
import ERFPACHT_DOSSIER_DETAIL from '../../../../../mocks/fixtures/erfpacht-v2-dossierinfo-bsn.json';
import ERFPACHT_DOSSIERS from '../../../../../mocks/fixtures/erfpacht-v2-dossiers.json';
import {
  transformDossierResponse,
  transformErfpachtDossierProperties,
} from '../../../../server/services/erfpacht/erfpacht.ts';
import { ErfpachtDossiersResponse } from '../../../../server/services/erfpacht/erfpacht-types.ts';
import { bffApi } from '../../../../testing/utils.ts';
import { AppState } from '../../../../universal/types/App.types.ts';
import { appStateAtom } from '../../../hooks/useAppState.ts';
import MockApp from '../../MockApp.tsx';

describe('<ErfpachtOpenFacturen />', () => {
  const routeEntry = generatePath(routeConfig.listPageAlleFacturen.path, {
    dossierNummerUrlParam: 'E.123.123',
    page: null,
  });
  const routePath = routeConfig.listPageAlleFacturen.path;
  const dossierDetailTransformed = transformErfpachtDossierProperties(
    ERFPACHT_DOSSIER_DETAIL
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
        component={ErfpachtListFacturen}
        initializeState={initializeState}
      />
    );
  }

  test('Renders Facturen List Page no data', async () => {
    bffApi
      .get('/services/erfpacht/dossier/E.123.123')
      .reply(200, { content: null, status: 'OK' });

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

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: 'Facturen' })
      ).toBeInTheDocument();
      expect(
        screen.getByText('U heeft (nog) geen gegevens op deze pagina.')
      ).toBeInTheDocument();
    });
  });

  test('Renders Facturen List Page with data', async () => {
    bffApi
      .get('/services/erfpacht/dossier/E.123.123')
      .reply(200, { content: dossierDetailTransformed, status: 'OK' });

    const testState = {
      ERFPACHT: {
        status: 'OK',
        content: transformDossierResponse(
          ERFPACHT_DOSSIERS as unknown as ErfpachtDossiersResponse,
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
      ERFPACHT: {
        status: 'ERROR',
        content: null,
      },
    } as AppState;

    bffApi
      .get('/services/erfpacht/dossier/E.123.123')
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
        screen.getByText('We kunnen op dit moment niet alle gegevens tonen.')
      ).toBeInTheDocument();
    });
  });
});
