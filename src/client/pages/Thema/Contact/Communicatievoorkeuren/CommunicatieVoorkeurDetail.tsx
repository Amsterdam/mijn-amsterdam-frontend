import { CommunicatievoorkeurInstellingen } from './CommunicatieVoorkeurInstellingen';
import { useCommunicatieVoorkeurDetail } from './useCommunicatieVoorkeuren';
import type { Communicatievoorkeur } from '../../../../../server/services/contact/contact.types';
import { Datalist } from '../../../../components/Datalist/Datalist';
import { PageContentCell } from '../../../../components/Page/Page';
import ThemaDetailPagina from '../../../../components/Thema/ThemaDetailPagina';
import { useHTMLDocumentTitle } from '../../../../hooks/useHTMLDocumentTitle';

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
        <PageContentCell spanWide={8}>
          {!!voorkeur && (
            <>
              <Datalist rows={rows} />
              <CommunicatievoorkeurInstellingen voorkeur={voorkeur} />
            </>
          )}
        </PageContentCell>
      }
    />
  );
}
