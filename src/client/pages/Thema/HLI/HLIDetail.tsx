import { useParams } from 'react-router';

import { themaConfig } from './HLI-thema-config';
import { useHliThemaData } from './useHliThemaData';
import type { HLIRegelingFrontend } from '../../../../server/services/hli/hli-regelingen-types';
import { Datalist, Row } from '../../../components/Datalist/Datalist';
import DocumentListV2 from '../../../components/DocumentList/DocumentListV2';
import { PageContentCell } from '../../../components/Page/Page';
import ThemaDetailPagina from '../../../components/Thema/ThemaDetailPagina';
import { useHTMLDocumentTitle } from '../../../hooks/useHTMLDocumentTitle';

type DetailPageContentProps = {
  hliRegeling: HLIRegelingFrontend;
};

function DetailPageContent({ hliRegeling }: DetailPageContentProps) {
  const rows: Row[] = [];

  return (
    <PageContentCell>
      {!!rows.length && <Datalist rows={rows} />}
      {!!hliRegeling.documents.length && (
        <DocumentListV2 documents={hliRegeling.documents} />
      )}
    </PageContentCell>
  );
}

export function HLIDetail() {
  const { regelingen, isError, isLoading, breadcrumbs, themaId } =
    useHliThemaData();
  useHTMLDocumentTitle(themaConfig.detailPage.route);
  const { id } = useParams<{ id: string }>();
  const regelingDetail = regelingen?.find((item) => item.id === id) ?? null;

  return (
    <ThemaDetailPagina
      themaId={themaId}
      title={regelingDetail?.title ?? 'Regeling bij laag inkomen'}
      zaak={regelingDetail}
      isError={isError}
      isLoading={isLoading}
      pageContentMain={
        regelingDetail && <DetailPageContent hliRegeling={regelingDetail} />
      }
      breadcrumbs={breadcrumbs}
    />
  );
}
