import MockDate from 'mockdate';
import { describe, expect, it } from 'vitest';

import {
  VarenRegistratieRederType,
  VarenVergunningExploitatieType,
} from './config-and-types';
import { fetchVarenNotifications } from './varen-notifications';
import { getAuthProfileAndToken } from '../../../testing/utils';
import {
  apiErrorResult,
  apiSuccessResult,
} from '../../../universal/helpers/api';
import * as decos from '../decos/decos-service';

const exploitatieBase_ = {
  vesselName: 'boatName',
  id: 'Z-25-0000001',
  identifier: 'Z/25/0000001',
  key: 'ABCDEF0123456789ABCDEF0123456789',
  caseType: 'Varen vergunning exploitatie',
  title: 'Varen vergunning exploitatie',
  status: 'In behandeling',
  decision: null,
  processed: false,
  dateRequest: '2025-01-01T00:00:00',
  statusDates: [],
  termijnDates: [],
} satisfies Partial<VarenVergunningExploitatieType>;
const exploitatieBase =
  exploitatieBase_ as unknown as VarenVergunningExploitatieType;

describe('Notifications', () => {
  const authProfileAndToken = getAuthProfileAndToken();

  MockDate.set('2025-01-20');

  it('should respond with an error response if fetchDecosZaken returns an error', async () => {
    vi.spyOn(decos, 'fetchDecosZaken').mockResolvedValueOnce(
      apiErrorResult('Error', null)
    );

    const response = await fetchVarenNotifications('x0', authProfileAndToken);
    const errorResponse = {
      content: null,
      message: 'Error fetching Varen zaken data',
      status: 'ERROR',
    };
    expect(response).toStrictEqual(errorResponse);
  });

  it('should only show most recent notification for every zaak', async () => {
    const zaakRecent = exploitatieBase;

    const zaakOlderThen3Months = {
      ...exploitatieBase,
      dateRequest: '2024-09-01T00:00:00',
    };

    vi.spyOn(decos, 'fetchDecosZaken').mockResolvedValueOnce(
      apiSuccessResult([zaakRecent, zaakOlderThen3Months])
    );

    const { content } = await fetchVarenNotifications(
      'x3',
      authProfileAndToken
    );

    expect(content?.notifications).toHaveLength(1);
    expect(content?.notifications[0].datePublished).toBe(
      zaakRecent.dateRequest
    );
  });

  it('should show a notification for registratie reder', async () => {
    const rederRegistratie_ = {
      id: 'Z-25-0000001',
      caseType: 'Varen registratie reder',
      dateRequest: '2025-01-01T00:00:00',
      termijnDates: [],
      statusDates: [],
    } satisfies Partial<VarenRegistratieRederType>;
    const rederRegistratie =
      rederRegistratie_ as unknown as VarenRegistratieRederType;

    vi.spyOn(decos, 'fetchDecosZaken').mockResolvedValueOnce(
      apiSuccessResult([rederRegistratie])
    );

    const response = await fetchVarenNotifications('x1', authProfileAndToken);
    const successResponse = {
      status: 'OK',
      content: {
        notifications: [
          {
            themaID: 'VAREN',
            themaTitle: 'Passagiers- en beroepsvaart',
            id: 'varen-Z-25-0000001-reder-notification',
            datePublished: rederRegistratie.dateRequest,
            title: 'Reder geregistreerd',
            description: 'U heeft zich geregistreerd.',
            link: {
              title: 'Bekijk details',
              to: '/passagiers-en-beroepsvaart',
            },
          },
        ],
      },
    };
    expect(response).toStrictEqual(successResponse);
  });

  it('should show a notification for every zaak', async () => {
    const zaakInProgress = {
      ...exploitatieBase,
    } as unknown as VarenVergunningExploitatieType;

    const zaakMeerInformatieTermijn = {
      status: 'Meer informatie nodig',
      dateStart: '2025-01-17T00:00:00',
      dateEnd: '2025-01-30T00:00:00',
    };
    const zaakMeerInformatie = {
      ...exploitatieBase,
      termijnDates: [zaakMeerInformatieTermijn],
    } as unknown as VarenVergunningExploitatieType;

    const zaakDecision = {
      ...exploitatieBase,
      processed: true,
      dateDecision: '2025-01-20T00:00:00',
    } as unknown as VarenVergunningExploitatieType;

    vi.spyOn(decos, 'fetchDecosZaken').mockResolvedValueOnce(
      apiSuccessResult([zaakInProgress, zaakMeerInformatie, zaakDecision])
    );

    const response = await fetchVarenNotifications('x2', authProfileAndToken);
    const successResponse = {
      status: 'OK',
      content: {
        notifications: [
          {
            themaID: 'VAREN',
            themaTitle: 'Passagiers- en beroepsvaart',
            id: 'varen-Z-25-0000001-inbehandeling-notification',
            title: 'Aanvraag Varen vergunning exploitatie in behandeling',
            description: 'Wij hebben uw aanvraag in behandeling genomen.',
            datePublished: zaakInProgress.dateRequest,
            link: {
              title: 'Bekijk details',
              to: '/passagiers-en-beroepsvaart/vergunning/varen-vergunning-exploitatie/Z-25-0000001',
            },
          },
          {
            themaID: 'VAREN',
            themaTitle: 'Passagiers- en beroepsvaart',
            id: 'varen-Z-25-0000001-meerinformatienodig-notification',
            title:
              'Meer informatie nodig omtrent uw Varen vergunning exploitatie aanvraag',
            description:
              'Er is meer informatie nodig om de aanvraag verder te kunnen verwerken.',
            datePublished: zaakMeerInformatieTermijn.dateStart,
            link: {
              title: 'Bekijk details',
              to: '/passagiers-en-beroepsvaart/vergunning/varen-vergunning-exploitatie/Z-25-0000001',
            },
          },
          {
            themaID: 'VAREN',
            themaTitle: 'Passagiers- en beroepsvaart',
            id: 'varen-Z-25-0000001-afgehandeld-notification',
            title: 'Aanvraag Varen vergunning exploitatie afgehandeld',
            description: 'Wij hebben uw aanvraag afgehandeld.',
            datePublished: zaakDecision.dateDecision,
            link: {
              title: 'Bekijk details',
              to: '/passagiers-en-beroepsvaart',
            },
          },
        ],
      },
    };
    expect(response).toStrictEqual(successResponse);
  });
});
