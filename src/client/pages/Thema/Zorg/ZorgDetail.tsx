import { useZorgDetailData } from './useZorgDetailData.hook';
import { themaConfig } from './Zorg-thema-config';
import { WMOVoorzieningFrontend } from '../../../../server/services/wmo/wmo-types';
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
    <PageContentCell>
      {voorziening?.disclaimer && (
        <ErrorAlert
          className="ams-mb-m"
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
  );
}

export function ZorgDetail() {
  const { title, voorziening, breadcrumbs, isError, isLoading, themaId } =
    useZorgDetailData();
  useHTMLDocumentTitle(themaConfig.detailPage.route);

  return (
    <ThemaDetailPagina
      themaId={themaId}
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
