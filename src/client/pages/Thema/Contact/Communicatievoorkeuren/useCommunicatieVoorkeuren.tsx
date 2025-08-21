import { generatePath, useParams } from 'react-router';
import { atom, useRecoilValue } from 'recoil';

import type { Communicatievoorkeur } from '../../../../../server/services/contact/contact.types';
import { addLinkElementToProperty } from '../../../../components/Table/TableV2';
import { useThemaBreadcrumbs } from '../../../../hooks/useThemaMenuItems';
import { featureToggle, routeConfig, themaId } from '../Contact-thema-config';
import {
  communicatieVoorkeurDetailTitle,
  communicatievoorkeurenDisplayProps,
  communicatieVoorkeurenTitle,
} from './CommunicatieVoorkeuren-config';
import { uniqueArray } from '../../../../../universal/helpers/utils';

const voorkeurenBE: Communicatievoorkeur[] = [
  {
    id: '1',
    stakeholder: 'Zorg en ondersteuning (WMO)',
    title: 'Informatie over uw aanvragen en voorzieningen',
    description: '',
    medium: [
      { name: 'e-mail', isActive: true, value: null },
      {
        name: 'sms',
        isActive: false,
        value: null,
        description:
          'U krijgt een sms bericht over de voortgang van uw aanvraag voor voorzieningen.',
      },
      {
        name: 'brieven per post',
        isActive: false,
        value: 'Het Amstelplein 32-H',
      },
    ],
    isActive: true,
    link: {
      title: `Stel communicatievoorkeur in`,
      to: generatePath(routeConfig.detailPageCommunicatievoorkeur.path, {
        id: '1',
      }),
    },
  },
  {
    id: '2',
    stakeholder: 'Erfpacht',
    title: 'Factuurspecificaties',
    description: 'Omschrijving 2',
    medium: [
      { name: 'e-mail', isActive: true, value: null },
      { name: 'sms', isActive: false, value: null },
      { name: 'brieven per post', isActive: true, value: null },
    ],
    isActive: true,
    link: {
      title: `Stel communicatievoorkeur in`,
      to: generatePath(routeConfig.detailPageCommunicatievoorkeur.path, {
        id: '2',
      }),
    },
  },
  {
    id: '3',
    stakeholder: 'Erfpacht',
    title: 'Informatie over uw Erfpacht dossiers',
    description: 'Omschrijving 2',
    medium: [
      { name: 'e-mail', isActive: false, value: null },
      { name: 'sms', isActive: true, value: '0612345678' },
    ],
    isActive: true,
    link: {
      title: `Stel communicatievoorkeur in`,
      to: generatePath(routeConfig.detailPageCommunicatievoorkeur.path, {
        id: '3',
      }),
    },
  },
];

export const voorkeurenAtom = atom<Communicatievoorkeur[]>({
  key: 'communicatievoorkeuren',
  default: voorkeurenBE,
});

export function useCommunicatievoorkeuren() {
  const voorkeurenBE = useRecoilValue(voorkeurenAtom);
  const voorkeuren_ = voorkeurenBE.map((voorkeur) => {
    return {
      ...voorkeur,
      medium: voorkeur.medium
        .filter((mediumItem) => mediumItem.isActive)
        .map((medium) => medium.name)
        .join(', '),
    };
  });

  const voorkeuren = addLinkElementToProperty(
    voorkeuren_ ?? [],
    'title',
    true,
    (voorkeur) =>
      `Stel uw voorkeur voor communicatie over ${voorkeur.stakeholder} ${voorkeur.title} in`
  );

  return {
    themaId,
    voorkeuren,
    featureToggle,
    displayProps: communicatievoorkeurenDisplayProps,
    title: communicatieVoorkeurenTitle,
    routeConfig,
    isError: false,
    isLoading: false,
  };
}

export function useCommunicatieVoorkeurDetail() {
  const { themaId, isError, isLoading } = useCommunicatievoorkeuren();
  const voorkeurenBE = useRecoilValue(voorkeurenAtom);
  const params = useParams<{ id: string }>();
  const voorkeur =
    voorkeurenBE.find((voorkeur) => voorkeur.id === params.id) ?? null;

  const breadcrumbs = useThemaBreadcrumbs(themaId);

  return {
    title: `${communicatieVoorkeurDetailTitle} ${voorkeur?.stakeholder ?? ''}`,
    themaId,
    voorkeur,
    isError,
    isLoading,
    breadcrumbs,
    routeConfig,
  };
}

export function useCommunicatieVoorkeurInstellen() {
  const { voorkeur, breadcrumbs, themaId, isError, isLoading } =
    useCommunicatieVoorkeurDetail();
  const voorkeurenBE = useRecoilValue(voorkeurenAtom);
  const params = useParams<{ medium: string }>();
  const medium =
    voorkeur?.medium.find((medium) => medium.name === params.medium) ?? null;
  const breadcrumbs_ = [
    ...breadcrumbs,
    {
      title: `${communicatieVoorkeurDetailTitle} ${voorkeur?.stakeholder}`,
      to: generatePath(routeConfig.detailPageCommunicatievoorkeur.path, {
        id: voorkeur?.id,
      }),
    },
  ];

  function getMediumValues(mediumName: string): string[] {
    const items = voorkeurenBE.flatMap((voorkeur) =>
      voorkeur?.medium
        .filter((medium) => medium.name === mediumName)
        .map((medium) => medium.value)
        .filter((x) => x !== null)
    );
    return uniqueArray(items);
  }

  const emails: string[] = getMediumValues('e-mail');
  const phoneNumbers: string[] = getMediumValues('sms');

  return {
    title: `Instellen ${medium?.name}`,
    themaId,
    voorkeur,
    medium,
    isError,
    isLoading,
    breadcrumbs: breadcrumbs_,
    routeConfig,
    emails,
    phoneNumbers,
  };
}
