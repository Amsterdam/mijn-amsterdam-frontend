import type { Request, Response } from 'express';
import { describe, expect, it, vi } from 'vitest';

import BENK_VESTIGINGEN from '../fixtures/hr-kvk/vestigingen.json' with {
  type: 'json',
};
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
  it('uses the same vestigingsnummers and names as the BENK vestigingen fixture', () => {
    const response = requestMockRoute('post-afis-businesspartner-kvk', {
      body: { KVK: '999999999' },
    });
    for (const vestiging of BENK_VESTIGINGEN._embedded.vestigingen) {
      const account = response.Record.find(
        (record: { Vestigingsnummer?: string }) =>
          record.Vestigingsnummer === vestiging.vestigingsnummer
      );
      expect(account, vestiging.vestigingsnummer).toBeDefined();
      const details = requestMockRoute('get-afis-businesspartner-details', {
        query: {
          $filter: `BusinessPartner eq '${account.Zakenpartnernummer}'`,
        },
      });
      expect(
        details.feed.entry[0].content.properties.BusinessPartnerFullName
      ).toBe(vestiging.naam ?? vestiging.eersteHandelsnaam);
      expect(account.Blokkade).toBe('Nee');
    }
  });

  it('returns different invoices for different customers and keeps counts before pagination', () => {
    const first = requestMockRoute('get-afis-facturen', {
      query: { $filter: "Customer eq '0000000001' and IsCleared eq false" },
    });
    const second = requestMockRoute('get-afis-facturen', {
      query: { $filter: "Customer eq '0000000002' and IsCleared eq false" },
    });
    const limited = requestMockRoute('get-afis-facturen', {
      query: {
        $filter: "Customer eq '0000000001' and IsCleared eq false",
        $top: '1',
      },
    });

    expect(first.feed.entry.length).toBeGreaterThan(1);
    expect(second.feed.entry.length).toBeGreaterThan(0);
    const firstDocuments = first.feed.entry.map(
      (entry: { content: { properties: { AccountingDocument: string } } }) =>
        entry.content.properties.AccountingDocument
    );
    for (const entry of second.feed.entry) {
      expect(firstDocuments).not.toContain(
        entry.content.properties.AccountingDocument
      );
      expect(entry.content.properties.Customer).toBe('0000000002');
    }
    expect(limited.feed.entry).toHaveLength(1);
    expect(limited.feed.count).toBe(first.feed.entry.length);
  });

  it.each([
    'IsCleared eq false',
    "IsCleared eq true and (DunningLevel ne '3' or ReverseDocument ne '')",
    "IsCleared eq true and DunningLevel eq '3'",
    "PaymentTerms gt 'B' and SEPAMandate ne '' and IsCleared eq true and (DunningLevel ne '3' or ReverseDocument ne '')",
  ])(
    'does not expose another account through invoice filter %s',
    (stateFilter) => {
      const response = requestMockRoute('get-afis-facturen', {
        query: { $filter: `Customer eq '0000099413' and ${stateFilter}` },
      });

      expect(response.feed).toEqual({ entry: [], count: 0 });
    }
  );

  it('matches padded and unpadded customer and sender identifiers', () => {
    for (const [routeId, field] of [
      ['get-afis-facturen', 'Customer'],
      ['get-afis-emandates', 'SndId'],
    ]) {
      const stateFilter = field === 'Customer' ? ' and IsCleared eq false' : '';
      const padded = requestMockRoute(routeId, {
        query: { $filter: `${field} eq '0000000002'${stateFilter}` },
      });
      const unpadded = requestMockRoute(routeId, {
        query: { $filter: `${field} eq '2'${stateFilter}` },
      });
      expect(padded).toEqual(unpadded);
    }
  });

  it('returns only the selected account mandates', () => {
    const first = requestMockRoute('get-afis-emandates', {
      query: { $filter: "SndId eq '0000000001'" },
    });
    const second = requestMockRoute('get-afis-emandates', {
      query: { $filter: "SndId eq '0000000002'" },
    });

    expect(first.feed.entry.length).toBeGreaterThan(0);
    expect(second.feed.entry.length).toBeGreaterThan(0);
    expect(
      first.feed.entry.every(
        (entry: { content: { properties: { SndId: string } } }) =>
          entry.content.properties.SndId === '0000000001'
      )
    ).toBe(true);
    expect(
      second.feed.entry.every(
        (entry: { content: { properties: { SndId: string } } }) =>
          entry.content.properties.SndId === '0000000002'
      )
    ).toBe(true);
    const firstIds = first.feed.entry.map(
      (entry: { content: { properties: { IMandateId: string } } }) =>
        entry.content.properties.IMandateId
    );
    for (const entry of second.feed.entry) {
      expect(firstIds).not.toContain(entry.content.properties.IMandateId);
    }
  });

  it('returns no mandates for an unknown account', () => {
    const response = requestMockRoute('get-afis-emandates', {
      query: { $filter: "SndId eq '0000099413'" },
    });
    expect(response.feed).toEqual({ entry: [], count: 0 });
  });

  it('keeps mandate creation and updates isolated to the selected account', () => {
    const otherAccountRequest = { query: { $filter: "SndId eq '0000000002'" } };
    const otherAccountBefore = structuredClone(
      requestMockRoute('get-afis-emandates', otherAccountRequest)
    );
    const created = requestMockRoute('post-afis-emandates', {
      body: {
        SndId: '0000000001',
        SndDebtorId: 'AFVAL',
        SndName1: 'Voorbeeld Test',
        SndIban: 'NL21RABO0110055004',
      },
    });
    requestMockRoute('put-afis-emandates', {
      body: { IMandateId: created.content.properties.IMandateId, Status: '0' },
    });
    const selectedAccount = requestMockRoute('get-afis-emandates', {
      query: { $filter: "SndId eq '0000000001'" },
    });

    expect(selectedAccount.feed.entry).toContainEqual(
      expect.objectContaining({
        content: expect.objectContaining({
          properties: expect.objectContaining({
            IMandateId: created.content.properties.IMandateId,
            SndId: '0000000001',
            Status: '0',
          }),
        }),
      })
    );
    expect(requestMockRoute('get-afis-emandates', otherAccountRequest)).toEqual(
      otherAccountBefore
    );
  });

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
      '0000000007',
      '0000000008',
      '0000000009',
      '0000000010',
      '0000000011',
      '0000000012',
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
      body: { KVK: '999999999', Vestigingsnummer: '000006363601' },
    });

    expect(response.Record).toEqual([
      expect.objectContaining({
        Zakenpartnernummer: '0000000002',
        Vestigingsnummer: '000006363601',
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
              BusinessPartnerFullName:
                'Personeelsvoorziening begraafplaats Carspelhof',
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
