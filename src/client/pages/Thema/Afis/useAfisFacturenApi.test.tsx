import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import type { AfisFactuurFrontend } from './Afis-thema-config';
import { forTesting, useAfisFacturenApi } from './useAfisFacturenApi';
import { bffApi } from '../../../../testing/utils';

describe('useAfisFacturenApi', () => {
  const mockFacturenResponse = {
    state: 'afgehandeld',
    facturen: [
      {
        factuurNummer: '1',
        amount: 100,
        status: 'afgehandeld',
        statusDescription: 'Afgehandeld',
        documentDownloadLink: 'http://example.com/document/1.pdf',
      },
    ],
  };

  it('should fetch facturen data successfully', async () => {
    bffApi
      .get(/\/facturen/)
      .reply(200, { content: mockFacturenResponse, status: 'OK' });

    const { result } = renderHook(() =>
      useAfisFacturenApi('encrypted-id', 'afgehandeld')
    );

    expect(result.current.isLoading).toBe(true);
    expect(result.current.isError).toBe(false);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const mockFacturenResponseTransformed = {
      ...mockFacturenResponse,
      facturen: [
        {
          ...mockFacturenResponse.facturen[0],
          factuurNummerEl: expect.any(Object),
        },
      ],
    };

    expect(result.current.facturenByState).toEqual({
      afgehandeld: mockFacturenResponseTransformed,
    });
  });

  it('should transform the statusDescription property to a clickable element', () => {
    const el = forTesting.getInvoiceStatusDescriptionFrontend({
      status: 'openstaand',
      statusDescription: 'Test',
      paylink: 'http://example.com/pay',
    } as AfisFactuurFrontend);

    expect(el).toMatchInlineSnapshot(`
      <React.Fragment>
        Openstaand
        :
         
        <MaLink
          href="http://example.com/pay"
          maVariant="fatNoUnderline"
          target="_blank"
        >
          Test
        </MaLink>
      </React.Fragment>
    `);
  });

  it('Leave statusDescription unchanged if there is no paylink', () => {
    const el = forTesting.getInvoiceStatusDescriptionFrontend({
      status: 'openstaand',
      statusDescription: 'Test',
    } as AfisFactuurFrontend);

    expect(el).toBe('Test');
  });

  it('should handle API errors gracefully', async () => {
    bffApi.get(/\/facturen/).reply(500);

    const { result } = renderHook(() =>
      useAfisFacturenApi('encrypted-id', 'afgehandeld')
    );

    expect(result.current.isLoading).toBe(true);
    expect(result.current.isError).toBe(false);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isError).toBe(true);
    expect(result.current.facturenByState).toBeNull();
  });
});
