import { Checkbox, Paragraph } from '@amsterdam/design-system-react';
import { generatePath, useNavigate } from 'react-router';
import { useSetRecoilState } from 'recoil';

import {
  communicatievoorkeurInstellenDisplayProps,
  type CommunicatievoorkeurFrontend,
} from './CommunicatieVoorkeuren-config';
import { EmailValue } from './EmailVoorkeur';
import {
  useCommunicatieVoorkeurDetail,
  voorkeurenAtom,
} from './useCommunicatieVoorkeuren';
import type {
  CommunicatieMedium,
  Communicatievoorkeur,
} from '../../../../../server/services/contact/contact.types';
import { Datalist } from '../../../../components/Datalist/Datalist';
import { PageContentCell } from '../../../../components/Page/Page';
import { TableV2 } from '../../../../components/Table/TableV2';
import ThemaDetailPagina from '../../../../components/Thema/ThemaDetailPagina';
import { useHTMLDocumentTitle } from '../../../../hooks/useHTMLDocumentTitle';
import { routeConfig } from '../Contact-thema-config';

type MediumValueProps = {
  medium: CommunicatieMedium;
  voorkeur: Communicatievoorkeur;
};

function MediumValue({ medium, voorkeur }: MediumValueProps) {
  const navigate = useNavigate();

  switch (medium.name) {
    case 'e-mail':
      return (
        <EmailValue
          onClick={() =>
            navigate(
              generatePath(
                routeConfig.detailPageCommunicatievoorkeurInstellen.path,
                { medium: medium.name, id: voorkeur.id, step: '1' }
              )
            )
          }
          medium={medium}
        />
      );
    // Add more cases for other communication mediums
    case 'brieven per post':
      // return <PostalMailSettingModal medium={medium} />;
      return '<PostalMailSettingModal medium={medium} />';
    case 'sms':
      // return <SmsSettingModal medium={medium} />;
      return '<SmsSettingModal medium={medium} />';
    default:
      return null;
  }
}

function CommunicatievoorkeurInstellen({
  voorkeur,
}: {
  voorkeur: Communicatievoorkeur;
}) {
  const setVoorkeurenBE = useSetRecoilState(voorkeurenAtom);
  const voorkeur_: CommunicatievoorkeurFrontend | null = voorkeur
    ? {
        ...voorkeur,
        medium_: voorkeur?.medium.map((medium) => ({
          ...medium,
          value_: <MediumValue voorkeur={voorkeur} medium={medium} />,
          isActive_: (
            <Checkbox
              title={
                medium.isActive
                  ? 'Klik om uit te schakelen'
                  : 'Klik om in te schakelen'
              }
              onChange={(x) => {
                setVoorkeurenBE((voorkeuren) => {
                  return [...voorkeuren].map((v) => {
                    if (v.id === voorkeur.id) {
                      return {
                        ...v,
                        medium: v.medium.map((m) => {
                          if (m.name === medium.name) {
                            const isActive = !m.isActive;
                            return {
                              ...m,
                              isActive,
                            };
                          }
                          return m;
                        }),
                      };
                    }
                    return v;
                  });
                });
              }}
              checked={medium.isActive}
            />
          ),
        })),
      }
    : null;

  return voorkeur_ ? (
    <TableV2
      items={voorkeur_.medium_}
      displayProps={communicatievoorkeurInstellenDisplayProps}
    />
  ) : (
    <Paragraph>Geen communicatievoorkeuren in te stellen.</Paragraph>
  );
}

export function CommunicatievoorkeurDetail() {
  const {
    themaId,
    voorkeur,
    title,
    isError,
    isLoading,
    breadcrumbs,
    routeConfig,
  } = useCommunicatieVoorkeurDetail();

  useHTMLDocumentTitle(routeConfig.detailPageCommunicatievoorkeur);

  const rows = [
    // {
    //   label: 'Afdeling gemeente',
    //   content: voorkeur?.stakeholder,
    // },
    {
      label: 'Onderwerp',
      content: voorkeur?.title,
    },
  ];

  return (
    <ThemaDetailPagina<Communicatievoorkeur>
      title={title}
      themaId={themaId}
      zaak={voorkeur}
      isError={isError}
      isLoading={isLoading}
      breadcrumbs={breadcrumbs}
      pageContentMain={
        <PageContentCell>
          <Datalist rows={rows} />
          {!!voorkeur && <CommunicatievoorkeurInstellen voorkeur={voorkeur} />}
        </PageContentCell>
      }
    />
  );
}
