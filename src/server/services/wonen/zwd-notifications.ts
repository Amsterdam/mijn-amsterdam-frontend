import { fetchVVEData } from './zwd.ts';
import type { VveCaseDetail } from './zwd.types.ts';
import { themaConfig } from '../../../client/apps/bob/pages/Thema/Profile/Profile-thema-config.ts';
import {
  apiSuccessResult,
  type ApiResponse,
} from '../../../universal/helpers/api.ts';
import { lowercaseFirstLetter } from '../../../universal/helpers/text.ts';
import type { MyNotification } from '../../../universal/types/App.types.ts';
import type { AuthProfileAndToken } from '../../auth/auth-types.ts';

export function transformZWDCasesToNotifications(
  cases: VveCaseDetail[]
): MyNotification[] {
  return cases
    .filter((zaak) => zaak.adviceType === 'Energieadvies')
    .map((zaak) => {
      const zaakStatusText = lowercaseFirstLetter(zaak.status);

      return {
        id: `wonen-zwd-${zaak.id}-notification`,
        themaID: themaConfig.BRP.id,
        themaTitle: themaConfig.BRP.title,
        title: 'Aanvraag verduurzamingsadvies VVE ' + zaakStatusText,
        description:
          'Wij hebben de aanvraag voor verduurzamingsadvies van de VVE ' +
          zaak.homeownerAssociation.name +
          ' ' +
          zaakStatusText,
        datePublished: zaak.datePublished,
        link: {
          to: themaConfig.BRP.detailPageVvE.route.path,
          title: 'Bekijk uw aanvraag',
        },
      };
    });
}

export async function fetchZWDNotifications(
  authProfileAndToken: AuthProfileAndToken
): Promise<ApiResponse<{ notifications: MyNotification[] }>> {
  if (!themaConfig.BRP.featureToggle.enableZWDZaken) {
    return apiSuccessResult({ notifications: [] });
  }

  const vveResponse = await fetchVVEData(authProfileAndToken);

  if (vveResponse.status !== 'OK') {
    return vveResponse;
  }

  return apiSuccessResult({
    notifications: vveResponse.content
      ? transformZWDCasesToNotifications(vveResponse.content.cases)
      : [],
  });
}

export const forTesting = {
  transformZWDCasesToNotifications,
};
