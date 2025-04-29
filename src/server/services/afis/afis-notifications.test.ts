import Mockdate from 'mockdate';
import { describe, it, expect, vi, Mock } from 'vitest';

import { fetchIsKnownInAFIS } from './afis';
import {
  createAfisFacturenNotification,
  fetchAfisNotifications,
} from './afis-notifications';
import { AfisFactuur, AfisFactuurStatus } from './afis-types';
import { themaId } from '../../../client/pages/Thema/Afis/Afis-thema-config';
import { getAuthProfileAndToken } from '../../../testing/utils';
import {
  apiDependencyError,
  ApiErrorResponse,
  apiSuccessResult,
} from '../../../universal/helpers/api';

vi.mock('./afis', () => ({
  fetchIsKnownInAFIS: vi.fn(),
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
  };
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
});

describe('fetchAfisNotifications', () => {
  const requestID = 'test-request-id';
  const authProfileAndToken = getAuthProfileAndToken();

  it('should return notifications if fetchIsKnownInAFIS is successful', async () => {
    const facturen: AfisFactuur[] = [
      createAfisFactuur('1', 'openstaand', '123', '2023-01-01'),
    ];
    (fetchIsKnownInAFIS as Mock).mockResolvedValue({
      status: 'OK',
      content: { facturen: { open: { facturen } } },
    });

    const result = await fetchAfisNotifications(requestID, authProfileAndToken);
    expect(result).toEqual(
      apiSuccessResult({
        notifications: [
          {
            id: 'facturen-open-notification',
            datePublished: '2023-01-01T00:00:00.000Z',
            themaID: themaId,
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

  it('should return an error if fetchIsKnownInAFIS fails', async () => {
    const errorResponse: ApiErrorResponse<null> = {
      status: 'ERROR',
      message: 'An error occurred',
      content: null,
    };
    (fetchIsKnownInAFIS as Mock).mockResolvedValue(errorResponse);

    const result = await fetchAfisNotifications(requestID, authProfileAndToken);
    expect(result).toEqual(apiDependencyError({ afis: errorResponse }));
  });
});
