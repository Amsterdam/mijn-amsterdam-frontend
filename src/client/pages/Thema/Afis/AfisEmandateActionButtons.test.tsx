import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { vi, describe, it, expect } from 'vitest';

import {
  AfisEMandateActionButtons,
  type AfisEMandateActionButtonsProps,
} from './AfisEmandateActionButtons.tsx';
import type {
  AfisEMandateFrontend,
  AfisFacturenOverviewResponse,
} from '../../../../server/services/afis/afis-types.ts';
import MockApp from '../../MockApp.tsx';

describe('AfisEMandateActionButtons', () => {
  it('renders Activeren when signRequestUrl present and eMandate inactive', () => {
    const eMandate = {
      signRequestUrl: 'https://example.com',
      status: '0',
      eMandateIdSource: '1',
    } as AfisEMandateFrontend;

    const redirectUrlApi = {
      isLoading: false,
      requestRedirectUrl: vi.fn(),
    } as unknown as AfisEMandateActionButtonsProps['redirectUrlApi'];

    const deactivateApi = {
      isLoading: false,
    } as AfisEMandateActionButtonsProps['deactivateApi'];

    render(
      <AfisEMandateActionButtons
        eMandate={eMandate}
        redirectUrlApi={redirectUrlApi}
        deactivateApi={deactivateApi}
      />
    );

    expect(
      screen.getByRole('button', { name: /Activeren/i })
    ).toBeInTheDocument();
  });

  it('renders Rekening wijzigen when signRequestUrl present and eMandate active', () => {
    const eMandate = {
      signRequestUrl: 'https://example.com',
      status: '1',
      eMandateIdSource: '1',
    } as AfisEMandateFrontend;

    const redirectUrlApi = {
      isLoading: false,
      requestRedirectUrl: vi.fn(),
    } as unknown as AfisEMandateActionButtonsProps['redirectUrlApi'];

    const deactivateApi = {
      isLoading: false,
    } as AfisEMandateActionButtonsProps['deactivateApi'];

    render(
      <AfisEMandateActionButtons
        eMandate={eMandate}
        redirectUrlApi={redirectUrlApi}
        deactivateApi={deactivateApi}
      />
    );

    expect(
      screen.getByRole('button', { name: /Rekening wijzigen/i })
    ).toBeInTheDocument();
  });

  it('shows confirmation modal and calls deactivate when confirming stopzetten', async () => {
    const user = userEvent.setup();

    const eMandate = {
      signRequestUrl: null,
      deactivateUrl: 'https://example.com/deactivate',
      status: '1',
      eMandateIdSource: 'em1',
    } as unknown as AfisEMandateFrontend;

    const deactivateApi = {
      isLoading: false,
      fetch: vi.fn(),
    } as unknown as AfisEMandateActionButtonsProps['deactivateApi'];

    const redirectUrlApi = {
      isLoading: false,
    } as AfisEMandateActionButtonsProps['redirectUrlApi'];

    render(
      <MockApp
        routeEntry="/"
        routePath="/"
        component={() => (
          <AfisEMandateActionButtons
            eMandate={eMandate}
            redirectUrlApi={redirectUrlApi}
            deactivateApi={deactivateApi}
          />
        )}
        state={{
          AFIS: {
            status: 'OK',
            content: {
              isKnown: true,
              businessPartnerIdEncrypted: 'xxx',
              facturen: {
                open: {
                  count: 1,
                  state: 'open',
                  facturen: [
                    {
                      id: 'f1',
                      eMandateId: 'em1',
                      factuurNummer: 'FN-123',
                      amountOriginalFormatted: '€ 10,00',
                      paymentDueDateFormatted: '2024-01-01',
                      link: {
                        to: '/facturen/f1',
                      },
                    },
                  ],
                },
              } as AfisFacturenOverviewResponse,
            },
          },
        }}
      />
    );

    const stopBtn = screen.getByRole('button', { name: /Stopzetten/i });
    await user.click(stopBtn);

    // Confirmation modal should show and include the factuur number
    expect(screen.getByText(/FN-123/)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Let op' })).toBeInTheDocument();

    const confirmBtn = screen.getByRole('button', { name: /Ja, stopzetten/i });
    await user.click(confirmBtn);

    expect(deactivateApi.fetch).toHaveBeenCalled();
  });
});
