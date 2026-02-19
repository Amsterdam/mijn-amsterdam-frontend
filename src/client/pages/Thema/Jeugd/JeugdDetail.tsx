import { useParams } from 'react-router';

import { useJeugdThemaData } from './useJeugdThemaData';
import { LeerlingenvervoerVoorzieningFrontend } from '../../../../server/services/jeugd/jeugd';
import { Datalist } from '../../../components/Datalist/Datalist';
import DocumentListV2 from '../../../components/DocumentList/DocumentListV2';
import { PageContentCell } from '../../../components/Page/Page';
import ThemaDetailPagina from '../../../components/Thema/ThemaDetailPagina';
import { useHTMLDocumentTitle } from '../../../hooks/useHTMLDocumentTitle';

type ContentProps = {
  voorziening: LeerlingenvervoerVoorzieningFrontend;
};

function JeugdDetailContent({ voorziening }: ContentProps) {
  const rows = [];
  if (voorziening.decision) {
    rows.push({ content: voorziening?.decision, label: 'Resultaat' });
  }
  return (
    <PageContentCell>
      {!!rows.length && <Datalist rows={rows} />}
      {voorziening?.documents.length > 0 && (
        <DocumentListV2
          documents={voorziening.documents}
          columns={['Brieven', 'Verzenddatum']}
        />
      )}
    </PageContentCell>
  );
}

export function JeugdDetail() {
  const {
    voorzieningen,
    themaId,
    isError,
    isLoading,
    breadcrumbs,
    themaConfig,
  } = useJeugdThemaData();
  useHTMLDocumentTitle(themaConfig.detailPage.route);
  const { id } = useParams<{
    id: LeerlingenvervoerVoorzieningFrontend['id'];
  }>();
  const voorziening = voorzieningen.find((item) => item.id === id);

  return (
    <ThemaDetailPagina<LeerlingenvervoerVoorzieningFrontend>
      themaId={themaId}
      title={voorziening?.title ?? 'Voorziening'}
      zaak={voorziening}
      isError={isError}
      isLoading={isLoading}
      pageContentMain={
        !!voorziening && <JeugdDetailContent voorziening={voorziening} />
      }
      breadcrumbs={breadcrumbs}
    />
  );
}
