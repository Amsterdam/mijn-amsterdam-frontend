import type { Request, Response } from 'express';
import { describe, expect, it, vi } from 'vitest';

import { routes } from '../routes/afis.ts';
import type { MockServerCore } from '../types.ts';

function requestMockRoute(id: string, request: Partial<Request>) {
  const handler = routes.find((route) => route.id === id)?.handler;
  if (handler?.type !== 'middleware') {
    throw new Error(`Expected a middleware mock for ${id}`);
  }
  const send = vi.fn();
  handler.middleware(
    request as Request,
    { send } as unknown as Response,
    vi.fn(),
    {} as MockServerCore
  );
  return send.mock.calls[0][0];
}

describe('AFIS local account mocks', () => {
  it('returns sequential accounts for the default local eHerkenning KvK', () => {
    const response = requestMockRoute('post-afis-businesspartner-kvk', {
      body: { KVK: '999999999' },
    });

    expect(
      response.Record.map(
        (record: { Zakenpartnernummer: string }) => record.Zakenpartnernummer
      )
    ).toEqual([
      '0000000001',
      '0000000002',
      '0000000003',
      '0000000004',
      '0000000005',
      '0000000006',
    ]);
    expect(
      response.Record.every(
        (record: { KVK: number }) => record.KVK === 999999999
      )
    ).toBe(true);
    expect(
      response.Record.some(
        (record: { Blokkade: string }) => record.Blokkade === 'Ja'
      )
    ).toBe(true);
  });

  it('honors a restricted vestigingsnummer', () => {
    const response = requestMockRoute('post-afis-businesspartner-kvk', {
      body: { KVK: '999999999', Vestigingsnummer: '000021946485' },
    });

    expect(response.Record).toEqual([
      expect.objectContaining({
        Zakenpartnernummer: '0000000002',
        Vestigingsnummer: '000021946485',
      }),
    ]);
  });

  it.each(['2', '0000000002', '0000000000002'])(
    'selects the matching businesspartner for %s',
    (businessPartnerId) => {
      const response = requestMockRoute('get-afis-businesspartner-details', {
        query: { $filter: `BusinessPartner eq '${businessPartnerId}'` },
      });

      expect(response.feed.entry).toEqual([
        expect.objectContaining({
          content: expect.objectContaining({
            properties: expect.objectContaining({
              BusinessPartner: 2,
              BusinessPartnerFullName: 'Voorbeeld Bedrijf B BV',
            }),
          }),
        }),
      ]);
    }
  );

  it.each(['0000000004', '0000000005'])(
    'provides an unnamed businesspartner for %s',
    (businessPartnerId) => {
      const response = requestMockRoute('get-afis-businesspartner-details', {
        query: { $filter: `BusinessPartner eq '${businessPartnerId}'` },
      });

      expect(response.feed.entry).toHaveLength(1);
      expect(
        response.feed.entry[0].content.properties.BusinessPartnerFullName
      ).toBeNull();
    }
  );

  it('does not substitute another businesspartner when there is no match', () => {
    const response = requestMockRoute('get-afis-businesspartner-details', {
      query: { $filter: "BusinessPartner eq '0000099413'" },
    });

    expect(response.feed.entry).toEqual([]);
  });

  it('keeps details available for the existing DigiD mock account', () => {
    const response = requestMockRoute('get-afis-businesspartner-details', {
      query: { $filter: "BusinessPartner eq '0000067899'" },
    });

    expect(response.feed.entry).toHaveLength(1);
    expect(response.feed.entry[0].content.properties.BusinessPartner).toBe(
      67899
    );
  });
});
