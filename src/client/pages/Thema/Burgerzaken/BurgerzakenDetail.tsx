import { useBurgerZakenDetailData } from './useBurgerZakenDetailData.hook';
import type { IdentiteitsbewijsFrontend } from '../../../../server/services/profile/brp.types';
import { capitalizeFirstLetter } from '../../../../universal/helpers/text';
import { Datalist } from '../../../components/Datalist/Datalist';
import { PageContentCell } from '../../../components/Page/Page';
import ThemaDetailPagina from '../../../components/Thema/ThemaDetailPagina';
import { useHTMLDocumentTitle } from '../../../hooks/useHTMLDocumentTitle';

function BurgerzakenIdentiteitsbewijsContent({
  document,
}: {
  document: IdentiteitsbewijsFrontend;
}) {
  const rows = getRows(document);

  return (
    <PageContentCell>
      <Datalist rows={rows} />
    </PageContentCell>
  );
}

function getRows(document: IdentiteitsbewijsFrontend) {
  return [
    {
      label: 'Documentnummer',
      content: document.documentNummer,
    },
    {
      label: 'Datum uitgifte',
      content: document.datumUitgifteFormatted,
    },
    {
      label: 'Geldig tot',
      content: document.datumAfloopFormatted,
    },
  ];
}

export function BurgerzakenDetail() {
  const { document, isLoading, isError, breadcrumbs, routeConfig } =
    useBurgerZakenDetailData();
  useHTMLDocumentTitle(routeConfig.detailPage.documentTitle);

  return (
    <ThemaDetailPagina
      title={capitalizeFirstLetter(
        document?.documentType || 'Identiteitsbewijs'
      )}
      zaak={document}
      isError={isError}
      isLoading={isLoading}
      breadcrumbs={breadcrumbs}
      pageContentMain={
        !!document && (
          <BurgerzakenIdentiteitsbewijsContent document={document} />
        )
      }
    />
  );
}
