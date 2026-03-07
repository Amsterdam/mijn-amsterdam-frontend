import { act, renderHook } from '@testing-library/react';

import {
  useSignRequestPayloadStorage,
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
    });
    afterEach(() => {
      clearLocalStorage();
    });

    it('should add, get and remove payloads correctly', () => {
      const { result } = renderHook(() => useSignRequestPayloadStorage());

      // Initially, there should be no payloads
      expect(result.current.payloads).toEqual([]);
      expect(result.current.hasPendingStatusChecks()).toBe(false);

      // Add a payload
      act(() => {
        result.current.add('eMandate1', 'payload1');
      });
      expect(result.current.payloads.length).toBe(1);
      expect(result.current.getPayload('eMandate1')).toBe('payload1');
      expect(result.current.hasPendingStatusChecks()).toBe(true);

      // Remove the payload
      act(() => {
        result.current.remove('eMandate1');
      });
      expect(result.current.payloads).toEqual([]);
      expect(result.current.hasPendingStatusChecks()).toBe(false);
    });

    it('should correctly identify when a status check is taking long', () => {
      const { result } = renderHook(() => useSignRequestPayloadStorage());

      // Add a payload with an activation date in the past
      const pastDate = new Date(Date.now() - 11 * 60 * 1000).toISOString(); // 11 minutes ago
      act(() => {
        result.current.add('eMandate2', 'payload2');
      });

      // Manually set the activation date to the past
      result.current.payloads[0][2] = pastDate;

      expect(result.current.isTakingLong('eMandate2')).toBe(true);

      // Update the activation date to now
      const nowDate = new Date().toISOString();
      act(() => {
        result.current.payloads[0][2] = nowDate;
      });

      expect(result.current.isTakingLong('eMandate2')).toBe(false);
    });

    it('should return false for isTakingLong if there is no activation date', () => {
      const { result } = renderHook(() => useSignRequestPayloadStorage());

      // Add a payload without an activation date
      act(() => {
        result.current.add('eMandate3', 'payload3');
      });

      // Manually remove the activation date
      result.current.payloads[0][2] = '';

      expect(result.current.isTakingLong('eMandate3')).toBe(false);
    });

    it('should return false for isTakingLong if eMandateId does not exist', () => {
      const { result } = renderHook(() => useSignRequestPayloadStorage());

      expect(result.current.isTakingLong('nonExistentId')).toBe(false);
    });

    it('should return null for getPayload if eMandateId does not exist', () => {
      const { result } = renderHook(() => useSignRequestPayloadStorage());

      expect(result.current.getPayload('nonExistentId')).toBeNull();
    });

    it('should return null for getPayload if payloads are empty', () => {
      const { result } = renderHook(() => useSignRequestPayloadStorage());

      expect(result.current.getPayload('anyId')).toBeNull();
    });

    it('should handle multiple payloads correctly', () => {
      const { result } = renderHook(() => useSignRequestPayloadStorage());

      // Add multiple payloads
      act(() => {
        result.current.add('eMandate4', 'payload4');
      });
      act(() => {
        result.current.add('eMandate5', 'payload5');
      });

      expect(result.current.payloads.length).toBe(2);
      expect(result.current.getPayload('eMandate4')).toBe('payload4');
      expect(result.current.getPayload('eMandate5')).toBe('payload5');

      // Remove one payload and check the other still exists
      act(() => {
        result.current.remove('eMandate4');
      });

      expect(result.current.payloads.length).toBe(1);
      expect(result.current.getPayload('eMandate4')).toBeNull();
      expect(result.current.getPayload('eMandate5')).toBe('payload5');
    });

    it('should correctly identify pending status checks', () => {
      const { result } = renderHook(() => useSignRequestPayloadStorage());

      expect(result.current.hasPendingStatusChecks()).toBe(false);

      act(() => {
        result.current.add('eMandate6', 'payload6');
      });

      expect(result.current.hasPendingStatusChecks()).toBe(true);

      act(() => {
        result.current.remove('eMandate6');
      });

      expect(result.current.hasPendingStatusChecks()).toBe(false);
    });

    it('should correctly identify when a status check is taking long for multiple payloads', () => {
      const { result } = renderHook(() => useSignRequestPayloadStorage());

      // Add multiple payloads with different activation dates
      const pastDate = new Date(Date.now() - 11 * 60 * 1000).toISOString(); // 11 minutes ago
      const nowDate = new Date().toISOString();

      act(() => {
        result.current.add('eMandate7', 'payload7');
      });
      act(() => {
        result.current.add('eMandate8', 'payload8');
      });

      // Manually set activation dates
      result.current.payloads[0][2] = pastDate; // eMandate7
      result.current.payloads[1][2] = nowDate; // eMandate8

      expect(result.current.isTakingLong('eMandate7')).toBe(true);
      expect(result.current.isTakingLong('eMandate8')).toBe(false);
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
      signRequestStatusUrl: `${bffApiHost}/status-check`,
      status: '0',
    } as AfisEMandateFrontend;

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
        isTakingLong: false,
        optimisticUpdateContent: expect.any(Function),
        payload: null,
      });
    });

    it('should fetch status check if payload is present and handle PENDING response correctly', async () => {
      const fetchMock = mockFetchOnce();
      window.localStorage.setItem(
        'afis-emandate-status-check-payload',
        JSON.stringify([[eMandate.id, 'payload', new Date().toISOString()]])
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

    it('should remove payload if hook is rendered with EMandate status is ACTIVE', () => {
      mockFetchOnce();

      window.localStorage.setItem(
        'afis-emandate-status-check-payload',
        JSON.stringify([[eMandate.id, 'payload', new Date().toISOString()]])
      );
      const payloads = localStorage.getItem(
        'afis-emandate-status-check-payload'
      );
      expect(payloads).not.toBeNull();
      expect(payloads).not.toBe('[]');

      renderHook(() => useSignRequestStatusCheck({ ...eMandate, status: '1' }));

      expect(localStorage.getItem('afis-emandate-status-check-payload')).toBe(
        '[]'
      );
    });

    it('should fetch status check if payload is present and handle NON SUCCESS response correctly', async () => {
      const fetchMock = mockFetchOnce('payment_cancelled');
      window.localStorage.setItem(
        'afis-emandate-status-check-payload',
        JSON.stringify([[eMandate.id, 'payload', new Date().toISOString()]])
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
        JSON.stringify([[eMandate.id, 'payload', new Date().toISOString()]])
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
