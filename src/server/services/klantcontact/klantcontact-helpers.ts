import type { ContactgegevenType } from './klantcontact-communicatievoorkeuren.ts';
import type {
  CommunicatievoorkeurPayloadSource,
  ContactProfieldienstResponseSource,
  IdentificatieType,
} from './klantcontact-profieldienst-types.ts';
import type { CreateVerificationRequestPayload } from './klantcontact-verify.types.ts';
import type { ApiResponse } from '../../../universal/helpers/api.ts';
import { toDateFormatted } from '../../../universal/helpers/date.ts';

const identificatieTypeByProfileType: Record<
  ProfileType,
  CommunicatievoorkeurPayloadSource['scope']['scopeIdentificatieType']
> = {
  private: 'BSN',
  commercial: 'KVK',
  'private-attributes': 'BSN',
};

export function getProfileType(
  profileType: 'private' | 'commercial' | 'private-attributes'
): IdentificatieType {
  return identificatieTypeByProfileType[profileType];
}

export const payloadTypeByMediumType = {
  email: 'Email',
  phone: 'Telefoonnummer',
  app: 'AppId',
  postadres: 'Adres',
  berichtenbox: null,
} as const satisfies Partial<
  Record<ContactgegevenType, CreateVerificationRequestPayload['type'] | null>
>;

export function getMostRecentByContactgegevenType(
  profiel: ApiResponse<ContactProfieldienstResponseSource>,
  contactgegevenType: ContactgegevenType
) {
  if (profiel.status !== 'OK') {
    return {
      type: contactgegevenType,
      value: null,
      isValidated: false,
      dateModified: null,
      dateModifiedFormatted: null,
    };
  }
  const contactgegeven = profiel.content.contactgegevens
    .sort((a, b) => String(b.lastUpdated).localeCompare(String(a.lastUpdated)))
    .sort((a, b) => Number(b.isGeverifieerd) - Number(a.isGeverifieerd))
    .find(
      (contact) => contact.type === payloadTypeByMediumType[contactgegevenType]
    );

  return {
    type: contactgegevenType,
    value: contactgegeven?.waarde || null,
    isValidated: contactgegeven?.isGeverifieerd || false,
    dateModified: contactgegeven?.lastUpdated || null,
    dateModifiedFormatted: toDateFormatted(contactgegeven?.lastUpdated),
  };
}
