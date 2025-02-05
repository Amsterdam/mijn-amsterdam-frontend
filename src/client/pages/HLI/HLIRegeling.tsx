import { Grid } from '@amsterdam/design-system-react';
import { useParams } from 'react-router-dom';

import styles from './HLIThemaPagina.module.scss';
import { useHliThemaData } from './useHliThemaData';
import { HLIRegeling } from '../../../server/services/hli/hli-regelingen-types';
import { Datalist, Row } from '../../components/Datalist/Datalist';
import DocumentListV2 from '../../components/DocumentList/DocumentListV2';
import ThemaDetailPagina from '../ThemaPagina/ThemaDetailPagina';

type DetailPageContentProps = {
  hliRegeling: HLIRegeling;
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
        <Grid.Cell span="all">
          <Datalist rows={rows} />
        </Grid.Cell>
      )}
      {!!hliRegeling.documents.length && (
        <Grid.Cell span="all">
          <DocumentListV2 documents={hliRegeling.documents} />
        </Grid.Cell>
      )}
    </>
  );
}

export default function HLIRegelingDetailPagina() {
  const { regelingen, isError, isLoading, title, routes } = useHliThemaData();
  const { id } = useParams<{ id: string }>();
  const regelingDetail = regelingen?.find((item) => item.id === id) ?? null;

  return (
    <ThemaDetailPagina<HLIRegeling>
      title={regelingDetail?.title ?? 'Regeling bij laag inkomen'}
      zaak={regelingDetail}
      isError={isError}
      isLoading={isLoading}
      pageContentTop={
        regelingDetail && <DetailPageContent hliRegeling={regelingDetail} />
      }
      backLink={routes.themaPage}
      documentPathForTracking={(document) =>
        `/downloads/hli/regeling/${regelingDetail?.title}/${document.title.split(/\n/)[0]}`
      }
    />
  );
}
