import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, type Mock } from 'vitest';

import type { AfisFactuurFrontend } from './Afis-thema-config';
import { useAfisListPageData } from './useAfisListPageData';
import { bffApi } from '../../../../testing/utils';
import { useAppStateGetter } from '../../../hooks/useAppStateStore';

// vi.mock('./useAfisFacturenApi');
vi.mock('../../../hooks/useAppStateStore');
vi.mock('../../../hooks/useThemaMenuItems');

describe('useAfisListPageData', () => {
  const mockAFIS = {
    content: {
      businessPartnerIdEncrypted: 'encrypted-id',
      facturen: {
        open: {
          state: 'openstaand',
          count: 1,
          facturen: [
            {
              factuurNummer: 'open-1',
              amount: 100,
              status: 'openstaand',
              statusDescription: 'Openstaand',
              documentDownloadLink: 'http://example.com/document/open-1.pdf',
            } as unknown as AfisFactuurFrontend,
          ],
        },
      },
    },
  };

  const mockFacturenResponse = {
    state: 'afgehandeld',
    facturen: [
      {
        factuurNummer: 'afgehandeld-1',
        amount: 100,
        status: 'afgehandeld',
        statusDescription: 'Afgehandeld',
        documentDownloadLink: 'http://example.com/document/afgehandeld-1.pdf',
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch facturen for non-open states', async () => {
    (useAppStateGetter as Mock).mockReturnValue({ AFIS: mockAFIS });
    bffApi
      .get(/\/facturen/)
      .reply(200, { content: mockFacturenResponse, status: 'OK' });

    const { result } = renderHook(() => useAfisListPageData('afgehandeld'));

    expect(result.current.isListPageLoading).toBe(true);
    expect(result.current.isListPageError).toBe(false);

    await waitFor(() => {
      expect(result.current.isListPageLoading).toBe(false);
    });

    expect(result.current.facturenListResponse).toMatchInlineSnapshot(`undefined`);
  });

  it('should return default values for open state', () => {
    (useAppStateGetter as Mock).mockReturnValue({ AFIS: mockAFIS });

    const { result } = renderHook(() => useAfisListPageData('open'));

    expect(result.current.facturenListResponse).toMatchInlineSnapshot(`undefined`);
  });
});
