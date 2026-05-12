import { useParams } from 'react-router';

import {
  communicatievoorkeurenDisplayProps,
  communicatieVoorkeurenTitle,
  MediumByTypeLabels,
} from './CommunicatieVoorkeuren-config.ts';
import type {
  CommunicatievoorkeurPayloadFrontend,
  SetCommunicatievoorkeurResponseFrontend,
} from '../../../../../server/services/contact/contact-profieldienst-types.ts';
import type {
  CommunicatievoorkeurenResponseFrontend,
  ContactgegevenTypeFrontend,
} from '../../../../../server/services/contact/contact-profieldienst-types.ts';
import {
  capitalizeFirstLetter,
  lowercaseFirstLetter,
} from '../../../../../universal/helpers/text.ts';
import {
  sendFormPostRequest,
  useBffApi,
} from '../../../../hooks/api/useBffApi.ts';
import { useThemaBreadcrumbs } from '../../../../hooks/useThemaMenuItems.ts';
import {
  featureToggle,
  routeConfig,
  themaId,
  type InstelAction,
} from '../KlantContact-thema-config.ts';

export function useCommunicatievoorkeuren() {
  const { data, optimisticUpdateContent } =
    useBffApi<CommunicatievoorkeurenResponseFrontend>(
      'http://localhost:5000/api/v1/services/contact/communicatievoorkeuren' // diensten.alles
    );
  const voorkeuren = data?.content?.voorkeuren ?? [];

  return {
    themaId,
    voorkeuren,
    defaultMediumsByType:
      data?.content?.standaardContactvoorkeurPerType ?? null,
    featureToggle,
    displayProps: communicatievoorkeurenDisplayProps,
    title: communicatieVoorkeurenTitle,
    routeConfig,
    isError: false,
    isLoading: false,
    optimisticUpdateContent,
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
  const {
    defaultMediumsByType,
    voorkeuren,
    isError,
    isLoading,
    optimisticUpdateContent,
  } = useCommunicatievoorkeuren();
  const { fetch: updateCommunicatievoorkeur } = useSetCommunicatievoorkeur();
  const breadcrumbs = useThemaBreadcrumbs(themaId);
  const params = useParams<{
    medium: ContactgegevenTypeFrontend;
    action: InstelAction;
    id?: string;
  }>();
  const voorkeur =
    voorkeuren.find((voorkeur) => voorkeur.id === params.id) ?? null;

  let medium =
    voorkeur?.settings.find((medium) => medium.type === params.medium) ?? null;
  // If the medium is not set in the voorkeur, use the default value if available
  if (!medium && params.medium) {
    medium = defaultMediumsByType?.[params.medium] ?? null;
  }

  return {
    title: `${params.action ? capitalizeFirstLetter(params.action) : 'Instellen'} ${lowercaseFirstLetter(MediumByTypeLabels[medium?.type ?? (params.medium as ContactgegevenTypeFrontend)] ?? '')}`,
    themaId,
    breadcrumbs,
    voorkeur,
    medium,
    isError,
    isLoading,
    routeConfig,
    update(payload: CommunicatievoorkeurPayloadFrontend) {
      if (defaultMediumsByType) {
        optimisticUpdateContent({
          voorkeuren,
          standaardContactvoorkeurPerType: {
            ...defaultMediumsByType,
            [payload.type]: {
              ...defaultMediumsByType[payload.type],
              value: payload.value,
              isValidated: true,
            },
          },
        });
      }
      return updateCommunicatievoorkeur({ payload });
    },
  };
}
