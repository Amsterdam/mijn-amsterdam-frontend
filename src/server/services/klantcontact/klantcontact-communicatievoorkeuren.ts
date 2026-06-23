import { getMostRecentByContactgegevenType } from './klantcontact-helpers.ts';
import type { CommunicatievoorkeurenResponseFrontend } from './klantcontact-profieldienst-types.ts';
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

export const ContactgegevenType = {
  Email: 'Email',
  Telefoonnummer: 'Telefoonnummer',
  ApplicatieId: 'ApplicatieId',
  Berichtenbox: 'Berichtenbox',
  Postadres: 'Postadres',
} as const;

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
    ContactgegevenType.Email
  );
  const phone = getMostRecentByContactgegevenType(
    profiel,
    ContactgegevenType.Telefoonnummer
  );
  const app = getMostRecentByContactgegevenType(
    profiel,
    ContactgegevenType.ApplicatieId
  );

  const standaardContactgegevens = {
    [ContactgegevenType.Email]: email,
    [ContactgegevenType.Telefoonnummer]: {
      ...phone,
      disabled: true,
    },
    [ContactgegevenType.ApplicatieId]: app,
    [ContactgegevenType.Postadres]: {
      id: null,
      type: ContactgegevenType.Postadres,
      dateModified: null,
      value: locationsResponse.content?.[0]?.address
        ? getFullAddress(locationsResponse.content?.[0]?.address)
        : null,
      dateModifiedFormatted: null,
    },
    // Berichtenbox wordt nog niet ondersteund in de profieldienst.
    [ContactgegevenType.Berichtenbox]: {
      id: null,
      type: ContactgegevenType.Berichtenbox,
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
