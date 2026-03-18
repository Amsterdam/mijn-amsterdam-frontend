import { act, renderHook } from '@testing-library/react';
import mockdate from 'mockdate';

import {
  useSignRequestPayloadStorage,
  useSignRequestPayloadStorageCleanup,
  useSignRequestStatusCheck,
} from './useAfisEMandatesSignRequest';
import type {
  AfisEMandateFrontend,
  POMSignRequestStatus,
} from '../../../../server/services/afis/afis-types';
import { bffApiHost } from '../../../../testing/setup';

function clearLocalStorage() {
  window.localStorage.removeItem('afis-emandate-status-check-payload');
}

describe('useAfisEMandatesSignRequest', () => {
  describe('useSignRequestPayloadStorage', () => {
    beforeAll(() => {
      clearLocalStorage();
      mockdate.set(new Date('2024-06-15'));
    });
    afterEach(() => {
      clearLocalStorage();
    });

    it('should add, get and remove payloads correctly', () => {
      const { result } = renderHook(() => useSignRequestPayloadStorage());

      // Initially, there should be no payloads
      expect(result.current.payloads).toEqual([]);
      expect(result.current.hasPayloads()).toBe(false);

      // Add a payload
      act(() => {
        result.current.add('eMandate1', '15000001', 'payload1');
      });
      expect(result.current.payloads.length).toBe(1);
      expect(result.current.get('eMandate1')?.getPayload()).toBe('payload1');
      expect(result.current.hasPayloads()).toBe(true);

      // Remove the payload
      act(() => {
        result.current.get('eMandate1')?.remove();
      });
      expect(result.current.payloads).toEqual([]);
      expect(result.current.hasPayloads()).toBe(false);
    });

    it('should correctly identify when a status check is taking long', () => {
      const { result } = renderHook(() => useSignRequestPayloadStorage());

      // Add a payload with an activation date in the past
      const pastDate = new Date(Date.now() - 11 * 60 * 1000).toISOString(); // 11 minutes ago
      act(() => {
        result.current.add('eMandate2', '15000002', 'payload2');
      });

      // Manually set the activation date to the past
      result.current.payloads[0].activationDate = pastDate;

      expect(result.current.get('eMandate2')?.isTakingLong()).toBe(true);

      // Update the activation date to now
      const nowDate = new Date().toISOString();
      act(() => {
        result.current.payloads[0].activationDate = nowDate;
      });

      expect(result.current.get('eMandate2')?.isTakingLong()).toBe(false);
    });

    it('should return false for isTakingLong if there is no activation date', () => {
      const { result } = renderHook(() => useSignRequestPayloadStorage());

      // Add a payload without an activation date
      act(() => {
        result.current.add('eMandate3', '15000003', 'payload3');
      });

      // Manually remove the activation date
      result.current.payloads[0].activationDate = '';

      expect(result.current.get('eMandate3')?.isTakingLong()).toBe(false);
    });

    it('should return false for isTakingLong if eMandateId does not exist', () => {
      const { result } = renderHook(() => useSignRequestPayloadStorage());

      expect(result.current.get('nonExistentId')?.isTakingLong()).toBe(
        undefined
      );
    });

    it('should return null for getPayload if eMandateId does not exist', () => {
      const { result } = renderHook(() => useSignRequestPayloadStorage());

      expect(result.current.get('nonExistentId')?.getPayload()).toBeUndefined();
    });

    it('should return null for getPayload if payloads are empty', () => {
      const { result } = renderHook(() => useSignRequestPayloadStorage());

      expect(result.current.get('anyId')?.getPayload()).toBeUndefined();
    });

    it('should handle multiple payloads correctly', () => {
      const { result } = renderHook(() => useSignRequestPayloadStorage());

      // Add multiple payloads
      act(() => {
        result.current.add('eMandate4', '15000004', 'payload4');
      });
      act(() => {
        result.current.add('eMandate5', '15000005', 'payload5');
      });

      expect(result.current.payloads.length).toBe(2);
      expect(result.current.get('eMandate4')?.getPayload()).toBe('payload4');
      expect(result.current.get('eMandate5')?.getPayload()).toBe('payload5');

      // Remove one payload and check the other still exists
      act(() => {
        result.current.get('eMandate4')?.remove();
      });

      expect(result.current.payloads.length).toBe(1);
      expect(result.current.get('eMandate4')?.getPayload()).toBeUndefined();
      expect(result.current.get('eMandate5')?.getPayload()).toBe('payload5');
    });

    it('should correctly identify pending status checks', () => {
      const { result } = renderHook(() => useSignRequestPayloadStorage());

      expect(result.current.hasPayloads()).toBe(false);

      act(() => {
        result.current.add('eMandate6', '15000006', 'payload6');
      });

      expect(result.current.hasPayloads()).toBe(true);

      act(() => {
        result.current.get('eMandate6')?.remove();
      });

      expect(result.current.hasPayloads()).toBe(false);
    });

    it('should correctly identify when a status check is taking long for multiple payloads', () => {
      const { result } = renderHook(() => useSignRequestPayloadStorage());

      // Add multiple payloads with different activation dates
      const pastDate = new Date(Date.now() - 11 * 60 * 1000).toISOString(); // 11 minutes ago
      const nowDate = new Date().toISOString();

      act(() => {
        result.current.add('eMandate7', '15000007', 'payload7');
      });
      act(() => {
        result.current.add('eMandate8', '15000008', 'payload8');
      });

      // Manually set activation dates
      result.current.payloads[0].activationDate = pastDate; // eMandate7
      result.current.payloads[1].activationDate = nowDate; // eMandate8

      expect(result.current.get('eMandate7')?.isTakingLong()).toBe(true);
      expect(result.current.get('eMandate8')?.isTakingLong()).toBe(false);
    });
  });

  describe('useSignRequestPayloadStorageCleanup', () => {
    const eMandate = {
      id: 'eMandate1',
      eMandateIdSource: '15000001',
      signRequestStatusUrl: `${bffApiHost}/status-check`,
      status: '0',
    } as unknown as AfisEMandateFrontend;

    it('should cleanup payload if hook is rendered with New EMandate status is ACTIVE', async () => {
      window.localStorage.setItem(
        'afis-emandate-status-check-payload',
        JSON.stringify([
          {
            eMandateId: eMandate.id,
            eMandateIdSource: '15000001',
            payload: 'payload',
            activationDate: new Date().toISOString(),
          },
        ])
      );
      const payloads = localStorage.getItem(
        'afis-emandate-status-check-payload'
      );
      expect(payloads).not.toBeNull();
      expect(payloads).not.toBe('[]');

      renderHook(() =>
        useSignRequestPayloadStorageCleanup([{ ...eMandate, status: '1' }])
      );

      expect(localStorage.getItem('afis-emandate-status-check-payload')).toBe(
        '[]'
      );
    });

    it('should NOT cleanup payload if EMandate is not a replacement and Status is not ACTIVE', async () => {
      window.localStorage.setItem(
        'afis-emandate-status-check-payload',
        JSON.stringify([
          {
            eMandateId: eMandate.id,
            eMandateIdSource: '15000001',
            payload: 'payload',
            activationDate: new Date().toISOString(),
          },
        ])
      );
      const payloads = localStorage.getItem(
        'afis-emandate-status-check-payload'
      );
      expect(payloads).not.toBeNull();
      expect(payloads).not.toBe('[]');

      renderHook(() => useSignRequestPayloadStorageCleanup([eMandate]));

      expect(localStorage.getItem('afis-emandate-status-check-payload')).toBe(
        '[{"eMandateId":"eMandate1","eMandateIdSource":"15000001","payload":"payload","activationDate":"2024-06-15T00:00:00.000Z"}]'
      );
    });

    it('should cleanup payload if the Emandate has been replaced', async () => {
      window.localStorage.setItem(
        'afis-emandate-status-check-payload',
        JSON.stringify([
          {
            eMandateId: eMandate.id,
            eMandateIdSource: '15000001',
            payload: 'payload',
            activationDate: new Date().toISOString(),
            isReplacement: 'true',
          },
        ])
      );
      const payloads = localStorage.getItem(
        'afis-emandate-status-check-payload'
      );
      expect(payloads).not.toBeNull();
      expect(payloads).not.toBe('[]');

      renderHook(() =>
        useSignRequestPayloadStorageCleanup([{ ...eMandate, status: '1' }])
      );

      expect(localStorage.getItem('afis-emandate-status-check-payload')).toBe(
        '[]'
      );
    });
  });

  describe('useSignRequestStatusCheck', () => {
    // Tests for the useAfisEMandatesSignRequest hook would go here, but since it's not fully implemented in the provided code snippet, we will focus on the useSignRequestPayloadStorage tests for now.
    function mockFetchOnce(
      status: POMSignRequestStatus = 'payment_started',
      code: number = 200
    ) {
      return vi.spyOn(window, 'fetch').mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            status,
          }),
          { status: code }
        )
      );
    }

    const eMandate = {
      id: 'eMandate1',
      eMandateIdSource: '15000001',
      signRequestStatusUrl: `${bffApiHost}/status-check`,
      status: '0',
    } as unknown as AfisEMandateFrontend;

    beforeAll(() => {
      clearLocalStorage();
    });

    afterEach(() => {
      vi.clearAllMocks();
      clearLocalStorage();
    });

    it('should not fetch if no payload is present', async () => {
      const fetchMock = mockFetchOnce();
      const { result } = renderHook(() => useSignRequestStatusCheck(eMandate));
      expect(fetchMock).not.toHaveBeenCalled();
      expect(result.current).toEqual({
        cancel: expect.any(Function),
        data: null,
        errorData: null,
        fetch: expect.any(Function),
        isDirty: false,
        isError: false,
        isLoading: false,
        isPendingActivation: false,
        isPristine: true,
        isRequestingStatusCheck: false,
        isTakingLong: undefined,
        optimisticUpdateContent: expect.any(Function),
        payload: undefined,
      });
    });

    it('should fetch status check if payload is present and handle PENDING response correctly', async () => {
      const fetchMock = mockFetchOnce();
      window.localStorage.setItem(
        'afis-emandate-status-check-payload',
        JSON.stringify([
          {
            eMandateId: eMandate.id,
            payload: 'payload',
            activationDate: new Date().toISOString(),
          },
        ])
      );

      const { result } = renderHook(() => useSignRequestStatusCheck(eMandate));

      expect(fetchMock).toHaveBeenCalledWith(
        `${eMandate.signRequestStatusUrl}?statusCheckPayload=payload`,
        {
          credentials: 'include',
        }
      );
      // Wait for effect to finish
      await act(async () => {});
      expect(result.current.data).toEqual({
        content: {
          status: 'payment_started',
        },
        status: 'OK',
      });
      expect(result.current.isDirty).toBe(true);
      expect(result.current.isPristine).toBe(false);
      expect(result.current.isPendingActivation).toBe(true);
    });

    it('should fetch status check if payload is present and handle NON SUCCESS response correctly', async () => {
      const fetchMock = mockFetchOnce('payment_cancelled');
      window.localStorage.setItem(
        'afis-emandate-status-check-payload',
        JSON.stringify([
          {
            eMandateId: eMandate.id,
            payload: 'payload',
            activationDate: new Date().toISOString(),
          },
        ])
      );

      const { result } = renderHook(() => useSignRequestStatusCheck(eMandate));

      expect(fetchMock).toHaveBeenCalledWith(
        `${eMandate.signRequestStatusUrl}?statusCheckPayload=payload`,
        {
          credentials: 'include',
        }
      );
      // Wait for effect to finish
      await act(async () => {});
      expect(result.current.data).toEqual({
        content: {
          status: 'payment_cancelled',
        },
        status: 'OK',
      });
      expect(result.current.isDirty).toBe(true);
      expect(result.current.isPristine).toBe(false);
      expect(result.current.isPendingActivation).toBe(false);
    });

    it('should handle fetch errors correctly', async () => {
      const fetchMock = vi
        .spyOn(window, 'fetch')
        .mockRejectedValueOnce(new Error('Network error'));
      window.localStorage.setItem(
        'afis-emandate-status-check-payload',
        JSON.stringify([
          {
            eMandateId: eMandate.id,
            payload: 'payload',
            activationDate: new Date().toISOString(),
          },
        ])
      );

      const { result } = renderHook(() => useSignRequestStatusCheck(eMandate));

      expect(fetchMock).toHaveBeenCalledWith(
        `${eMandate.signRequestStatusUrl}?statusCheckPayload=payload`,
        {
          credentials: 'include',
        }
      );
      // Wait for effect to finish
      await act(async () => {});
      expect(result.current.data).toBeNull();
      expect(result.current.errorData).toBe('Network error');
      expect(result.current.isDirty).toBe(true);
      expect(result.current.isError).toBe(true);
      expect(result.current.isPendingActivation).toBe(false);
    });
  });
});
