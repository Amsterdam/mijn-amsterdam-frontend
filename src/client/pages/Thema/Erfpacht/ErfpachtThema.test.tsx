import { render } from '@testing-library/react';
import { generatePath } from 'react-router';
import { MutableSnapshot } from 'recoil';

import { routeConfig } from './Erfpacht-thema-config';
import { ErfpachtThema } from './ErfpachtThema';
import ERFPACHT_DOSSIERS from '../../../../../mocks/fixtures/erfpacht-v2-dossiers.json';
import { transformDossierResponse } from '../../../../server/services/erfpacht/erfpacht';
import { AppState } from '../../../../universal/types/App.types';
import { appStateAtom } from '../../../hooks/useAppState';
import MockApp from '../../MockApp';

// I have left the test data regarding invoices in it, as it will come back again MIJN-11703 but in a future stoty it will come back

describe('<Erfpacht />', () => {
  const routeEntry = generatePath(routeConfig.themaPage.path);
  const routePath = routeConfig.themaPage.path;

  function Component({
    initializeState,
  }: {
    initializeState: (snapshot: MutableSnapshot) => void;
  }) {
    return (
      <MockApp
        routeEntry={routeEntry}
        routePath={routePath}
        component={ErfpachtThema}
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
      AFIS: {
        status: 'OK',
        content: {
          isKnown: true,
          businessPartnerIdEncrypted: 'bpIDEncrypted-555',
          facturen: {
            open: {
              count: 0,
              facturen: [],
            },
            afgehandeld: {
              count: 0,
              facturen: [],
            },
            overgedragen: { count: 0, facturen: [] },
          },
        },
      },
    } as unknown as AppState;

    const screen = render(
      <Component
        initializeState={(snapshot) => {
          snapshot.set(appStateAtom, testState);
        }}
      />
    );

    expect(
      screen.getByText(/Hieronder ziet u de gegevens van uw erfpachtrechten/i)
    ).toBeInTheDocument();
    expect(screen.getByText('Erfpachtrechten')).toBeInTheDocument();
    expect(
      screen.getByText('U heeft (nog) geen erfpachtrechten')
    ).toBeInTheDocument();
  });

  test('Renders Overviewpage with error', () => {
    const testState = {
      ERFPACHT: {
        status: 'ERROR',
        content: null,
      },
      AFIS: {
        status: 'OK',
        content: {
          isKnown: true,
          businessPartnerIdEncrypted: 'bpIDEncrypted-555',
          facturen: {
            open: {
              count: 0,
              facturen: [],
            },
            afgehandeld: {
              count: 0,
              facturen: [],
            },
            overgedragen: { count: 0, facturen: [] },
          },
        },
      },
    } as unknown as AppState;

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
      screen.getByText(/Hieronder ziet u de gegevens van uw erfpachtrechten/i)
    ).toBeInTheDocument();
    expect(screen.queryByText('Erfpachtrechten')).not.toBeInTheDocument();
    expect(
      screen.queryByText('U heeft geen erfpachtrechten.')
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText('U heeft geen openstaande facturen.')
    ).not.toBeInTheDocument();
  });

  test('Renders Overviewpage with data', () => {
    const testState = {
      ERFPACHT: {
        status: 'OK',
        content: transformDossierResponse(ERFPACHT_DOSSIERS, '123-abc'),
      },
      AFIS: {
        status: 'OK',
        content: {
          isKnown: true,
          businessPartnerIdEncrypted: 'bpIDEncrypted-555',
          facturen: {
            open: {
              count: 1,
              facturen: [
                {
                  id: '1',
                  afzender: 'GO Erfpacht en Uitgi',
                  datePublished: '2023-01-15',
                  datePublishedFormatted: '15 januari 2023',
                  paymentDueDate: '2023-02-15',
                  paymentDueDateFormatted: '15 februari 2023',
                  debtClearingDate: null,
                  debtClearingDateFormatted: null,
                  amountOriginal: '1000.00',
                  amountOriginalFormatted: '€ 1.000,00',
                  factuurNummer: 'F001',
                  status: 'openstaand',
                  statusDescription: 'openstaand',
                  paylink: 'https://payment.example.com/F001',
                  documentDownloadLink: 'https://download.example.com/F001',
                },
              ],
            },
          },
        },
      },
    } as unknown as AppState;

    const screen = render(
      <Component
        initializeState={(snapshot) => {
          snapshot.set(appStateAtom, testState);
        }}
      />
    );

    expect(
      screen.getByText(/Hieronder ziet u de gegevens van uw erfpachtrechten/i)
    ).toBeInTheDocument();
    expect(screen.getByText('Erfpachtrechten')).toBeInTheDocument();
    expect(
      screen.queryByText('U heeft geen erfpachtrechten.')
    ).not.toBeInTheDocument();

    expect(screen.getByText('E477/48')).toBeInTheDocument();
    expect(screen.getByText('E7418/35')).toBeInTheDocument();
    expect(screen.getByText('E900/33')).toBeInTheDocument();
    expect(screen.getByText('E123/456')).toBeInTheDocument();
    expect(screen.getByText('E6470/243')).toBeInTheDocument();
  });
});
