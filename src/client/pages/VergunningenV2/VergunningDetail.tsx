import { Grid } from '@amsterdam/design-system-react';
import { useParams } from 'react-router-dom';
import {
  VergunningDocument,
  VergunningV2,
} from '../../../server/services/vergunningen-v2/config-and-types';
import { AppRoutes, BagThemas, ThemaTitles } from '../../../universal/config';
import { ThemaIcon } from '../../components';
import { Datalist } from '../../components/Datalist/Datalist';
import { useAppStateBagApi, useAppStateGetter } from '../../hooks';
import ThemaDetailPagina from '../ThemaPagina/ThemaDetailPagina';

interface PageContentProps {
  vergunning?: VergunningV2;
  documents?: VergunningDocument[];
}

// TODO: Implement detailpages per case
function PageContent({ vergunning, documents }: PageContentProps) {
  return (
    !!vergunning && (
      <Grid.Cell span="all">
        <Datalist
          rows={Object.entries(vergunning)
            .filter(([label, content]) => typeof content !== 'object')
            .map(([label, content]) => ({
              label,
              content,
            }))}
        />
      </Grid.Cell>
    )
  );
}

export default function VergunningV2Detail() {
  const appState = useAppStateGetter();
  const { VERGUNNINGENv2 } = appState;
  const { id } = useParams<{ id: VergunningV2['id'] }>();
  const vergunning = VERGUNNINGENv2.content?.find((item) => item.id === id);
  const fetchUrl = vergunning?.fetchUrl ?? '';
  const [vergunningDetailResponseContent, api] = useAppStateBagApi<{
    vergunning: VergunningV2 | null;
    documents: VergunningDocument[];
  }>({
    url: fetchUrl,
    bagThema: BagThemas.BEZWAREN,
    key: id,
  });

  const vergunningDetail = vergunningDetailResponseContent?.vergunning ?? null;
  const vergunningDocuments = vergunningDetailResponseContent?.documents ?? [];

  return (
    <ThemaDetailPagina<VergunningV2>
      title={vergunningDetail?.title ?? 'Vergunning'}
      zaak={vergunningDetail}
      isError={api.isError}
      isLoading={api.isLoading || api.isPristine}
      icon={<ThemaIcon />}
      pageContentTop={
        vergunningDetail && (
          <PageContent
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
