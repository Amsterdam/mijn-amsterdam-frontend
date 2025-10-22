import { render, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { generatePath } from 'react-router';

import { routeConfig } from './Erfpacht-thema-config';
import { ErfpachtDetail } from './ErfpachtDetail';
import ERFPACHT_DOSSIER_DETAIL from '../../../../../mocks/fixtures/erfpacht-v2-dossierinfo-bsn.json';
import ERFPACHT_DOSSIERS from '../../../../../mocks/fixtures/erfpacht-v2-dossiers.json';
import {
  transformDossierResponse,
  transformErfpachtDossierProperties,
} from '../../../../server/services/erfpacht/erfpacht';
import { bffApi } from '../../../../testing/utils';
import { AppState } from '../../../../universal/types/App.types';
import MockApp from '../../MockApp';
import { EMANDATE_ENDDATE_INDICATOR } from '../Afis/Afis-thema-config';

function mockDetailFetch(
  content: unknown = transformErfpachtDossierProperties(
    ERFPACHT_DOSSIER_DETAIL as any
  ),
  status: 'OK' | 'ERROR' = 'OK'
) {
  bffApi.get('/services/erfpacht/dossier/E.123.123').reply(200, {
    content,
    status,
  });
}

describe('<Erfpacht/DossierDetail />', () => {
  const routeEntry = generatePath(routeConfig.detailPage.path, {
    dossierNummerUrlParam: 'E.123.123',
  });
  const routePath = routeConfig.detailPage.path;

  function Component({ state }: { state: Partial<AppState> }) {
    return (
      <MockApp
        routeEntry={routeEntry}
        routePath={routePath}
        component={ErfpachtDetail}
        state={state}
      />
    );
  }

  test('Renders Dossier Detailpage no data', async () => {
    mockDetailFetch(null);

    const testState = {
      ERFPACHT: {
        status: 'OK',
        content: null,
      },
    } as AppState;

    const screen = render(<Component state={testState} />);

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
    test('The Page', async () => {
      mockDetailFetch();
      const testState = {
        ERFPACHT: {
          status: 'OK',
          content: transformDossierResponse(ERFPACHT_DOSSIERS, '123-abc'),
        },
      } as AppState;
      const screen = render(<Component state={testState} />);
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
      await userEvent.click(screen.queryAllByText('Toon')[3]);
    });
    test('Financien', async () => {
      mockDetailFetch();
      const testState = {
        ERFPACHT: {
          status: 'OK',
          content: transformDossierResponse(ERFPACHT_DOSSIERS, '123-abc'),
        },
      } as AppState;
      const screen = render(<Component state={testState} />);
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
      mockDetailFetch();
      const testState = {
        ERFPACHT: {
          status: 'OK',
          content: transformDossierResponse(ERFPACHT_DOSSIERS, '123-abc'),
        },
      } as AppState;
      const screen = render(<Component state={testState} />);
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
    mockDetailFetch();

    const testState = {
      ERFPACHT: {
        status: 'OK',
        content: transformDossierResponse(
          ERFPACHT_DOSSIERS as any,
          EMANDATE_ENDDATE_INDICATOR
        ),
      },
    } as AppState;

    const screen = render(<Component state={testState} />);

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
    mockDetailFetch(null, 'ERROR');

    const screen = render(<Component state={testState} />);
    await waitFor(() => {
      expect(screen.getByText('Foutmelding')).toBeInTheDocument();
      expect(
        screen.getByText('We kunnen op dit moment geen gegevens tonen.')
      ).toBeInTheDocument();
    });
  });
});
