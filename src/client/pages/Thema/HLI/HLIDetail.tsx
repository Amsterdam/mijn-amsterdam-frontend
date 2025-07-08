import { useParams } from 'react-router';

import styles from './HLIThema.module.scss';
import { useHliThemaData } from './useHliThemaData.ts';
import type { HLIRegelingFrontend } from '../../../../server/services/hli/hli-regelingen-types.ts';
import { Datalist, Row } from '../../../components/Datalist/Datalist.tsx';
import DocumentListV2 from '../../../components/DocumentList/DocumentListV2.tsx';
import { PageContentCell } from '../../../components/Page/Page.tsx';
import ThemaDetailPagina from '../../../components/Thema/ThemaDetailPagina.tsx';
import { useHTMLDocumentTitle } from '../../../hooks/useHTMLDocumentTitle.ts';

type DetailPageContentProps = {
  hliRegeling: HLIRegelingFrontend;
};

function DetailPageContent({ hliRegeling }: DetailPageContentProps) {
  const rows: Row[] = [];

  if (hliRegeling?.receiver) {
    rows.push({
      label: 'Ontvanger',
      content: hliRegeling.receiver,
      classNameContent: styles.Ontvanger,
    });
  }

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
  const { regelingen, isError, isLoading, breadcrumbs, routeConfig } =
    useHliThemaData();
  useHTMLDocumentTitle(routeConfig.detailPage);
  const { id } = useParams<{ id: string }>();
  const regelingDetail = regelingen?.find((item) => item.id === id) ?? null;

  return (
    <ThemaDetailPagina
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
