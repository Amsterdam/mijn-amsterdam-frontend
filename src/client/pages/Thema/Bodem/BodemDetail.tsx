import { useBodemDetailData } from './useBodemDetailData.hook.tsx';
import { LoodMetingFrontend } from '../../../../server/services/bodem/types.ts';
import { Datalist, Row } from '../../../components/Datalist/Datalist.tsx';
import { DocumentLink } from '../../../components/DocumentList/DocumentLink.tsx';
import { AddressDisplayAndModal } from '../../../components/LocationModal/LocationModal.tsx';
import { PageContentCell } from '../../../components/Page/Page.tsx';
import ThemaDetailPagina from '../../../components/Thema/ThemaDetailPagina.tsx';
import { useHTMLDocumentTitle } from '../../../hooks/useHTMLDocumentTitle.ts';

export function BodemDetail() {
  const { meting, isLoading, isError, breadcrumbs, title, routeConfig } =
    useBodemDetailData();
  useHTMLDocumentTitle(routeConfig.detailPage);

  const LoodMetingRows = (meting: LoodMetingFrontend) => {
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
        <Datalist rows={LoodMetingRows(meting)} />
      </PageContentCell>
    );
  }

  return (
    <ThemaDetailPagina
      title={title}
      zaak={meting}
      breadcrumbs={breadcrumbs}
      isError={isError}
      isLoading={isLoading}
      pageContentMain={!!meting && <BodemDetailContent meting={meting} />}
    />
  );
}
