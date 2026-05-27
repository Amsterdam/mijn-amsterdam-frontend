import merge from 'lodash.merge';
import { useParams } from 'react-router';

import { ContactgegevenByTypeLabels } from './CommunicatieVoorkeuren-config.ts';
import type {
  ContactgegevenType,
  ContactgegevenFrontend,
  VerifyVerificationRequestResponse,
} from '../../../../../server/services/klantcontact/klantcontact-profieldienst-types.ts';
import {
  capitalizeFirstLetter,
  lowercaseFirstLetter,
} from '../../../../../universal/helpers/text.ts';
import { BFFApiUrls } from '../../../../config/api.ts';
import {
  sendFormPostRequest,
  useBffApi,
} from '../../../../hooks/api/useBffApi.ts';
import {
  useAppStateStore,
  type AppStateStore,
} from '../../../../hooks/useAppStateStore.ts';
import {
  themaConfig,
  type InstelAction,
} from '../KlantContact-thema-config.ts';

type UpdateProps = {
  contactgegeven: Partial<Omit<ContactgegevenFrontend, 'type'>> & {
    type: ContactgegevenType;
  };
  appState: AppStateStore;
};

function updateCommunicatievoorkeurState({
  contactgegeven,
  appState,
}: UpdateProps) {
  appState.setAppState(
    merge(
      { KLANT_CONTACT: appState.KLANT_CONTACT },
      {
        KLANT_CONTACT: {
          content: {
            communicatievoorkeuren: {
              standaardContactgegevens: {
                [contactgegeven.type]: contactgegeven,
              },
            },
          },
        },
      }
    )
  );
}

export function useSetCommunicatievoorkeur(
  onCallback: (
    contactgegeven: ContactgegevenFrontend | null,
    success: boolean
  ) => void
) {
  const appState = useAppStateStore();
  return useBffApi<ContactgegevenFrontend>(
    BFFApiUrls.KLANTCONTACT_CONTACTGEGEVEN_CREATE,
    {
      fetchImmediately: false,
      sendRequest: async (url, init) => {
        return sendFormPostRequest<ContactgegevenFrontend>(url, init).then(
          (response) => {
            if (response.content?.id) {
              updateCommunicatievoorkeurState({
                contactgegeven: response.content,
                appState,
              });
            }
            onCallback(response.content ?? null, true);
            return response;
          }
        );
      },
    }
  );
}

export function useVerifyCommunicatievoorkeur(
  onCallback: (verified: boolean) => void
) {
  const appState = useAppStateStore();
  return useBffApi<
    VerifyVerificationRequestResponse,
    { type: ContactgegevenType; value: string; code: string }
  >(BFFApiUrls.KLANTCONTACT_CONTACTGEGEVEN_VERIFY, {
    fetchImmediately: false,
    sendRequest: async (url, init) => {
      return sendFormPostRequest<VerifyVerificationRequestResponse>(
        url,
        init
      ).then((response) => {
        const success = response.content?.verified ?? false;
        if (success && init?.payload) {
          updateCommunicatievoorkeurState({
            contactgegeven: {
              type: init.payload.type,
              isVerified: true,
              dateModified: new Date().toISOString(),
              dateModifiedFormatted: new Date().toLocaleDateString('nl-NL', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              }),
            },
            appState,
          });
        }
        onCallback(success);
        return response;
      });
    },
  });
}

export function useCommunicatieVoorkeurInstellen() {
  const params = useParams<{
    contactgegeven: ContactgegevenType;
    action: InstelAction;
    id?: string;
  }>();
  // const aangeslotenDiensten = communicatievoorkeuren?.aangeslotenDiensten ?? [];
  // const standaardContactgegevens =
  //   communicatievoorkeuren?.standaardContactgegevens ?? null;

  return {
    title: `${params.action ? capitalizeFirstLetter(params.action) : 'Instellen'} ${params.contactgegeven ? lowercaseFirstLetter(ContactgegevenByTypeLabels[params.contactgegeven] ?? '') : 'contactgegeven'}`,
    routeConfig: themaConfig.detailPageContactgegevenInstellen.route,
    contactgegevenType: params.contactgegeven,
  };
}

export function useCommunicatieVoorkeurVerwijderen(
  contactgegeven: ContactgegevenFrontend
) {
  const appState = useAppStateStore();
  return function handleDelete() {
    return sendFormPostRequest<ContactgegevenFrontend>(
      BFFApiUrls.KLANTCONTACT_CONTACTGEGEVEN_DELETE,
      {
        payload: {
          id: contactgegeven.id,
        },
      }
    ).then((response) => {
      if (response.status === 'OK') {
        updateCommunicatievoorkeurState({
          contactgegeven: {
            type: contactgegeven.type,
            value: null,
            id: null,
            dateModified: null,
            dateModifiedFormatted: null,
          },
          appState,
        });
      }
      return response;
    });
  };
}
