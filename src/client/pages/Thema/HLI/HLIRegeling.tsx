import { useParams } from 'react-router';

import styles from './HLIThemaPagina.module.scss';
import { useHliThemaData } from './useHliThemaData';
import type { HLIRegelingFrontend } from '../../../../server/services/hli/hli-regelingen-types';
import { Datalist, Row } from '../../../components/Datalist/Datalist';
import DocumentListV2 from '../../../components/DocumentList/DocumentListV2';
import { PageContentCell } from '../../../components/Page/Page';
import ThemaDetailPagina from '../../../components/Thema/ThemaDetailPagina';

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
    <>
      {!!rows.length && (
        <PageContentCell>
          <Datalist rows={rows} />
        </PageContentCell>
      )}
      {!!hliRegeling.documents.length && (
        <PageContentCell>
          <DocumentListV2 documents={hliRegeling.documents} />
        </PageContentCell>
      )}
    </>
  );
}

export function HLIRegeling() {
  const { regelingen, isError, isLoading, breadcrumbs } = useHliThemaData();
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
