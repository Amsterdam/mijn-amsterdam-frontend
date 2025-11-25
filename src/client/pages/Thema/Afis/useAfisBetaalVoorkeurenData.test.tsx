import { renderHook } from '@testing-library/react';
import { vi, Mock } from 'vitest';

import { useAfisBetaalVoorkeurenData } from './useAfisBetaalVoorkeurenData';
import type { ApiSuccessResponse } from '../../../../universal/helpers/api';
import { useBffApi } from '../../../hooks/api/useBffApi';

vi.mock('../../../hooks/api/useBffApi');

describe('useAfisBetaalVoorkeurenData', () => {
  const businessPartnerIdEncrypted = 'encryptedId';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return loading state initially', () => {
    (useBffApi as Mock).mockReturnValue({
      data: null,
      isLoading: true,
      isError: false,
    });

    const { result } = renderHook(() =>
      useAfisBetaalVoorkeurenData(businessPartnerIdEncrypted)
    );

    expect(result.current.isLoadingBusinessPartnerDetails).toBe(true);
    expect(result.current.businesspartnerDetails).toBeNull();
  });

  it('should return business partner details when data is fetched', () => {
    const mockData = {
      content: { name: 'John Doe', email: 'john@example.com' },
    };

    (useBffApi as Mock).mockReturnValue({
      data: mockData,
      isLoading: false,
      isError: false,
    });

    const { result } = renderHook(() =>
      useAfisBetaalVoorkeurenData(businessPartnerIdEncrypted)
    );

    expect(result.current.businesspartnerDetails).toEqual(mockData.content);
    expect(result.current.isLoadingBusinessPartnerDetails).toBe(false);
    expect(result.current.hasBusinessPartnerDetailsError).toBe(false);
  });

  it('should handle errors correctly', () => {
    (useBffApi as Mock).mockReturnValue({
      data: null,
      isLoading: false,
      isError: true,
    });

    const { result } = renderHook(() =>
      useAfisBetaalVoorkeurenData(businessPartnerIdEncrypted)
    );

    expect(result.current.hasBusinessPartnerDetailsError).toBe(true);
  });

  it('should check for failed dependencies', () => {
    const mockData: ApiSuccessResponse<unknown> = {
      content: { email: null, phone: '123456789', fullName: 'John Doe' },
      status: 'OK',
      failedDependencies: {
        email: {
          content: null,
          message: 'Email not found',
          status: 'ERROR',
        },
      },
    };

    (useBffApi as Mock).mockReturnValue({
      data: mockData,
      isLoading: false,
      isError: false,
    });

    const { result } = renderHook(() =>
      useAfisBetaalVoorkeurenData(businessPartnerIdEncrypted)
    );

    expect(result.current.hasFailedEmailDependency).toBe(true);
    expect(result.current.hasFailedPhoneDependency).toBe(false);
    expect(result.current.hasFailedFullNameDependency).toBe(false);
  });
});
