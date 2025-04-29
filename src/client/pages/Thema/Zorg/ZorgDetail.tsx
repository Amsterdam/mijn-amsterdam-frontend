import { useZorgDetailData } from './useZorgDetailData.hook';
import { WMOVoorzieningFrontend } from '../../../../server/services/wmo/wmo-config-and-types';
import ErrorAlert from '../../../components/Alert/Alert';
import { Datalist } from '../../../components/Datalist/Datalist';
import DocumentListV2 from '../../../components/DocumentList/DocumentListV2';
import { PageContentCell } from '../../../components/Page/Page';
import ThemaDetailPagina from '../../../components/Thema/ThemaDetailPagina';
import { useHTMLDocumentTitle } from '../../../hooks/useHTMLDocumentTitle';

type WMODetailContentProps = {
  voorziening: WMOVoorzieningFrontend;
};

function WMODetailContent({ voorziening }: WMODetailContentProps) {
  const rows = [];
  if (voorziening?.decision) {
    rows.push({ content: voorziening?.decision, label: 'Resultaat' });
  }
  if (voorziening?.supplier) {
    rows.push({ content: voorziening?.supplier, label: 'Aanbieder' });
  }

  return (
    <>
      {!!rows.length && (
        <PageContentCell>
          {voorziening?.disclaimer && (
            <ErrorAlert
              className="ams-mb--sm"
              severity="warning"
              title="Belangrijk om te weten"
            >
              {voorziening.disclaimer}
            </ErrorAlert>
          )}
          <Datalist rows={rows} />
          {voorziening?.documents.length > 0 && (
            <DocumentListV2
              documents={voorziening.documents}
              columns={['Brieven', 'Verzenddatum']}
            />
          )}
        </PageContentCell>
      )}
    </>
  );
}

export function ZorgDetail() {
  const { title, voorziening, breadcrumbs, isError, isLoading, routeConfig } =
    useZorgDetailData();
  useHTMLDocumentTitle(routeConfig.detailPage);

  return (
    <ThemaDetailPagina
      title={title}
      zaak={voorziening}
      isError={isError}
      isLoading={isLoading}
      pageContentMain={
        !!voorziening && <WMODetailContent voorziening={voorziening} />
      }
      breadcrumbs={breadcrumbs}
    />
  );
}
