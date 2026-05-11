import { useParams } from 'react-router';

import {
  communicatievoorkeurenDisplayProps,
  communicatieVoorkeurenTitle,
} from './CommunicatieVoorkeuren-config.ts';
import type {
  CommunicatievoorkeurPayloadFrontend,
  SetCommunicatievoorkeurResponseFrontend,
} from '../../../../../server/services/contact/contact-profieldienst-types.ts';
import type {
  CommunicatievoorkeurenResponseFrontend,
  MediumType,
} from '../../../../../server/services/contact/contact-profieldienst-types.ts';
import {
  sendFormPostRequest,
  useBffApi,
} from '../../../../hooks/api/useBffApi.ts';
import { useThemaBreadcrumbs } from '../../../../hooks/useThemaMenuItems.ts';
import {
  featureToggle,
  routeConfig,
  themaId,
} from '../Contact-thema-config.ts';

export function useCommunicatievoorkeuren() {
  const { data } = useBffApi<CommunicatievoorkeurenResponseFrontend>(
    'http://localhost:5000/api/v1/services/contact/communicatievoorkeuren' // diensten.alles
  );
  const voorkeuren = data?.content?.voorkeuren ?? [];

  return {
    themaId,
    voorkeuren,
    defaultMediumsByType: data?.content?.defaultMediumsByType ?? null,
    featureToggle,
    displayProps: communicatievoorkeurenDisplayProps,
    title: communicatieVoorkeurenTitle,
    routeConfig,
    isError: false,
    isLoading: false,
  };
}

function useSetCommunicatievoorkeur() {
  return useBffApi<SetCommunicatievoorkeurResponseFrontend>(
    'http://localhost:5000/api/v1/services/contact/communicatievoorkeuren/set',
    {
      fetchImmediately: false,
      sendRequest: async (url, init) => {
        return sendFormPostRequest<SetCommunicatievoorkeurResponseFrontend>(
          url,
          init
        ).then((response) => {
          if (response.content?.success === true) {
            // update
          }
          return response;
        });
      },
    }
  );
}

export function useCommunicatieVoorkeurInstellen() {
  const { defaultMediumsByType, voorkeuren, isError, isLoading } =
    useCommunicatievoorkeuren();
  const { fetch: updateCommunicatievoorkeur } = useSetCommunicatievoorkeur();
  const breadcrumbs = useThemaBreadcrumbs(themaId);
  const params = useParams<{ medium: MediumType; id?: string }>();
  const voorkeur =
    voorkeuren.find((voorkeur) => voorkeur.id === params.id) ?? null;

  let medium =
    voorkeur?.settings.find((medium) => medium.type === params.medium) ?? null;
  // If the medium is not set in the voorkeur, use the default value if available
  if (!medium && params.medium) {
    medium = defaultMediumsByType?.[params.medium] ?? null;
  }

  return {
    title: `Instellen ${medium?.type ?? params.medium}`,
    themaId,
    breadcrumbs,
    voorkeur,
    medium,
    isError,
    isLoading,
    routeConfig,
    update(payload: CommunicatievoorkeurPayloadFrontend) {
      return updateCommunicatievoorkeur({ payload });
    },
  };
}
