import type { ReactNode } from 'react';

import type {
  Communicatievoorkeur,
  CommunicatieMedium,
} from '../../../../../server/services/contact/contact.types';
import type { DisplayProps } from '../../../../components/Table/TableV2.types';

export const VERIFICATION_CODE_LENGTH = 5;

export const communicatieVoorkeurenTitle = 'Alle communicatievoorkeuren';
export const communicatieVoorkeurDetailTitle = 'Voorkeur';
export const communicatieVoorkeurInstellenTitle = 'Instellen';

type CommunicatieMediumFrontend = CommunicatieMedium & {
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
      medium: 'Uw voorkeur',
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
