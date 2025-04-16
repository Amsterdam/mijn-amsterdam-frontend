import { useBodemDetailData } from './useBodemDetailData.hook';
import { LoodMetingFrontend } from '../../../server/services/bodem/types';
import { Datalist, Row } from '../../components/Datalist/Datalist';
import { DocumentLink } from '../../components/DocumentList/DocumentLink';
import { AddressDisplayAndModal } from '../../components/LocationModal/LocationModal';
import { PageContentCell } from '../../components/Page/Page';
import ThemaDetailPagina from '../ThemaPagina/ThemaDetailPagina';

export function LoodMeting() {
  const { meting, isLoading, isError, breadcrumbs } = useBodemDetailData();

  const BodemDetailRows = (meting: LoodMetingFrontend) => {
    const rows: Row[] = [{ label: 'Kenmerk', content: meting.kenmerk }];

    if (meting.adres) {
      rows.push({
        label: 'Locatie',
        content: <AddressDisplayAndModal address={meting.adres} />,
      });
    }

    if (meting.document) {
      rows.push({
        label: 'Document',
        content: <DocumentLink document={meting.document} />,
      });
    }

    if (meting.decision === 'Afgewezen') {
      rows.push(
        ...[
          {
            label: 'Resultaat',
            content: meting.decision,
          },
          {
            label: 'Reden afwijzing',
            content: meting.redenAfwijzing,
          },
        ]
      );
    }

    return rows.filter((row) => !!row.content);
  };

  function BodemDetailContent({ meting }: { meting: LoodMetingFrontend }) {
    return (
      <PageContentCell>
        <Datalist rows={BodemDetailRows(meting)} />
      </PageContentCell>
    );
  }

  return (
    <ThemaDetailPagina
      title="Lood in bodem-check"
      zaak={meting}
      breadcrumbs={breadcrumbs}
      isError={isError}
      isLoading={isLoading}
      pageContentMain={!!meting && <BodemDetailContent meting={meting} />}
    />
  );
}
