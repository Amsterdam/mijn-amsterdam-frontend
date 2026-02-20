import { act, renderHook, waitFor } from '@testing-library/react';
import { useParams } from 'react-router';
import { describe, it, vi, expect, Mock } from 'vitest';

import { useEmandateApis } from './useAfisEmandateActionsApi';
import { useAfisEMandatesApi, forTesting } from './useAfisEmandatesApi';
import {
  EmandateStatusCode,
  type AfisEMandateFrontend,
} from '../../../../server/services/afis/afis-types';
import { bffApiHost } from '../../../../testing/setup';
import { bffApi } from '../../../../testing/utils';
import { useBffApiStateStore } from '../../../hooks/api/useBffApi';
import { useAppStateGetter } from '../../../hooks/useAppStateStore';

vi.mock('../../../hooks/useAppStateStore');
vi.mock('react-router', async (importActual) => {
  const actual = await importActual<typeof import('react-router')>();
  return {
    ...actual,
    useNavigate: vi.fn().mockReturnValue(() => vi.fn()),
    useLocation: vi.fn(),
    useParams: vi.fn(),
  };
});

describe('updateEmandateById', () => {
  it('should update the correct eMandate by ID', () => {
    const eMandates: AfisEMandateFrontend[] = [
      {
        id: '1',
        creditorName: 'Mandate 1',
        creditorIBAN: 'NL91ABNA0417164300',
        status: '1' as EmandateStatusCode,
        displayStatus: 'Active',
        senderIBAN: 'NL91ABNA0417164300',
        senderName: 'Sender Name',
        dateValidFrom: '2025-01-01',
        dateValidFromFormatted: '01-01-2025',
        dateValidTo: '2025-12-31',
        dateValidToFormatted: '31-12-2025',
        link: { to: '/details', title: 'Details' },
        eMandateIdSource: null,
      },
      {
        id: '2',
        creditorName: 'Mandate 2',
        creditorIBAN: 'NL91ABNA0417164300',
        status: '1' as EmandateStatusCode,
        displayStatus: 'Active',
        senderIBAN: 'NL91ABNA0417164300',
        senderName: 'Sender Name',
        dateValidFrom: '2025-01-01',
        dateValidFromFormatted: '01-01-2025',
        dateValidTo: '2025-12-31',
        dateValidToFormatted: '31-12-2025',
        link: { to: '/details', title: 'Details' },
        eMandateIdSource: null,
      },
    ];
    const updatedMandates = forTesting.updateEmandateById(
      '1',
      { creditorName: 'Updated Mandate 1' },
      eMandates
    );

    expect(updatedMandates).toEqual([
      {
        ...eMandates[0],
        creditorName: 'Updated Mandate 1',
      },
      eMandates[1],
    ]);
  });

  it('should return an empty array if eMandates is undefined', () => {
    const updatedMandates = forTesting.updateEmandateById(
      '1',
      { creditorName: 'Updated Mandate 1' },
      undefined
    );
    expect(updatedMandates).toEqual([]);
  });
});

describe('useAfisEMandatesData', () => {
  const eMandates = [
    {
      id: '1',
      creditorIBAN: 'NL91ABNA0417164300',
      creditorName: 'Mandate 1',
      displayStatus: 'Uit',
      link: { to: '/some/path/1', title: 'E-Mandate 1' },
    },
    {
      id: '2',
      creditorIBAN: 'NL789ABNA0417164300',
      creditorName: 'Mandate 2',
      displayStatus: 'Uit',
      link: { to: '/some/path/2', title: 'E-Mandate 2' },
    },
  ];

  beforeEach(() => {
    (useAppStateGetter as Mock).mockReturnValue({
      AFIS: {
        content: {
          businessPartnerIdEncrypted: 'encryptedId',
        },
      },
    });
  });

  it('should fetch eMandates', async () => {
    bffApi.get(/\/afis\/e-mandates/).reply(200, {
      content: eMandates,
    });

    (useParams as Mock).mockReturnValue({ id: undefined });

    const { result } = renderHook(() => useAfisEMandatesApi());

    expect(result.current.isLoadingEMandates).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoadingEMandates).toBe(false);
    });

    expect(result.current.eMandates).toStrictEqual([
      {
        ...eMandates[0],
        displayStatus: 'Uit',
        detailLinkComponent: expect.any(Object),
      },
      {
        ...eMandates[1],
        displayStatus: 'Uit',
        detailLinkComponent: expect.any(Object),
      },
    ]);
  });

  it('should return eMandate if id param is provided', async () => {
    bffApi.get(/\/afis\/e-mandates/).reply(200, {
      content: eMandates,
    });

    (useParams as Mock).mockReturnValue({ id: '1' });

    const { result } = renderHook(() => useAfisEMandatesApi());

    expect(result.current.isLoadingEMandates).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoadingEMandates).toBe(false);
    });

    expect(result.current.eMandate).toStrictEqual({
      ...eMandates[0],
      displayStatus: 'Uit',
      detailLinkComponent: expect.any(Object),
    });
  });

  it('should return error state when API fails', async () => {
    bffApi.get(/\/afis\/e-mandates/).reply(500);

    (useParams as Mock).mockReturnValue({ id: undefined });

    const { result } = renderHook(() => useAfisEMandatesApi());

    expect(result.current.isLoadingEMandates).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoadingEMandates).toBe(false);
    });

    expect(result.current.hasEMandatesError).toBe(true);
  });

  it('should remove pending status from local storage if eMandate is activated', async () => {
    sessionStorage.setItem(
      'afis-emandate-pending-activation',
      '"NL91ABNA0417164300"'
    );

    bffApi.get(/\/afis\/e-mandates/).reply(200, {
      content: [
        { ...eMandates[0], status: '1', displayStatus: 'Actief' },
        eMandates[1],
      ],
    });

    const { result } = renderHook(() => useAfisEMandatesApi());

    expect(result.current.isLoadingEMandates).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoadingEMandates).toBe(false);
    });

    expect(result.current.eMandates[0].displayStatus).toBe('Actief');
    expect(sessionStorage.getItem('afis-emandate-pending-activation')).toBe(
      '""'
    );
  });

  it('should handle optimistic updates', async () => {
    bffApi.get(/\/afis\/e-mandates/).reply(200, {
      content: eMandates,
    });

    const { result } = renderHook(() => useAfisEMandatesApi());

    await waitFor(() => {
      expect(result.current.isLoadingEMandates).toBe(false);
    });

    act(() => {
      result.current.optimisticUpdateContent('1', {
        creditorName: 'Updated Mandate 1',
      });
    });

    expect(result.current.eMandates[0].creditorName).toBe('Updated Mandate 1');
  });

  it('Should return the correct breadcrumbs', async () => {
    bffApi.get(/\/afis\/e-mandates/).reply(200, {
      content: eMandates,
    });

    (useParams as Mock).mockReturnValue({ id: '1' });

    const { result } = renderHook(() => useAfisEMandatesApi());

    expect(result.current.breadcrumbs).toEqual([
      { to: '/facturen-en-betalen', title: 'Facturen en betalen' },
      {
        to: '/facturen-en-betalen/betaalvoorkeuren',
        title: 'Betaalvoorkeuren',
      },
    ]);
  });
});

describe('useEmandateApis', () => {
  const eMandate: AfisEMandateFrontend = {
    id: '1',
    signRequestUrl: `${bffApiHost}/sign-request`,
    deactivateUrl: `${bffApiHost}/deactivate`,
    lifetimeUpdateUrl: `${bffApiHost}/lifetime-update`,
    creditorName: 'Creditor Name',
    creditorIBAN: 'NL91ABNA0417164300',
    status: '1' as EmandateStatusCode,
    displayStatus: 'Active',
    link: { to: '/details', title: 'Details' },
    senderIBAN: 'NL91ABNA0417164300',
    senderName: 'Sender Name',
    dateValidFrom: '2025-01-01',
    dateValidFromFormatted: '01-01-2025',
    dateValidTo: '2025-12-31',
    dateValidToFormatted: '31-12-2025',
    eMandateIdSource: null,
  };

  beforeEach(() => {
    (useAppStateGetter as Mock).mockReturnValue({
      AFIS: {
        content: {
          businessPartnerIdEncrypted: 'encryptedId',
        },
      },
    });
    bffApi.get(/\/afis\/e-mandates/).reply(200, {
      content: [eMandate],
    });
    (useParams as Mock).mockReturnValue({ id: undefined });
  });

  it('should call the correct API for redirectUrlApi', async () => {
    bffApi
      .get(/\/sign-request/)
      .reply(200, { content: { redirectUrl: 'http://example.com/redirect' } });

    const { result } = renderHook(() => useEmandateApis(eMandate));

    act(() => {
      result.current.redirectUrlApi.fetch();
    });

    await waitFor(() => {
      expect(window.location.href).toBe('http://example.com/redirect');
    });
    expect(result.current.lastActiveApi).toBe('redirectUrlApi');
  });

  it('should call the correct API for status change and update the emandate with the new status', async () => {
    bffApi.get(/\/deactivate/).reply(200, { content: { status: '0' } });

    const { result } = renderHook(() => ({
      store: useBffApiStateStore(),
      apis: useEmandateApis(eMandate),
    }));

    function getEMandatesStore() {
      return result.current.store.get<AfisEMandateFrontend[]>(
        'http://bff-api-host/services/afis/e-mandates?id=encryptedId'
      );
    }

    await waitFor(() => {
      expect(getEMandatesStore().isLoading).toBe(false);
    });

    act(() => {
      result.current.apis.deactivateApi.fetch();
    });
    expect(result.current.apis.deactivateApi.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.apis.deactivateApi.isLoading).toBe(false);
    });
    expect(result.current.apis.lastActiveApi).toBe('deactivateApi');
    expect(getEMandatesStore().data?.content?.[0].status).toBe('0');
  });

  it('should correctly update the lifetime of the eMandate', async () => {
    const newDateValidTo = '2026-12-31';
    bffApi
      .post(/\/lifetime-update/)
      .reply(200, { content: { dateValidTo: newDateValidTo } });

    const { result } = renderHook(() => ({
      store: useBffApiStateStore(),
      apis: useEmandateApis(eMandate),
    }));

    function getEMandatesStore() {
      return result.current.store.get<AfisEMandateFrontend[]>(
        'http://bff-api-host/services/afis/e-mandates?id=encryptedId'
      );
    }

    await waitFor(() => {
      expect(getEMandatesStore().isLoading).toBe(false);
    });

    act(() => {
      result.current.apis.lifetimeUpdateApi.update(newDateValidTo);
    });

    expect(result.current.apis.lifetimeUpdateApi.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.apis.lifetimeUpdateApi.isLoading).toBe(false);
    });

    expect(result.current.apis.lastActiveApi).toBe('lifetimeUpdateApi');
    expect(getEMandatesStore().data?.content?.[0].dateValidTo).toBe(
      newDateValidTo
    );
  });

  it('should handle errors correctly', async () => {
    bffApi.get('/deactivate').reply(500);

    const { result } = renderHook(() => useEmandateApis(eMandate));

    act(() => {
      result.current.deactivateApi.fetch();
    });

    await waitFor(() => {
      expect(result.current.isErrorVisible).toBe(true);
    });
    expect(result.current.lastActiveApi).toBe('deactivateApi');
  });

  it('should hide errors', () => {
    const { result } = renderHook(() => useEmandateApis(eMandate));

    act(() => {
      result.current.hideError();
    });

    expect(result.current.isErrorVisible).toBe(false);
  });
});
