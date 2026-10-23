import { useJeugdDetailData } from './useJeugdDetailData.hook.ts';
import type { LeerlingenvervoerVoorzieningFrontend } from '../../../../../../server/services/jzd/jeugd/jeugd.ts';
import { Datalist } from '../../../../../components/Datalist/Datalist.tsx';
import { DocumentListV2 } from '../../../../../components/DocumentList/DocumentListV2.tsx';
import { JZDVoorzieningActies } from '../../../../../components/JZDVoorzieningActies/JZDVoorzieningActies.tsx';
import { PageContentCell } from '../../../../../components/Page/Page.tsx';
import { ThemaDetailPagina } from '../../../../../components/Thema/ThemaDetailPagina.tsx';
import { useHTMLDocumentTitle } from '../../../../../hooks/useHTMLDocumentTitle.ts';

type ContentProps = {
  voorziening: LeerlingenvervoerVoorzieningFrontend;
};

function JeugdDetailContent({ voorziening }: ContentProps) {
  const rows = [];
  if (voorziening.decision) {
    rows.push({ content: voorziening?.decision, label: 'Resultaat' });
  }
  return (
    <>
      <PageContentCell>
        {!!rows.length && <Datalist rows={rows} />}
        {voorziening?.documents.length > 0 && (
          <DocumentListV2
            documents={voorziening.documents}
            columns={['Brieven', 'Verzenddatum']}
          />
        )}
      </PageContentCell>
      <JZDVoorzieningActies voorziening={voorziening} />
    </>
  );
}

export function JeugdDetail() {
  const {
    voorziening,
    title,
    themaId,
    isError,
    isLoading,
    breadcrumbs,
    detailPageConfig,
  } = useJeugdDetailData();
  useHTMLDocumentTitle(detailPageConfig.route);

  return (
    <ThemaDetailPagina<LeerlingenvervoerVoorzieningFrontend>
      themaId={themaId}
      title={title}
      zaak={voorziening}
      isError={isError}
      isLoading={isLoading}
      pageContentMain={
        !!voorziening && <JeugdDetailContent voorziening={voorziening} />
      }
      statusStepsCollapsible
      breadcrumbs={breadcrumbs}
    />
  );
}
