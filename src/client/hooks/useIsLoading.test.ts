import { renderHook } from '@testing-library/react';
import type { Mock } from 'vitest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useIsLoading } from './useIsLoading.ts';
import { useProfileTypeValue } from './useProfileType.ts';
import type { ApiResponse_DEPRECATED } from '../../universal/helpers/api.ts';

vi.mock('./useProfileType.ts', () => ({
  useProfileTypeValue: vi.fn(),
}));

describe('useIsLoading', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns false when response data is ready', () => {
    const response: ApiResponse_DEPRECATED<unknown> = {
      status: 'OK',
      content: {},
    };

    (useProfileTypeValue as Mock).mockReturnValue('private');

    const { result } = renderHook(() => useIsLoading(response));

    expect(result.current).toBe(false);
  });

  it('returns true when response data is not available yet', () => {
    (useProfileTypeValue as Mock).mockReturnValue('private');

    const { result } = renderHook(() => useIsLoading());

    expect(result.current).toBe(true);
  });

  it('returns true when the response is active for the current profile type', () => {
    const response: ApiResponse_DEPRECATED<unknown> = {
      status: 'PRISTINE',
      content: null,
      isActive: true,
      profileTypes: ['private'],
    };

    (useProfileTypeValue as Mock).mockReturnValue('private');

    const { result } = renderHook(() => useIsLoading(response));

    expect(result.current).toBe(true);
  });

  it('returns false when the response is not active for the current profile type', () => {
    const response: ApiResponse_DEPRECATED<unknown> = {
      status: 'PRISTINE',
      content: null,
      isActive: true,
      profileTypes: ['commercial'],
    };

    (useProfileTypeValue as Mock).mockReturnValue('private');

    const { result } = renderHook(() => useIsLoading(response));

    expect(result.current).toBe(false);
  });
});
