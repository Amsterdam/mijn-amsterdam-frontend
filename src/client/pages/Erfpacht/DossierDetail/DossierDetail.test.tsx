import { act, render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { generatePath } from 'react-router-dom';
import { MutableSnapshot } from 'recoil';
import ERFPACHTv2_DOSSIER_DETAIL from '../../../../server/mock-data/json/erfpacht-v2-dossierinfo-bsn.json';
import ERFPACHTv2_DOSSIERS from '../../../../server/mock-data/json/erfpacht-v2-dossiers.json';
import {
  transformDossierResponse,
  transformErfpachtDossierProperties,
} from '../../../../server/services/simple-connect/erfpacht';
import { bffApi } from '../../../../test-utils';
import { AppRoutes } from '../../../../universal/config';
import { AppState } from '../../../AppState';
import { appStateAtom } from '../../../hooks/useAppState';
import MockApp from '../../MockApp';
import ErfpachtDossierDetail from './ErfpachtDossierDetail';

describe('<Erfpacht/DossierDetail />', () => {
  const routeEntry = generatePath(AppRoutes['ERFPACHTv2/DOSSIERDETAIL'], {
    dossierNummerUrlParam: 'E.123.123',
  });
  const routePath = AppRoutes['ERFPACHTv2/DOSSIERDETAIL'];

  const dossierDetailTransformed = transformErfpachtDossierProperties(
    ERFPACHTv2_DOSSIER_DETAIL as any
  );

  const Component = ({
    initializeState,
  }: {
    initializeState: (snapshot: MutableSnapshot) => void;
  }) => (
    <MockApp
      routeEntry={routeEntry}
      routePath={routePath}
      component={ErfpachtDossierDetail}
      initializeState={initializeState}
    />
  );

  test('Renders Dossier Detailpage no data', async () => {
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
      expect(screen.getByText('Erfpacht V2dossier')).toBeInTheDocument();
      expect(screen.getByText('Foutmelding')).toBeInTheDocument();
      expect(
        screen.getByText('We kunnen op dit moment geen erfpacht dossier tonen.')
      ).toBeInTheDocument();
    });
  });

  test('Renders Dossier Detailpage with data', async () => {
    bffApi
      .get('/services/erfpachtv2/dossier/E.123.123')
      .reply(200, { content: dossierDetailTransformed, status: 'OK' });

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

    const facturenPage1 = [
      { factuurNummer: 'A.123123123123' },
      { factuurNummer: 'B.123123123123' },
      { factuurNummer: 'C.123123123123' },
    ];

    await waitFor(() => {
      expect(
        screen.getByText('E123/456: Dit en dat plein 22 H')
      ).toBeInTheDocument();
      expect(screen.getByText('12132/345345/456757/ff')).toBeInTheDocument();
      expect(screen.getByText('H.J de Gruyter')).toBeInTheDocument();
      expect(screen.getByText('Persoon Wegan')).toBeInTheDocument();
      expect(screen.getByText('Juridisch')).toBeInTheDocument();
      expect(screen.getByText('Financieel')).toBeInTheDocument();
      expect(screen.getByText('Facturen')).toBeInTheDocument();
      expect(screen.getByText('Bijzondere Bepalingen')).toBeInTheDocument();

      expect(screen.queryByText('Foutmelding')).not.toBeInTheDocument();

      for (const factuur of facturenPage1) {
        expect(
          screen.queryByText(factuur.factuurNummer)
        ).not.toBeInTheDocument();
      }
      expect(screen.queryAllByText('Toon').length).toBe(4);
    });

    // Facturen
    act(() => {
      userEvent.click(screen.queryAllByText('Toon')[3]);
    });

    await waitFor(() => {
      expect(screen.queryByText('Verberg')).toBeInTheDocument();
      expect(screen.queryAllByText('Toon').length).toBe(3);
      expect(screen.getByText('DEBITEUR 186698')).toBeInTheDocument();
      expect(screen.getByText('Betaler aanpassen')).toBeInTheDocument();
      expect(screen.getByText('Toon meer')).toBeInTheDocument();

      for (const factuur of facturenPage1) {
        expect(screen.getByText(factuur.factuurNummer)).toBeInTheDocument();
      }
    });

    // Financieel
    act(() => {
      userEvent.click(screen.queryAllByText('Toon')[2]);
    });

    await waitFor(() => {
      expect(screen.queryAllByText('Toon').length).toBe(2);
      expect(screen.queryAllByText('Verberg').length).toBe(2);

      expect(
        screen.getByText('Huidige periode 24 juni 2022 t/m 31 december 2046')
      ).toBeInTheDocument();
      expect(
        screen.getByText('€ 128,27 na indexering 2022')
      ).toBeInTheDocument();
      expect(screen.getByText('Afgekocht')).toBeInTheDocument();
      expect(screen.getByText('AB1994')).toBeInTheDocument();
    });

    // Bijzondere bepalingen
    act(() => {
      userEvent.click(screen.queryAllByText('Toon')[1]);
    });

    await waitFor(() => {
      expect(screen.queryAllByText('Toon').length).toBe(1);
      expect(screen.queryAllByText('Verberg').length).toBe(3);

      expect(
        screen.getByText('Bruto vloeroppervlak: 75 m2')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Bruto vloeroppervlak: 35 m2')
      ).toBeInTheDocument();
    });

    // Juridisch
    act(() => {
      userEvent.click(screen.queryAllByText('Toon')[0]);
    });

    await waitFor(() => {
      expect(screen.queryAllByText('Toon').length).toBe(0);
      expect(screen.queryAllByText('Verberg').length).toBe(4);

      expect(screen.getByText('Eeuwigdurend')).toBeInTheDocument();
      expect(screen.getByText('AB2016')).toBeInTheDocument();
    });
  });

  test('Renders Dossier Detailpage with error', async () => {
    const testState = {
      ERFPACHTv2: {
        status: 'ERROR',
        content: null,
      },
    } as AppState;

    //http://bff-api-host/services/erfpachtv2/dossier/E.123.123
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
        screen.getByText('We kunnen op dit moment geen erfpacht dossier tonen.')
      ).toBeInTheDocument();
    });
  });
});
