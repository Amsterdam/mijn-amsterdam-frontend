import type { ReactNode } from 'react';

import type {
  Communicatievoorkeur,
  CommunicatieMediumSetting,
} from '../../../../../server/services/contact/contact.types';
import type { DisplayProps } from '../../../../components/Table/TableV2.types';

export const VERIFICATION_CODE_LENGTH = 5;

export const communicatieVoorkeurenTitle = 'Alle communicatievoorkeuren';
export const communicatieVoorkeurDetailTitle = 'Voorkeur';
export const communicatieVoorkeurInstellenTitle = 'Instellen';

type CommunicatieMediumFrontend = CommunicatieMediumSetting & {
  isActive_: ReactNode;
  value_: ReactNode;
};

export type CommunicatievoorkeurFrontend = Communicatievoorkeur & {
  medium_: CommunicatieMediumFrontend[];
};

export const communicatievoorkeurenDisplayProps: DisplayProps<CommunicatievoorkeurFrontend> =
  {
    props: {
      stakeholder: 'Afdeling gemeente',
      detailLinkComponent: 'Onderwerp',
      settings: 'Uw voorkeur',
    },
  };

export const communicatievoorkeurInstellenDisplayProps: DisplayProps<CommunicatieMediumFrontend> =
  {
    props: {
      isActive_: 'Actief',
      name: 'Instelling',
      value_: 'Naar',
    },
  };

export const VoorkeurByTypeLabels = {
  email: 'E-mail',
  phone: 'SMS',
  postadres: 'Papier',
};

export const MediumByTypeLabels = {
  email: 'E-mailadres',
  phone: 'Telefoonnummer',
  postadres: 'Postadres',
};
