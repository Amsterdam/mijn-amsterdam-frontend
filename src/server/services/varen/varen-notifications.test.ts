import MockDate from 'mockdate';
import { describe, expect, it } from 'vitest';

import {
  VarenRegistratieRederType,
  ZaakVergunningExploitatieType,
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
  decision: null,
  processed: false,
  dateRequest: '2025-01-01T00:00:00',
  statusDates: [],
  termijnDates: [],
} satisfies Partial<ZaakVergunningExploitatieType>;
const exploitatieBase =
  exploitatieBase_ as unknown as ZaakVergunningExploitatieType;

describe('Notifications', () => {
  const authProfileAndToken = getAuthProfileAndToken();

  MockDate.set('2025-01-20');

  it('should respond with an error response if fetchDecosZaken returns an error', async () => {
    vi.spyOn(decos, 'fetchDecosZaken').mockResolvedValueOnce(
      apiErrorResult('Error', null)
    );

    const response = await fetchVarenNotifications(authProfileAndToken);
    const errorResponse = {
      content: null,
      message: '[VAREN] Failed dependencies',
      status: 'DEPENDENCY_ERROR',
    };
    expect(response).toStrictEqual(errorResponse);
  });

  it('should only show most recent notification for every zaak', async () => {
    const zaakRecent = exploitatieBase;

    const zaakOlderThen3Months = {
      ...exploitatieBase,
      dateRequest: '2024-09-01T00:00:00',
    };

    vi.spyOn(decos, 'fetchDecosZaken')
      .mockResolvedValueOnce(apiSuccessResult([]))
      .mockResolvedValueOnce(
        apiSuccessResult([zaakRecent, zaakOlderThen3Months])
      )
      .mockResolvedValueOnce(apiSuccessResult([]));

    const { content } = await fetchVarenNotifications(authProfileAndToken);

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
    } satisfies Partial<VarenRegistratieRederType>;
    const rederRegistratie =
      rederRegistratie_ as unknown as VarenRegistratieRederType;

    vi.spyOn(decos, 'fetchDecosZaken')
      .mockResolvedValueOnce(apiSuccessResult([rederRegistratie]))
      .mockResolvedValue(apiSuccessResult([]));
    const response = await fetchVarenNotifications(authProfileAndToken);
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
    } as unknown as ZaakVergunningExploitatieType;

    const zaakMeerInformatieTermijn = {
      status: 'Meer informatie nodig',
      dateStart: '2025-01-17T00:00:00',
      dateEnd: '2025-01-30T00:00:00',
    };
    const zaakMeerInformatie = {
      ...exploitatieBase,
      termijnDates: [zaakMeerInformatieTermijn],
    } as unknown as ZaakVergunningExploitatieType;

    const zaakDecision = {
      ...exploitatieBase,
      processed: true,
      dateDecision: '2025-01-20T00:00:00',
    } as unknown as ZaakVergunningExploitatieType;

    vi.spyOn(decos, 'fetchDecosZaken')
      .mockResolvedValueOnce(apiSuccessResult([]))
      .mockResolvedValueOnce(
        apiSuccessResult([zaakInProgress, zaakMeerInformatie, zaakDecision])
      )
      .mockResolvedValueOnce(apiSuccessResult([]));

    const response = await fetchVarenNotifications(authProfileAndToken);
    const successResponse = {
      status: 'OK',
      content: {
        notifications: [
          {
            themaID: 'VAREN',
            themaTitle: 'Passagiers- en beroepsvaart',
            id: 'varen-Z-25-0000001-inbehandeling-notification',
            title: 'Aanvraag Varen vergunning exploitatie in behandeling',
            description:
              'Wij hebben uw aanvraag Varen vergunning exploitatie voor vaartuig boatName in behandeling genomen.',
            datePublished: zaakInProgress.dateRequest,
            link: {
              title: 'Bekijk details',
              to: '/passagiers-en-beroepsvaart/vergunningen/varen-vergunning-exploitatie/Z-25-0000001',
            },
          },
          {
            themaID: 'VAREN',
            themaTitle: 'Passagiers- en beroepsvaart',
            id: 'varen-Z-25-0000001-meerinformatienodig-notification',
            title:
              'Meer informatie nodig omtrent uw Varen vergunning exploitatie aanvraag',
            description:
              'Wij hebben meer informatie nodig om uw aanvraag Varen vergunning exploitatie voor vaartuig boatName verder te kunnen verwerken.',
            datePublished: zaakMeerInformatieTermijn.dateStart,
            link: {
              title: 'Bekijk details',
              to: '/passagiers-en-beroepsvaart/vergunningen/varen-vergunning-exploitatie/Z-25-0000001',
            },
          },
          {
            themaID: 'VAREN',
            themaTitle: 'Passagiers- en beroepsvaart',
            id: 'varen-Z-25-0000001-afgehandeld-notification',
            title: 'Aanvraag Varen vergunning exploitatie afgehandeld',
            description:
              'Wij hebben uw aanvraag Varen vergunning exploitatie voor vaartuig boatName afgehandeld.',
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
