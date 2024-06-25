import { generatePath } from 'react-router-dom';
import slug from 'slugme';
import { AppRoutes } from '../../../universal/config';
import { apiSuccessResult } from '../../../universal/helpers';
import { VergunningV2 } from './config-and-types';
import { fetchDecosVergunningen } from './decos-service';
import { AuthProfileAndToken } from '../../helpers/app';
import { BFF_BASE_PATH, BffEndpoints } from '../../config';

function getStatusLineItems(vergunning: VergunningV2) {
  return [];
}

export async function fetchVergunningenV2(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken
) {
  const response = await fetchDecosVergunningen(requestID, authProfileAndToken);
  if (response.status === 'OK') {
    const vergunningenFrontend = response.content.map((vergunning) => {
      return {
        ...vergunning,
        steps: getStatusLineItems(vergunning),
        // TODO: Use generateFullApiUrlBFF when https://github.com/Amsterdam/mijn-amsterdam-frontend/pull/1314 makes it into main.
        fetchUrl: `${process.env.BFF_OIDC_BASE_URL}${generatePath(
          `${BFF_BASE_PATH}${BffEndpoints.VERGUNNINGEN_DETAIL}`,
          {
            id: vergunning.id,
          }
        )}`,
        link: {
          to: generatePath(AppRoutes['VERGUNNINGEN/DETAIL'], {
            title: slug(vergunning.caseType, {
              lower: true,
            }),
            id: vergunning.id,
          }),
          title: `Bekijk hoe het met uw aanvraag staat`,
        },
      };
    });
    return apiSuccessResult(vergunningenFrontend);
  }

  return response;
}
