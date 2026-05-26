import { getMostRecentByContactgegevenType } from './klantcontact-helpers.ts';
import type { CommunicatievoorkeurenResponseFrontend } from './klantcontact-profieldienst-types.ts';
import {
  fetchDienstverlener,
  fetchProfiel,
} from './klantcontact-profieldienst.ts';
import { featureToggle } from './klantcontact-service-config.ts';
import {
  apiPostponeResult,
  type ApiResponse,
  apiSuccessResult,
} from '../../../universal/helpers/api.ts';
import { getFullAddress } from '../../../universal/helpers/brp.ts';
import type { AuthProfileAndToken } from '../../auth/auth-types.ts';
import { fetchMyLocations } from '../bag/my-locations.ts';

const ContactgegevenTypeFrontend = {
  EMAIL: 'email',
  PHONE: 'phone',
  APP: 'app',
  BERICHTENBOX: 'berichtenbox',
  POSTADRES: 'postadres',
} as const;

export type ContactgegevenType =
  (typeof ContactgegevenTypeFrontend)[keyof typeof ContactgegevenTypeFrontend];

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

  const email = getMostRecentByContactgegevenType(profiel, 'email');
  const phone = getMostRecentByContactgegevenType(profiel, 'phone');
  const app = getMostRecentByContactgegevenType(profiel, 'app');

  return apiSuccessResult({
    aangeslotenDiensten: (
      dienstverlenerResponse.content?.diensten ?? []
    ).filter((dienst) => dienst.beschrijving !== 'Alles'),
    standaardContactvoorkeurPerType: {
      email,
      phone: {
        ...phone,
        disabled: true,
      },
      app,
      postadres: {
        type: ContactgegevenTypeFrontend.POSTADRES,
        dateModified: null,
        value: locationsResponse.content?.[0]?.address
          ? getFullAddress(locationsResponse.content?.[0]?.address)
          : null,
        dateModifiedFormatted: null,
      },
      // Berichtenbox wordt nog niet ondersteund in de profieldienst.
      berichtenbox: {
        type: ContactgegevenTypeFrontend.BERICHTENBOX,
        value: null,
        dateModified: null,
        dateModifiedFormatted: null,
        disabled: true,
      },
    },
    // Voorkeuren worden nu nog niet gebruikt. We kunnen deze in de toekomst vullen op basis van de scopes die we ontvangen in het profiel.
    voorkeuren: [],
  });
}
