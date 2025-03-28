import { useParams } from 'react-router-dom';
import useSWR from 'swr';

import { VergunningFrontendV2 } from '../../../server/services/vergunningen-v2/config-and-types';
import { isError, isLoading } from '../../../universal/helpers/api';
import { CaseTypeV2 } from '../../../universal/types/vergunningen';
import { ThemaIcon } from '../../components';
import { Datalist } from '../../components/Datalist/Datalist';
import DocumentListV2 from '../../components/DocumentList/DocumentListV2';
import { useAppStateGetter } from '../../hooks/useAppState';
import ThemaDetailPagina from '../ThemaPagina/ThemaDetailPagina';
import { AanbiedenDienstenContent } from './detail-page-content/AanbiedenDiensten';
import { GPPContent } from './detail-page-content/GPP';
import { WVOSContent } from './detail-page-content/WVOS';
import { PageContentCell } from '../../components/Page/Page';

const ONE_MINUTE_MS = 60000;
// eslint-disable-next-line no-magic-numbers
const FIFTEEN_MINUTES_MS = 15 * ONE_MINUTE_MS;

interface DetailPageContentProps {
  vergunning: VergunningFrontendV2;
  documents: GenericDocument[];
  backLink: string;
}

// TODO: Implement detailpages per case
function DetailPageContent({ vergunning, documents }: DetailPageContentProps) {
  return (
    <PageContentCell>
      {(function VergunningDetailContent() {
        switch (vergunning.caseType) {
          case CaseTypeV2.GPP:
            return <GPPContent vergunning={vergunning} />;
          case CaseTypeV2.AanbiedenDiensten:
            return <AanbiedenDienstenContent vergunning={vergunning} />;
          case CaseTypeV2.WVOS:
            return <WVOSContent vergunning={vergunning} />;
          default:
            return (
              <Datalist
                rows={Object.entries(vergunning).map(([label, content]) => ({
                  label,
                  content: JSON.stringify(content),
                }))}
              />
            );
        }
      })()}
      {!!documents.length && <DocumentListV2 documents={documents} />}
    </PageContentCell>
  );
}

interface VergunningV2DetailProps {
  backLink: string;
}

export function VergunningDetailPagina({ backLink }: VergunningV2DetailProps) {
  const appState = useAppStateGetter();
  const { VERGUNNINGENv2 } = appState;
  const { id } = useParams<{ id: VergunningFrontendV2['id'] }>();
  const vergunning = VERGUNNINGENv2.content?.find((item) => item.id === id);
   const fetchDocumentsUrl = vergunning?.fetchDocumentsUrl;

  const { data: vergunningDocumentsResponse } = useSWR<
    ApiResponse<VergunningDocument[]>
  >(
    fetchDocumentsUrl,
    (url: string) =>
      fetch(url, { credentials: 'include' }).then((response) =>
        response.json()
      ),

    { dedupingInterval: FIFTEEN_MINUTES_MS }
  );
  const vergunningDocuments = vergunningDocumentsResponse?.content ?? [];

  return (
    <ThemaDetailPagina<VergunningFrontendV2>
      title={vergunning?.title ?? 'Vergunning'}
      zaak={vergunning}
      isError={isError(VERGUNNINGENv2)}
      isLoading={isLoading(VERGUNNINGENv2)}
      pageContentTop={
        vergunning && (
          <DetailPageContent
            vergunning={vergunning}
            documents={vergunningDocuments}
            backLink={backLink}
          />
        )
      }
      backLink={backLink}
      documentPathForTracking={(document) =>
        `/downloads/vergunningen/${vergunning?.caseType}/${document.title.split(/\n/)[0]}`
      }
    />
  );
}
