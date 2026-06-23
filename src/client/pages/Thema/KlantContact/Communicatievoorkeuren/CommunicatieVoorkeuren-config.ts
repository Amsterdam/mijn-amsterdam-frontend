import type { ContactgegevenType as ContactgegevenType_ } from '../../../../../server/services/klantcontact/klantcontact-profieldienst-types.ts';

export const VERIFICATION_CODE_LENGTH = 6;

export const communicatieVoorkeurenTitle = 'Alle communicatievoorkeuren';
export const communicatieVoorkeurDetailTitle = 'Voorkeur';
export const communicatieVoorkeurInstellenTitle = 'Instellen';

export const ContactgegevenByTypeLabels = {
  Email: 'E-mailadres',
  Telefoonnummer: 'Mobiele telefoonnummer',
  ApplicatieId: 'Amsterdam App',
  Berichtenbox: 'Berichtenbox',
  Postadres: 'Postadres',
} as const satisfies Record<ContactgegevenType_, string>;

export const ContactgegevenTypeEnum = {
  Email: 'Email',
  Telefoonnummer: 'Telefoonnummer',
  ApplicatieId: 'ApplicatieId',
  Berichtenbox: 'Berichtenbox',
  Postadres: 'Postadres',
} as const satisfies Record<ContactgegevenType_, ContactgegevenType_>;

export const MAXIMUM_AGE_BEFORE_VALIDATION = 6; // in months
