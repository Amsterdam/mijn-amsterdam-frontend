import { useBurgerZakenDetailData } from './useBurgerZakenDetailData.hook';
import type { IdentiteitsbewijsFrontend } from '../../../../server/services/profile/brp.types';
import { capitalizeFirstLetter } from '../../../../universal/helpers/text';
import { Datalist, Row } from '../../../components/Datalist/Datalist';
import { PageContentCell } from '../../../components/Page/Page';
import ThemaDetailPagina from '../../../components/Thema/ThemaDetailPagina';
import { getRedactedClass } from '../../../helpers/cobrowse';
import { useHTMLDocumentTitle } from '../../../hooks/useHTMLDocumentTitle';

function getRows(document: IdentiteitsbewijsFrontend): Row[] {
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

function BurgerzakenIdentiteitsbewijsContent({
  document,
  themaId,
}: {
  document: IdentiteitsbewijsFrontend;
  themaId: string;
}) {
  const redactedClass = getRedactedClass(themaId, 'content');
  const rows = getRows(document).map((r) => ({
    ...r,
    classNameContent: `${r.classNameContent ?? ''} ${redactedClass}`,
  }));

  return (
    <PageContentCell>
      <Datalist rows={rows} />
    </PageContentCell>
  );
}

export function BurgerzakenDetail() {
  const { document, isLoading, isError, themaId, breadcrumbs, routeConfig } =
    useBurgerZakenDetailData();
  useHTMLDocumentTitle(routeConfig.detailPage);

  return (
    <ThemaDetailPagina
      themaId={themaId}
      title={capitalizeFirstLetter(
        document?.documentType || 'Identiteitsbewijs'
      )}
      zaak={document}
      isError={isError}
      isLoading={isLoading}
      breadcrumbs={breadcrumbs}
      pageContentMain={
        !!document && (
          <BurgerzakenIdentiteitsbewijsContent
            document={document}
            themaId={themaId}
          />
        )
      }
    />
  );
}
