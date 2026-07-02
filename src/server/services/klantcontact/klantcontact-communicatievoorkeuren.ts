import { getMostRecentByContactgegevenType } from './klantcontact-helpers.ts';
import type {
  CommunicatievoorkeurenResponseFrontend,
  ContactgegevenType,
} from './klantcontact-profieldienst-types.ts';
import {
  fetchDienstverlener,
  fetchProfiel,
} from './klantcontact-profieldienst.ts';
import { featureToggle } from './klantcontact-service-config.ts';
import {
  apiErrorResult,
  apiPostponeResult,
  type ApiResponse,
  apiSuccessResult,
} from '../../../universal/helpers/api.ts';
import { getFullAddress } from '../../../universal/helpers/brp.ts';
import type { AuthProfileAndToken } from '../../auth/auth-types.ts';
import { fetchMyLocations } from '../bag/my-locations.ts';

export const ContactgegevenTypes = {
  Email: 'Email',
  Telefoonnummer: 'Telefoonnummer',
  ApplicatieId: 'ApplicatieId',
  Berichtenbox: 'Berichtenbox',
  Postadres: 'Postadres',
} as const satisfies Record<ContactgegevenType, ContactgegevenType>;

export const ContactgegevenTypeValues = Object.values(
  ContactgegevenTypes
) as readonly (typeof ContactgegevenTypes)[keyof typeof ContactgegevenTypes][];

export async function fetchCommunicatievoorkeuren(
  authProfileAndToken: AuthProfileAndToken
): Promise<ApiResponse<CommunicatievoorkeurenResponseFrontend>> {
  if (!featureToggle.communicatievoorkeuren) {
    return apiPostponeResult(null);
  }

  const [locationsResponse, profiel, dienstverlenerResponse] =
    await Promise.all([
      fetchMyLocations(authProfileAndToken),
      fetchProfiel(authProfileAndToken),
      fetchDienstverlener(authProfileAndToken),
    ]);

  if (
    locationsResponse.status !== 'OK' &&
    profiel.status !== 'OK' &&
    dienstverlenerResponse.status !== 'OK'
  ) {
    return apiErrorResult(
      'Ophalen van alle communicatievoorkeuren mislukt',
      null
    );
  }

  const email = getMostRecentByContactgegevenType(
    profiel,
    ContactgegevenTypes.Email
  );
  const phone = getMostRecentByContactgegevenType(
    profiel,
    ContactgegevenTypes.Telefoonnummer
  );
  const app = getMostRecentByContactgegevenType(
    profiel,
    ContactgegevenTypes.ApplicatieId
  );

  const standaardContactgegevens = {
    [ContactgegevenTypes.Email]: email,
    [ContactgegevenTypes.Telefoonnummer]: {
      ...phone,
      disabled: true,
    },
    [ContactgegevenTypes.ApplicatieId]: app,
    [ContactgegevenTypes.Postadres]: {
      id: null,
      type: ContactgegevenTypes.Postadres,
      dateModified: null,
      value: locationsResponse.content?.[0]?.address
        ? getFullAddress(locationsResponse.content?.[0]?.address)
        : null,
      dateModifiedFormatted: null,
    },
    // Berichtenbox wordt nog niet ondersteund in de profieldienst.
    [ContactgegevenTypes.Berichtenbox]: {
      id: null,
      type: ContactgegevenTypes.Berichtenbox,
      value: null,
      dateModified: null,
      dateModifiedFormatted: null,
      disabled: true,
    },
  };

  const aangeslotenDiensten = (
    dienstverlenerResponse.content?.diensten ?? []
  ).filter((dienst) => dienst.beschrijving !== 'Alles');

  return apiSuccessResult({
    aangeslotenDiensten,
    standaardContactgegevens,
  });
}
