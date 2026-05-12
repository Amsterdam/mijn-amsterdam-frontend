import type { CommunicatievoorkeurFrontend } from '../../../../../server/services/contact/contact-profieldienst-types.ts';
import type { DisplayProps } from '../../../../components/Table/TableV2.types.ts';

export const VERIFICATION_CODE_LENGTH = 5;

export const communicatieVoorkeurenTitle = 'Alle communicatievoorkeuren';
export const communicatieVoorkeurDetailTitle = 'Voorkeur';
export const communicatieVoorkeurInstellenTitle = 'Instellen';

export const communicatievoorkeurenDisplayProps: DisplayProps<CommunicatievoorkeurFrontend> =
  {
    props: {
      dienstNaam: 'Afdeling gemeente',
      detailLinkComponent: 'Onderwerp',
      settings: 'Uw voorkeur',
    },
  };

export const VoorkeurByTypeLabels = {
  email: 'E-mail',
  phone: 'SMS',
  app: 'App',
  berichtenbox: 'Berichtenbox',
  postadres: 'Papier',
};

export const MediumByTypeLabels = {
  email: 'E-mailadres',
  phone: 'Mobiele telefoonnummer',
  app: 'Amsterdam App',
  berichtenbox: 'Berichtenbox',
  postadres: 'Postadres',
};

export const MAXIMUM_AGE_BEFORE_VALIDATION = 6; // in months
