import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { vi, describe, it, beforeEach, expect, type Mock } from 'vitest';

import { eMandateTableConfig } from './Afis-thema-config.ts';
import { AfisEMandateDetail } from './AfisEMandateDetail.tsx';
import { useEmandateApis } from './useAfisEmandateActionsApi.tsx';
import { useAfisEMandatesApi } from './useAfisEmandatesApi.tsx';
import {
  useSignRequestPayloadStorage,
  useSignRequestStatusCheck,
} from './useAfisEMandatesSignRequest.tsx';
import type {
  AfisEMandateFrontend,
  AfisFacturenOverviewResponse,
} from '../../../../server/services/afis/afis-types.ts';
import { useWidescreen } from '../../../hooks/media.hook.ts';
import { MockApp } from '../../MockApp.tsx';

vi.mock('./AfisEmandateActionButtons.tsx', () => ({
  AfisEMandateActionButtons: () => <div>ActionButtons</div>,
}));
vi.mock('./AfisEmandateFetchInterval.tsx', () => ({
  AfisEmandateRefetchInterval: () => <div>AfisEmandateRefetchInterval</div>,
}));

vi.mock('../../../hooks/useHTMLDocumentTitle.ts', () => ({
  useHTMLDocumentTitle: () => undefined,
}));

vi.mock('./useAfisEMandatesSignRequest.tsx');
vi.mock('./useAfisEmandateActionsApi.tsx');
vi.mock('./useAfisEmandatesApi.tsx');
vi.mock('../../../hooks/media.hook.ts');

const mockCancel = vi.fn();

describe('AfisEMandateDetail', () => {
  function Detail() {
    return (
      <MockApp
        routeEntry="/"
        routePath="/"
        component={() => <AfisEMandateDetail />}
        state={{
          AFIS: {
            status: 'OK',
            content: {
              isKnown: true,
              businessPartnerIdEncrypted: 'xxx',
              facturen: {} as AfisFacturenOverviewResponse,
            },
          },
        }}
      />
    );
  }

  beforeEach(() => {
    mockCancel.mockReset();
    vi.clearAllMocks();
  });

  it('shows spinner paragraph while requesting status check', async () => {
    (useSignRequestPayloadStorage as Mock).mockReturnValue({
      hasPayloads: () => true,
    });

    (useEmandateApis as Mock).mockReturnValue({
      lifetimeUpdateApi: {
        fetch: vi.fn(),
      },
    });

    (useSignRequestStatusCheck as Mock).mockReturnValue({
      isRequestingStatusCheck: true,
      isPendingActivation: false,
      isTakingLong: false,
      cancel: mockCancel,
    });

    render(<Detail />);

    expect(
      screen.getByText(
        /Mijn Amsterdam controleert de status van het E-Mandaat/i
      )
    ).toBeInTheDocument();
  });

  it('shows pending activation alert and calls cancel when retry clicked', async () => {
    (useSignRequestPayloadStorage as Mock).mockReturnValue({
      hasPayloads: () => true,
    });

    (useEmandateApis as Mock).mockReturnValue({
      lifetimeUpdateApi: {
        fetch: vi.fn(),
      },
    });

    (useSignRequestStatusCheck as Mock).mockReturnValue({
      isRequestingStatusCheck: false,
      isPendingActivation: true,
      isTakingLong: true,
      cancel: mockCancel,
    });

    render(<Detail />);

    expect(
      screen.getByText(/Wachten op bevestiging van het E-Mandaat/i)
    ).toBeInTheDocument();

    const retryButton = screen.getByRole('button', {
      name: /Probeer het opnieuw/i,
    });
    await userEvent.click(retryButton);

    expect(mockCancel).toHaveBeenCalled();
  });

  it('renders action buttons when not pending and not requesting', () => {
    (useSignRequestPayloadStorage as Mock).mockReturnValue({
      hasPayloads: () => false,
    });

    (useEmandateApis as Mock).mockReturnValue({
      lifetimeUpdateApi: {
        fetch: vi.fn(),
      },
    });

    (useSignRequestStatusCheck as Mock).mockReturnValue({
      isRequestingStatusCheck: false,
      isPendingActivation: false,
      isTakingLong: false,
      cancel: mockCancel,
    });

    render(<Detail />);

    expect(screen.getByText('ActionButtons')).toBeInTheDocument();
  });

  describe('shows E-Mandaat history when history items present', () => {
    const historyItem: AfisEMandateFrontend['history'][number] = {
      // id: '1',
      eMandateIdSource: '00001',
      status: '0',
      senderName: 'Jan Jansen',
      senderIBAN: 'NL00BANK0123456789',
      dateValidFromFormatted: '1 januari 2024',
      dateValidToFormatted: '31 december 2024',
      dateValidFrom: '2024-01-01',
      dateValidTo: '2024-12-31',
    };

    (useSignRequestPayloadStorage as Mock).mockReturnValue({
      hasPayloads: () => false,
    });

    (useEmandateApis as Mock).mockReturnValue({
      lifetimeUpdateApi: {
        fetch: vi.fn(),
      },
    });

    (useSignRequestStatusCheck as Mock).mockReturnValue({
      isRequestingStatusCheck: false,
      isPendingActivation: false,
      isTakingLong: false,
      cancel: mockCancel,
    });

    (useAfisEMandatesApi as Mock).mockReturnValue({
      title: 'E-Mandaat Stad',
      themaId: 'AFIS',
      eMandates: [],
      eMandateTableConfig,
      eMandate: {
        status: '1',
        id: 'em1',
        eMandateIdSource: '00002',
        history: [historyItem],
        creditorName: 'Stad',
        displayStatus: 'Actief',
        detailLinkComponent: <>Klik hier</>,
        displayStatusEl: <>Actief!</>,
        creditorIBAN: 'NL00BANK0123456789',
        businessPartnerId: '',
        senderIBAN: 'NL22BANK9876543210',
        senderName: 'Piet Pietersen',
        dateValidFrom: '2024-02-01',
        dateValidFromFormatted: '1 februari 2024',
        dateValidTo: '2025-01-31',
        dateValidToFormatted: '31 januari 2025',
        link: {
          to: '/thema/afis/emandate/em1',
          title: 'Bekijk E-Mandaat',
        },
      },
      breadcrumbs: [],
      hasEMandatesError: false,
      isLoadingEMandates: false,
      fetchEMandates: () => undefined,
      optimisticUpdateContent: () => undefined,
    });

    test('Small screen display', () => {
      (useWidescreen as Mock).mockReturnValue(false);

      const screen = render(<Detail />);
      expect(
        screen.baseElement.querySelector('#eerdere-emandaten')?.nextSibling
      ).toMatchSnapshot();
    });

    test('Wide screen display', () => {
      (useWidescreen as Mock).mockReturnValue(true);

      const screen = render(<Detail />);
      const headingEl = screen.getByRole('heading', {
        name: /Eerdere E-Mandaten/i,
      });
      expect(headingEl?.nextSibling).toMatchSnapshot();
    });
  });
});
