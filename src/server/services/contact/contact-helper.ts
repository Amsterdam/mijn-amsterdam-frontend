import type { CommunicatievoorkeurPayloadSource, IdentificatieType } from './contact-profieldienst-types.ts';

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
