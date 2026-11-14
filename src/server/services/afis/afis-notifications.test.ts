import Mockdate from 'mockdate';
import type { Mock } from 'vitest';
import { describe, expect, it, vi } from 'vitest';

import { themaConfig } from '../../../client/apps/bob/pages/Thema/Afis/Afis-thema-config.ts';
import { getAuthProfileAndToken } from '../../../testing/utils.ts';
import type { ApiErrorResponse } from '../../../universal/helpers/api.ts';
import { apiSuccessResult } from '../../../universal/helpers/api.ts';
import { fetchAfisAccounts } from './afis.ts';
import { fetchAfisFacturenOverview } from './afis-facturen.ts';
import {
  createAfisFacturenNotification,
  fetchAfisNotifications,
} from './afis-notifications.ts';
import type { AfisFactuur, AfisFactuurStatus } from './afis-types.ts';

vi.mock('./afis', () => ({
  fetchAfisAccounts: vi.fn(),
}));

vi.mock('./afis-facturen', () => ({
  fetchAfisFacturenOverview: vi.fn(),
}));

function createAfisFactuur(
  id: string,
  status: AfisFactuurStatus,
  factuurNummer: string,
  datePublished: string
): AfisFactuur {
  return {
    id,
    factuurNummer,
    datePublished,
    status,
    afzender: '',
    datePublishedFormatted: null,
    paymentDueDate: '',
    paymentDueDateFormatted: '',
    debtClearingDate: null,
    debtClearingDateFormatted: null,
    amountPayed: '',
    amountPayedFormatted: '',
    amountOriginal: '',
    amountOriginalFormatted: '',
    factuurDocumentId: '',
    paylink: null,
    documentDownloadLink: null,
    statusDescription: '',
    link: {
      to: '/facturen-en-betalen',
      title: 'Bekijk uw openstaande facturen',
    },
  } as AfisFactuur;
}

describe('createAfisFacturenNotification', () => {
  beforeAll(() => {
    Mockdate.set('2023-01-01');
  });

  it('should return null if there are no open facturen', () => {
    const facturen: AfisFactuur[] = [];
    const notification = createAfisFacturenNotification(facturen);
    expect(notification).toBeNull();
  });

  it('should create a notification for open facturen', () => {
    const facturen: AfisFactuur[] = [
      createAfisFactuur('1', 'openstaand', '123', '2023-01-01'),
    ];
    const notification = createAfisFacturenNotification(facturen);
    expect(notification).not.toBeNull();
    expect(notification?.title).toBe(
      'Betaal tijdig om extra kosten te voorkomen'
    );
    expect(notification?.description).toContain(
      'U heeft 1 openstaande facturen.'
    );
  });

  it('should include herinnering count in the notification description', () => {
    const facturen: AfisFactuur[] = [
      createAfisFactuur('1', 'openstaand', '123', '2023-01-01'),
      createAfisFactuur('2', 'herinnering', '321', '2022-12-01'),
    ];
    const notification = createAfisFacturenNotification(facturen);
    expect(notification).not.toBeNull();
    expect(notification?.description).toMatchInlineSnapshot(
      `"U heeft 2 openstaande facturen. Van 1 factuur heeft u inmiddels een herinnering ontvangen per e-mail of post."`
    );
  });

  it('should use the most recent datePublished for the notification datePublished', () => {
    const facturen: AfisFactuur[] = [
      createAfisFactuur('1', 'openstaand', '123', '2022-12-31'),
      createAfisFactuur('2', 'betaald', '321', '2024-05-01'),
      {
        ...createAfisFactuur('3', 'openstaand', '999', '2023-12-31'),
        datePublished: null,
      },
    ];

    const notification = createAfisFacturenNotification(facturen);
    expect(notification).not.toBeNull();
    expect(notification?.datePublished).toBe('2024-05-01');

    const facturen2: AfisFactuur[] = [
      createAfisFactuur('1', 'openstaand', '123', '2024-05-01'),
      createAfisFactuur('2', 'betaald', '321', '2022-12-31'),
    ];

    const notification2 = createAfisFacturenNotification(facturen2);
    expect(notification2).not.toBeNull();
    expect(notification2?.datePublished).toBe('2024-05-01');
  });
});

describe('fetchAfisNotifications', () => {
  const authProfileAndToken = getAuthProfileAndToken();

  beforeEach(() => {
    (fetchAfisAccounts as Mock).mockResolvedValue(
      apiSuccessResult([
        {
          id: '96',
          businessPartnerId: '96',
          businessPartnerIdEncrypted: 'reference-a',
          vestigingsnummer: null,
          name: null,
        },
      ])
    );
  });

  it('should return notifications if fetchIsKnownInAFIS is successful', async () => {
    const facturen: AfisFactuur[] = [
      createAfisFactuur('1', 'openstaand', '123', '2022-12-31'),
    ];
    (fetchAfisFacturenOverview as Mock).mockResolvedValue({
      status: 'OK',
      content: { open: { facturen } },
    });

    const result = await fetchAfisNotifications(authProfileAndToken);
    expect(result).toEqual(
      apiSuccessResult({
        notifications: [
          {
            id: 'facturen-open-notification',
            datePublished: '2022-12-31',
            hideDatePublished: true,
            sortPriority: 6,
            themaID: themaConfig.id,
            themaTitle: 'Facturen en betalen',
            title: 'Betaal tijdig om extra kosten te voorkomen',
            description: `U heeft 1 openstaande facturen.`,
            link: {
              to: '/facturen-en-betalen',
              title: 'Bekijk uw openstaande facturen',
            },
          },
        ],
      })
    );
  });

  it('shows a total-unavailable warning if account discovery fails', async () => {
    const errorResponse: ApiErrorResponse<null> = {
      status: 'ERROR',
      message: 'An error occurred',
      content: null,
    };
    (fetchAfisAccounts as Mock).mockResolvedValue(errorResponse);

    const result = await fetchAfisNotifications(authProfileAndToken);
    expect(result.content?.notifications).toEqual([
      expect.objectContaining({
        title: 'Aantal openstaande facturen niet beschikbaar',
      }),
    ]);
  });

  it('aggregates invoices from all authorized accounts into a single summary', async () => {
    (fetchAfisAccounts as Mock).mockResolvedValue(
      apiSuccessResult([
        { businessPartnerId: '96' },
        { businessPartnerId: '113' },
      ])
    );
    (fetchAfisFacturenOverview as Mock).mockImplementation(
      async (_sessionID, payload) =>
        apiSuccessResult({
          open: {
            facturen: [
              createAfisFactuur(
                payload.businessPartnerID,
                'openstaand',
                'same-invoice-number',
                '2026-11-13'
              ),
            ],
          },
        })
    );

    const result = await fetchAfisNotifications(authProfileAndToken);

    expect(result.content?.notifications).toHaveLength(1);
    expect(result.content?.notifications[0].description).toContain(
      '2 openstaande facturen'
    );
  });

  it('does not present a partial total when an authorized account fails', async () => {
    (fetchAfisAccounts as Mock).mockResolvedValue(
      apiSuccessResult([
        { businessPartnerId: '96' },
        { businessPartnerId: '113' },
      ])
    );
    (fetchAfisFacturenOverview as Mock)
      .mockResolvedValueOnce(
        apiSuccessResult({
          open: {
            facturen: [createAfisFactuur('1', 'openstaand', '1', '2026-11-13')],
          },
        })
      )
      .mockResolvedValueOnce({
        status: 'ERROR',
        content: null,
        message: 'Unavailable',
      });

    const result = await fetchAfisNotifications(authProfileAndToken);

    expect(result.content?.notifications).toEqual([
      expect.objectContaining({
        title: 'Aantal openstaande facturen niet beschikbaar',
      }),
    ]);
    expect(result.content?.notifications[0].description).not.toContain(
      '1 openstaande'
    );
  });
});
