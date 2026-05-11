import { Icon } from '@amsterdam/design-system-react';
import { CheckmarkIcon } from '@amsterdam/design-system-react-icons';

import type { CommunicatievoorkeurFrontend } from './CommunicatieVoorkeuren-config';
import { useCommunicatieVoorkeurDetail } from './useCommunicatieVoorkeuren';
import { getFullAddress } from '../../../../../universal/helpers/brp';
import { Datalist } from '../../../../components/Datalist/Datalist';
import { MaButtonInline } from '../../../../components/MaLink/MaLink';
import { PageContentCell } from '../../../../components/Page/Page';
import { TableV2 } from '../../../../components/Table/TableV2';
import ThemaDetailPagina from '../../../../components/Thema/ThemaDetailPagina';
import { useAppStateGetter } from '../../../../hooks/useAppState';
import { useHTMLDocumentTitle } from '../../../../hooks/useHTMLDocumentTitle';

function CommunicatievoorkeurInstellen({
  voorkeur,
}: {
  voorkeur: CommunicatievoorkeurFrontend;
}) {
  return (
    <TableV2
      items={voorkeur.medium_}
      displayProps={{
        props: {
          isActive_: 'Actief',
          name: 'Voorkeur',
          value_: 'Instelling',
        },
      }}
    />
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

  const { BRP } = useAppStateGetter();

  const rows = [
    {
      label: 'Afdeling gemeente',
      content: voorkeur?.stakeholder,
    },
    {
      label: 'Onderwerp',
      content: voorkeur?.title,
    },
  ];

  const voorkeur_: CommunicatievoorkeurFrontend | null = voorkeur
    ? {
        ...voorkeur,
        medium_: voorkeur?.medium.map((item) => ({
          ...item,
          value_: item.value ? (
            <span>
              {item.value}&nbsp;&nbsp;
              <MaButtonInline onClick={() => {}}>Wijzigen</MaButtonInline>
            </span>
          ) : (
            <span>
              {item.name === 'brieven per post' && item.isActive ? (
                <>
                  {BRP.content?.adres
                    ? getFullAddress(BRP.content?.adres)
                    : 'Mijn adres'}
                  &nbsp;&nbsp;
                </>
              ) : (
                ''
              )}

              <MaButtonInline onClick={() => {}}>
                {item.name === 'brieven per post' && item.isActive
                  ? 'Wijzigen'
                  : 'Instellen'}
              </MaButtonInline>
            </span>
          ),
          isActive_: item.isActive ? <Icon svg={CheckmarkIcon} /> : 'Nee',
        })),
      }
    : null;

  return (
    <ThemaDetailPagina<CommunicatievoorkeurFrontend>
      title={title}
      themaId={themaId}
      zaak={voorkeur_}
      isError={isError}
      isLoading={isLoading}
      breadcrumbs={breadcrumbs}
      pageContentMain={
        <PageContentCell>
          <Datalist rows={rows} />
          {!!voorkeur_ && (
            <CommunicatievoorkeurInstellen voorkeur={voorkeur_} />
          )}
        </PageContentCell>
      }
    />
  );
}
