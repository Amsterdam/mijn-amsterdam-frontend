import { Grid } from '@amsterdam/design-system-react';
import { useParams } from 'react-router-dom';
import {
  VergunningDocument,
  VergunningFrontendV2,
} from '../../../server/services/vergunningen-v2/config-and-types';
import { AppRoutes } from '../../../universal/config/routes';
import { isError, isLoading } from '../../../universal/helpers/api';
import { CaseTypeV2 } from '../../../universal/types/vergunningen';
import { ThemaIcon } from '../../components';
import { Datalist } from '../../components/Datalist/Datalist';
import DocumentListV2 from '../../components/DocumentList/DocumentListV2';
import { BagThemas, ThemaTitles } from '../../config/thema';
import { useAppStateBagApi, useAppStateGetter } from '../../hooks/useAppState';
import ThemaDetailPagina from '../ThemaPagina/ThemaDetailPagina';
import { AanbiedenDienstenContent } from './detail-page-content/AanbiedenDiensten';
import { GPPContent } from './detail-page-content/GPP';
import { WVOSContent } from './detail-page-content/WVOS';

interface DetailPageContentProps {
  vergunning: VergunningFrontendV2;
  documents: VergunningDocument[];
}

// TODO: Implement detailpages per case
function DetailPageContent({ vergunning, documents }: DetailPageContentProps) {
  switch (vergunning.caseType) {
    case CaseTypeV2.GPP:
      return <GPPContent vergunning={vergunning} />;
    case CaseTypeV2.AanbiedenDiensten:
      return <AanbiedenDienstenContent vergunning={vergunning} />;
    case CaseTypeV2.WVOS:
      return <WVOSContent vergunning={vergunning} />;
  }

  return (
    !!vergunning && (
      <Grid.Cell span="all">
        <Datalist
          rows={Object.entries(vergunning).map(([label, content]) => ({
            label,
            content: JSON.stringify(content),
          }))}
        />
        {!!documents.length && <DocumentListV2 documents={documents} />}
      </Grid.Cell>
    )
  );
}

export default function VergunningV2Detail() {
  const appState = useAppStateGetter();
  const { VERGUNNINGENv2 } = appState;
  const { id } = useParams<{ id: VergunningFrontendV2['id'] }>();
  const vergunning = VERGUNNINGENv2.content?.find((item) => item.id === id);
  const fetchUrl = vergunning?.fetchUrl ?? '';
  const [vergunningDetailApiResponse] = useAppStateBagApi<{
    vergunning: VergunningFrontendV2 | null;
    documents: VergunningDocument[];
  }>({
    url: fetchUrl,
    bagThema: BagThemas.VERGUNNINGEN,
    key: id,
  });
  const vergunningDetailResponseContent = vergunningDetailApiResponse.content;
  const vergunningDetail = vergunningDetailResponseContent?.vergunning ?? null;
  const vergunningDocuments = vergunningDetailResponseContent?.documents ?? [];

  return (
    <ThemaDetailPagina<VergunningFrontendV2>
      title={vergunningDetail?.title ?? 'Vergunning'}
      zaak={vergunningDetail}
      isError={isError(vergunningDetailApiResponse)}
      isLoading={
        isLoading(vergunningDetailApiResponse) || isLoading(VERGUNNINGENv2)
      }
      icon={<ThemaIcon />}
      pageContentTop={
        vergunningDetail && (
          <DetailPageContent
            vergunning={vergunningDetail}
            documents={vergunningDocuments}
          />
        )
      }
      backLink={{
        title: ThemaTitles.VERGUNNINGEN,
        to: AppRoutes.VERGUNNINGEN,
      }}
      documentPathForTracking={(document) =>
        `/downloads/vergunningen/${vergunningDetail?.caseType}/${document.title.split(/\n/)[0]}`
      }
    />
  );
}
