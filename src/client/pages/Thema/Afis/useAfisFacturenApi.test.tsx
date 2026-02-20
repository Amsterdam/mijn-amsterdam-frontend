import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import type { AfisFactuurFrontend } from './Afis-thema-config';
import {
  forTesting,
  getDocumentLink,
  useAfisFacturenApi,
} from './useAfisFacturenApi';
import type { AfisFactuur } from '../../../../server/services/afis/afis-types';
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
        link: {
          to: '/facturen-en-betalen/factuur/afgehandeld/1',
          title: 'Factuur 1',
        },
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
    } as AfisFactuur);

    expect(el).toMatchInlineSnapshot(`
      <React.Fragment>
        <React.Fragment>
          Openstaand
          :
        </React.Fragment>
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
    } as AfisFactuur);

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

  it('gets a clickable download link', () => {
    const el = getDocumentLink({
      factuurNummer: '1',
      documentDownloadLink: 'http://example.com/document/1.pdf',
      datePublished: '2024-01-01',
    } as AfisFactuurFrontend);

    expect(el).toMatchInlineSnapshot(`
      <DocumentLink
        document={
          {
            "datePublished": "2024-01-01",
            "id": "1",
            "title": "factuur 1",
            "url": "http://example.com/document/1.pdf",
          }
        }
      />
    `);
  });
});
