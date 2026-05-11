import { useParams } from 'react-router';
import { atom, useRecoilValue } from 'recoil';

import type {
  CommunicatieMedium,
  Communicatievoorkeur,
} from '../../../../../server/services/contact/contact.types';
import { useThemaBreadcrumbs } from '../../../../hooks/useThemaMenuItems';
import { featureToggle, routeConfig, themaId } from '../Contact-thema-config';
import {
  communicatieVoorkeurDetailTitle,
  communicatievoorkeurenDisplayProps,
  communicatieVoorkeurenTitle,
} from './CommunicatieVoorkeuren-config';
import { uniqueArray } from '../../../../../universal/helpers/utils';

const MEDIUM_TYPES = {
  EMAIL: 'email',
  PHONE: 'phone',
  POSTADRES: 'postadres',
} as const;

type MediumType = (typeof MEDIUM_TYPES)[keyof typeof MEDIUM_TYPES];

const mediumTypes = Object.values(MEDIUM_TYPES);

const voorkeurenBE: Communicatievoorkeur[] = [
  {
    id: '1',
    stakeholder: 'Zorg en ondersteuning (WMO)',
    description: 'Informatie over uw aanvragen en voorzieningen',
    settings: [
      { type: MEDIUM_TYPES.EMAIL, value: 'some@post.com' },
      {
        type: MEDIUM_TYPES.POSTADRES,
        value: 'Het Amstelplein 32-H',
      },
    ],
  },
  {
    id: '2',
    stakeholder: 'Erfpacht',
    description: 'Factuurspecificaties',
    settings: [
      { type: MEDIUM_TYPES.EMAIL, value: null },
      { type: MEDIUM_TYPES.POSTADRES, value: null },
      { type: MEDIUM_TYPES.PHONE, value: '0612345678' },
    ],
  },
  {
    id: '3',
    stakeholder: 'Erfpacht',
    description: 'Informatie over uw Erfpacht dossiers',
    settings: [
      { type: MEDIUM_TYPES.EMAIL, value: null },
      { type: MEDIUM_TYPES.POSTADRES, value: null },
    ],
  },
];

export const voorkeurenAtom = atom<Communicatievoorkeur[]>({
  key: 'communicatievoorkeuren',
  default: voorkeurenBE,
});

export function useCommunicatievoorkeuren() {
  const voorkeuren = useRecoilValue(voorkeurenAtom);
  const mediumsByType = voorkeuren.reduce(
    (acc, voorkeur) => {
      voorkeur.settings.forEach((medium) => {
        if (!acc[medium.type]) {
          acc[medium.type] = [];
        }
        if (medium.value) {
          acc[medium.type].push(medium);
        }
      });
      return acc;
    },
    {} as Record<MediumType, CommunicatieMedium[]>
  );

  console.log('mediumsByType', mediumsByType);

  const defaultMediumsByType = mediumTypes.reduce(
    (acc, type) => {
      const mediums = mediumsByType[type] || [];
      acc[type] =
        uniqueArray(mediums.map((m) => m.value)).length === 1
          ? mediums[0]
          : { type, value: null };
      return acc;
    },
    {} as Record<MediumType, CommunicatieMedium>
  );

  const mediums: CommunicatieMedium[] = Object.values(defaultMediumsByType);

  return {
    defaultMediumsByType,
    mediumsByType,
    themaId,
    voorkeuren,
    mediums,
    featureToggle,
    displayProps: communicatievoorkeurenDisplayProps,
    title: communicatieVoorkeurenTitle,
    routeConfig,
    isError: false,
    isLoading: false,
  };
}

export function useCommunicatieVoorkeurDetail() {
  const { themaId, isError, isLoading, defaultMediumsByType } =
    useCommunicatievoorkeuren();
  const voorkeurenBE = useRecoilValue(voorkeurenAtom);
  const params = useParams<{ id: string }>();
  const voorkeur =
    voorkeurenBE.find((voorkeur) => voorkeur.id === params.id) ?? null;

  console.log(voorkeur, params.id, voorkeurenBE);

  const breadcrumbs = useThemaBreadcrumbs(themaId);

  return {
    title: `${communicatieVoorkeurDetailTitle} ${voorkeur?.stakeholder ?? ''}`,
    themaId,
    voorkeur,
    isError,
    isLoading,
    breadcrumbs,
    routeConfig,
    defaultMediumsByType,
  };
}

export function useCommunicatieVoorkeurInstellen() {
  const {
    voorkeur,
    breadcrumbs,
    themaId,
    isError,
    isLoading,
    defaultMediumsByType,
  } = useCommunicatieVoorkeurDetail();
  const voorkeurenBE = useRecoilValue(voorkeurenAtom);
  const params = useParams<{ medium: MediumType }>();
  const medium =
    voorkeur?.settings.find((medium) => medium.type === params.medium) ?? null;

  return {
    title: `Instellen ${medium?.type ?? params.medium}`,
    themaId,
    voorkeur,
    medium,
    isError,
    isLoading,
    breadcrumbs,
    routeConfig,
    defaultMediumsByType,
    defaultValue: medium ? defaultMediumsByType[medium.type].value : null,
  };
}
