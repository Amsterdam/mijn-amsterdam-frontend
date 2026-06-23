import type {
  ContactgegevenFrontend,
  ContactgegevenSource,
  ContactgegevenType,
  ContactProfieldienstResponseSource,
  IdentificatieType,
} from './klantcontact-profieldienst-types.ts';
import type { ApiResponse } from '../../../universal/helpers/api.ts';
import { toDateFormatted } from '../../../universal/helpers/date.ts';

const identificatieTypeByProfileType: Record<ProfileType, IdentificatieType> = {
  private: 'BSN',
  commercial: 'KVK',
  'private-attributes': 'BSN',
};

export function getIdentificatieType(
  profileType: 'private' | 'commercial' | 'private-attributes'
): IdentificatieType {
  return identificatieTypeByProfileType[profileType];
}

export function transformContactgegevenSource(
  contactgegeven: Partial<Omit<ContactgegevenSource, 'type'>> | null,
  contactgegevenType: ContactgegevenType
): ContactgegevenFrontend {
  return {
    id: contactgegeven?.id ?? null,
    type: contactgegevenType,
    value: contactgegeven?.waarde ?? null,
    isVerified: contactgegeven?.isGeverifieerd ?? false,
    dateModified: contactgegeven?.lastUpdated ?? null,
    dateModifiedFormatted: toDateFormatted(contactgegeven?.lastUpdated),
  };
}

export function getMostRecentByContactgegevenType(
  profiel: ApiResponse<ContactProfieldienstResponseSource>,
  contactgegevenType: ContactgegevenType
): ContactgegevenFrontend {
  const contactGegevenDefault = transformContactgegevenSource(
    null,
    contactgegevenType
  );

  if (profiel.status !== 'OK') {
    return contactGegevenDefault;
  }

  const contactgegeven = profiel.content.contactgegevens
    .toSorted((a, b) =>
      String(b.lastUpdated).localeCompare(String(a.lastUpdated))
    )
    .toSorted((a, b) => Number(b.isGeverifieerd) - Number(a.isGeverifieerd))
    .find((contact) => contact.type === contactgegevenType);

  return contactgegeven
    ? transformContactgegevenSource(contactgegeven, contactgegevenType)
    : contactGegevenDefault;
}
