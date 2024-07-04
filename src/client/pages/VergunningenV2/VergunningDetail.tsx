import { Grid } from '@amsterdam/design-system-react';
import { useParams } from 'react-router-dom';
import { VergunningV2 } from '../../../server/services/vergunningen-v2/config-and-types';
import { AppRoutes, BagThemas, ThemaTitles } from '../../../universal/config';
import { Datalist } from '../../components/Datalist/Datalist';
import { useAppStateBagApi, useAppStateGetter } from '../../hooks';
import StatusDetail from '../StatusDetail/StatusDetail';
import { BFFApiUrls } from '../../config/api';

interface PageContentProps {
  vergunning?: VergunningV2;
}

// TODO: Implement detailpages per case
function PageContent({ vergunning }: PageContentProps) {
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

  const [vergunningDetail, api] = useAppStateBagApi<VergunningV2 | null>({
    url: vergunning?.fetchUrl ?? '',
    bagThema: BagThemas.BEZWAREN,
    key: id,
    // postponeFetch: true,
  });

  return (
    <StatusDetail<VergunningV2>
      thema="VERGUNNINGENv2"
      stateKey="VERGUNNINGENv2"
      backLinkTitle={ThemaTitles.VERGUNNINGEN}
      backLinkRoute={AppRoutes.VERGUNNINGEN}
      pageContent={<PageContent vergunning={vergunning} />}
      documentPathForTracking={(document) =>
        `/downloads/vergunningen/${vergunning?.caseType}/${document.title.split(/\n/)[0]}`
      }
    />
  );
}
