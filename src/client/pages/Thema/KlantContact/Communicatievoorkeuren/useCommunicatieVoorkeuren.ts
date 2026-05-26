import { useParams } from 'react-router';

import { MediumByTypeLabels } from './CommunicatieVoorkeuren-config.ts';
import type {
  CommunicatievoorkeurPayloadFrontend,
  SetCommunicatievoorkeurResponseFrontend,
} from '../../../../../server/services/klantcontact/klantcontact-profieldienst-types.ts';
import type { ContactgegevenTypeFrontend } from '../../../../../server/services/klantcontact/klantcontact-profieldienst-types.ts';
import {
  capitalizeFirstLetter,
  lowercaseFirstLetter,
} from '../../../../../universal/helpers/text.ts';
import {
  sendFormPostRequest,
  useBffApi,
} from '../../../../hooks/api/useBffApi.ts';
import {
  themaConfig,
  type InstelAction,
} from '../KlantContact-thema-config.ts';
import { useKlantcontactData } from '../useKlantcontactData.hook.tsx';

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
  const { communicatievoorkeuren } = useKlantcontactData();
  const { fetch: updateCommunicatievoorkeur } = useSetCommunicatievoorkeur();
  const params = useParams<{
    medium: ContactgegevenTypeFrontend;
    action: InstelAction;
    id?: string;
  }>();

  const voorkeuren = communicatievoorkeuren?.voorkeuren ?? [];
  const aangeslotenDiensten = communicatievoorkeuren?.aangeslotenDiensten ?? [];
  const standaardContactvoorkeurPerType =
    communicatievoorkeuren?.standaardContactvoorkeurPerType ?? null;

  const voorkeur =
    voorkeuren.find((voorkeur) => voorkeur.id === params.id) ?? null;

  let medium =
    voorkeur?.settings.find((medium) => medium.type === params.medium) ?? null;
  // If the medium is not set in the voorkeur, use the default value if available
  if (!medium && params.medium) {
    medium = standaardContactvoorkeurPerType?.[params.medium] ?? null;
  }

  return {
    title: `${params.action ? capitalizeFirstLetter(params.action) : 'Instellen'} ${lowercaseFirstLetter(MediumByTypeLabels[medium?.type ?? (params.medium as ContactgegevenTypeFrontend)] ?? '')}`,
    voorkeur,
    medium,
    routeConfig: themaConfig.detailPageCommunicatievoorkeurInstellen.route,
    update(payload: CommunicatievoorkeurPayloadFrontend) {
      if (standaardContactvoorkeurPerType) {
        // optimisticUpdateContent({
        //   voorkeuren,
        //   aangeslotenDiensten,
        //   standaardContactvoorkeurPerType: {
        //     ...standaardContactvoorkeurPerType,
        //     [payload.type]: {
        //       ...standaardContactvoorkeurPerType[payload.type],
        //       value: payload.value,
        //       isValidated: true,
        //       dateModified: new Date().toISOString(),
        //       dateModifiedFormatted: defaultDateFormat(new Date()),
        //     },
        //   },
        // });
      }
      return updateCommunicatievoorkeur({ payload });
    },
  };
}
