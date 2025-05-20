import { render, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { generatePath } from 'react-router';
import { MutableSnapshot } from 'recoil';

import { routeConfig } from './Erfpacht-thema-config';
import { ErfpachtDetail } from './ErfpachtDetail';
import ERFPACHT_DOSSIER_DETAIL from '../../../../../mocks/fixtures/erfpacht-v2-dossierinfo-bsn.json';
import ERFPACHT_DOSSIERS from '../../../../../mocks/fixtures/erfpacht-v2-dossiers.json';
import {
  transformDossierResponse,
  transformErfpachtDossierProperties,
} from '../../../../server/services/erfpacht/erfpacht';
import { bffApi } from '../../../../testing/utils';
import { jsonCopy } from '../../../../universal/helpers/utils';
import { AppState } from '../../../../universal/types/App.types';
import { appStateAtom } from '../../../hooks/useAppState';
import MockApp from '../../MockApp';

describe('<Erfpacht/DossierDetail />', () => {
  const routeEntry = generatePath(routeConfig.detailPage.path, {
    dossierNummerUrlParam: 'E.123.123',
  });
  const routePath = routeConfig.detailPage.path;

  const dossierDetailTransformed = transformErfpachtDossierProperties(
    ERFPACHT_DOSSIER_DETAIL as any
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
        component={ErfpachtDetail}
        initializeState={initializeState}
      />
    );
  }

  test('Renders Dossier Detailpage no data', async () => {
    bffApi
      .get('/services/erfpacht/dossier/E.123.123')
      .times(1)
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
        screen.getByRole('heading', { name: 'Erfpachtdossier' })
      ).toBeInTheDocument();
      expect(screen.getByText('Foutmelding')).toBeInTheDocument();
      expect(
        screen.getByText('We kunnen op dit moment geen gegevens tonen.')
      ).toBeInTheDocument();
    });
  });

  describe('Renders Dossier Detailpage with data', async () => {
    beforeEach(() => {
      bffApi
        .get('/services/erfpacht/dossier/E.123.123')
        .times(1)
        .reply(200, {
          content: jsonCopy(dossierDetailTransformed),
          status: 'OK',
        });
    });

    test('The Page', async () => {
      const testState = {
        ERFPACHT: {
          status: 'OK',
          content: transformDossierResponse(ERFPACHT_DOSSIERS, '123-abc'),
        },
      } as AppState;

      const screen = render(
        <Component
          initializeState={(snapshot) => {
            snapshot.set(appStateAtom, testState);
          }}
        />
      );

      const facturenPage1 = [
        { factuurNummer: 'A.123123123123' },
        { factuurNummer: 'B.123123123123' },
        { factuurNummer: 'C.123123123123' },
      ];

      const dataIsLoadedTarget = 'E123/456';
      await waitFor(() => screen.getByText(dataIsLoadedTarget));

      expect(
        screen.getByRole('heading', {
          name: 'E123/456: Dit en dat plein 22 H',
        })
      ).toBeInTheDocument();
      expect(screen.getByText('12132/345345/456757/ff')).toBeInTheDocument();
      expect(screen.getByText('H.J de Gruyter')).toBeInTheDocument();
      expect(screen.getByText('Persoon Wegan')).toBeInTheDocument();
      expect(screen.getByText('Juridisch')).toBeInTheDocument();
      expect(screen.getByText('Financieel')).toBeInTheDocument();
      expect(screen.getByText('Bijzondere Bepalingen')).toBeInTheDocument();

      expect(screen.queryByText('Foutmelding')).not.toBeInTheDocument();

      for (const factuur of facturenPage1) {
        expect(
          screen.queryByText(factuur.factuurNummer)
        ).not.toBeInTheDocument();
      }
      expect(screen.queryAllByText('Toon').length).toBe(3);

      userEvent.click(screen.queryAllByText('Toon')[3]);
    });

    test('Financien', async () => {
      const testState = {
        ERFPACHT: {
          status: 'OK',
          content: transformDossierResponse(ERFPACHT_DOSSIERS, '123-abc'),
        },
      } as AppState;

      const screen = render(
        <Component
          initializeState={(snapshot) => {
            snapshot.set(appStateAtom, testState);
          }}
        />
      );

      const dataIsLoadedTarget = 'E123/456';
      await waitFor(() => screen.getByText(dataIsLoadedTarget));

      const container = screen.getByRole('heading', {
        name: 'Financieel',
      }).parentElement!;

      const displayMoreBtns = within(container).queryAllByRole('button', {
        name: 'Toon',
      });
      expect(displayMoreBtns.length).toBe(1);

      await userEvent.click(displayMoreBtns[0]);

      expect(screen.getByText('Huidige periode:')).toBeInTheDocument();
      expect(screen.getByText('24-06-2022 t/m 31-12-2046')).toBeInTheDocument();
      const descriptiveAmount = '€ 108,90 na indexering 2001';
      expect(screen.getByText(descriptiveAmount)).toBeInTheDocument();
      expect(
        screen.getByText('€ 117,17 na indexering 2006')
      ).toBeInTheDocument();
      expect(
        screen.queryByText('€ 120,57 na indexering 2011')
      ).not.toBeInTheDocument();

      expect(screen.getByText('Afgekocht')).toBeInTheDocument();
      expect(screen.getByText('AB1994')).toBeInTheDocument();

      const hideBtns = within(container).queryAllByRole('button', {
        name: 'Verberg',
      });
      expect(hideBtns.length).toBe(1);
      await userEvent.click(hideBtns[0]);

      expect(
        within(container).queryByText(descriptiveAmount)
      ).not.toBeInTheDocument();
    });

    test('Bijzonder bepalingen', async () => {
      const testState = {
        ERFPACHT: {
          status: 'OK',
          content: transformDossierResponse(ERFPACHT_DOSSIERS, '123-abc'),
        },
      } as AppState;

      const screen = render(
        <Component
          initializeState={(snapshot) => {
            snapshot.set(appStateAtom, testState);
          }}
        />
      );

      const dataIsLoadedTarget = 'E123/456';
      await waitFor(() => screen.getByText(dataIsLoadedTarget));

      const container = screen.getByRole('heading', {
        name: 'Bijzondere Bepalingen',
      }).parentElement!;
      const collapsiblePanel = within(container);

      const displayMoreBtns = collapsiblePanel.queryAllByRole('button', {
        name: 'Toon',
      });
      expect(displayMoreBtns.length).toBe(1);

      await userEvent.click(displayMoreBtns[0]);

      expect(collapsiblePanel.queryAllByText('Verberg').length).toBe(1);

      expect(
        screen.getByText('Bruto vloeroppervlak: 75 m2')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Bruto vloeroppervlak: 35 m2')
      ).toBeInTheDocument();

      await userEvent.click(collapsiblePanel.queryAllByText('Toon')[0]);

      expect(collapsiblePanel.queryAllByText('Toon').length).toBe(0);
      expect(collapsiblePanel.queryAllByText('Verberg').length).toBe(1);
    });
  });

  test('Renders Dossier Detailpage with betaler aanpassen link', async () => {
    bffApi
      .get('/services/erfpacht/dossier/E.123.123')
      .times(1)
      .reply(200, {
        content: jsonCopy(dossierDetailTransformed),
        status: 'OK',
      });

    const testState = {
      ERFPACHT: {
        status: 'OK',
        content: transformDossierResponse(ERFPACHT_DOSSIERS as any, '999999'),
      },
    } as AppState;

    const screen = render(
      <Component
        initializeState={(snapshot) => {
          snapshot.set(appStateAtom, testState);
        }}
      />
    );

    await waitFor(() =>
      expect(screen.getByText('Betaler aanpassen')).toBeInTheDocument()
    );
  });

  test('Renders Dossier Detailpage with error', async () => {
    const testState = {
      ERFPACHT: {
        status: 'ERROR',
        content: null,
      },
    } as AppState;

    //http://bff-api-host/services/erfpacht/dossier/E.123.123
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
        screen.getByText('We kunnen op dit moment geen gegevens tonen.')
      ).toBeInTheDocument();
    });
  });
});
