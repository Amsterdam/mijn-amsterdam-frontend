import { apiDependencyError, apiSuccessResult } from '../../universal/helpers';
import { getApiConfig } from '../config';
import { requestData } from '../helpers';
import { dateSort } from '../../universal/helpers/date';
import { generatePath } from 'react-router-dom';
import { AppRoutes } from '../../universal/config/routes';
import { LinkProps, GenericDocument } from '../../universal/types/App.types';
import { hash } from '../../universal/helpers/utils';
import { AuthProfileAndToken } from '../helpers/app';

interface AkteFromSource {
  aktenummer: string;
  registerjaar: string;
  documenten: string[];
  type:
    | 'Huwelijksakte'
    | 'Akte van geregistreerd partnerschap'
    | 'Geboorteakte';
}

export interface AKTESDataFromSource {
  content: {
    isKnown: boolean;
    aktes: AkteFromSource[];
  };
}

export interface Akte extends AkteFromSource {
  id: string;
  link: LinkProps;
  documents: GenericDocument[];
}

export type AKTESData = Akte[];

export function transformAKTESData(
  responseData: AKTESDataFromSource
): AKTESData {
  return responseData?.content?.aktes
    .sort(dateSort('registerjaar', 'desc'))
    .map((akte) => {
      const id = hash(akte.aktenummer);
      return {
        ...akte,
        id,
        link: {
          to: generatePath(AppRoutes['BURGERZAKEN/AKTE'], {
            id,
          }),
          title: akte.type,
        },
        documents: akte.documenten.map((document) => {
          return {
            id: `document-${id}`,
            datePublished: '',
            title: akte.type,
            url: document,
            type: 'pdf',
          };
        }),
      };
    });
}

export async function fetchAKTES(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken
) {
  const options = getApiConfig('AKTES', {
    transformResponse: transformAKTESData,
  });

  return requestData<AKTESData>(options, requestID, authProfileAndToken);
}

function transformAKTESNotifications(aktes: AKTESData, compareDate: Date) {
  return [];
}

export async function fetchAKTESGenerated(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken
) {
  const AKTES = await fetchAKTES(requestID, authProfileAndToken);

  if (AKTES.status === 'OK') {
    return apiSuccessResult({
      notifications: transformAKTESNotifications(AKTES.content, new Date()),
    });
  }

  return apiDependencyError({ AKTES });
}
