import merge from 'lodash.merge';
import { useParams } from 'react-router';

import { ContactgegevenByTypeLabels } from './CommunicatieVoorkeuren-config.ts';
import type {
  ContactgegevenType,
  ContactgegevenFrontend,
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
  contactgegeven: ContactgegevenFrontend;
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
                [contactgegeven.type]: {
                  value: contactgegeven.value,
                  isValidated: contactgegeven.isValidated ?? false, // We can only set this to true after the validation step, but we want to optimistically update the UI immediately after the user sets a contactgegeven.
                  dateModified:
                    contactgegeven.dateModified ?? new Date().toISOString(),
                  dateModifiedFormatted:
                    contactgegeven.dateModifiedFormatted ??
                    new Date().toLocaleDateString('nl-NL', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    }),
                },
              },
            },
          },
        },
      }
    )
  );
}

function useSetCommunicatievoorkeur() {
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
            return response;
          }
        );
      },
    }
  );
}

export function useCommunicatieVoorkeurInstellen() {
  // const { communicatievoorkeuren } = useKlantcontactData();
  const { fetch: updateCommunicatievoorkeur } = useSetCommunicatievoorkeur();
  const params = useParams<{
    contactgegeven: ContactgegevenType;
    action: InstelAction;
    id?: string;
  }>();
  // const aangeslotenDiensten = communicatievoorkeuren?.aangeslotenDiensten ?? [];
  // const standaardContactgegevens =
  //   communicatievoorkeuren?.standaardContactgegevens ?? null;

  return {
    title: `${params.action ? capitalizeFirstLetter(params.action) : 'Instellen'} ${params.contactgegeven ? lowercaseFirstLetter(ContactgegevenByTypeLabels[params.contactgegeven]) : 'contactgegeven'}`,
    routeConfig: themaConfig.detailPageContactgegevenInstellen.route,
    contactgegevenType: params.contactgegeven,
    update(contactgegeven: { type: ContactgegevenType; value: string | null }) {
      return updateCommunicatievoorkeur({ payload: contactgegeven });
    },
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
