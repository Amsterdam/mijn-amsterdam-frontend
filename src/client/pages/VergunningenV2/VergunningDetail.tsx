import { Grid } from '@amsterdam/design-system-react';
import { useParams } from 'react-router-dom';
import { VergunningV2 } from '../../../server/services/vergunningen-v2/config-and-types';
import { ThemaTitles } from '../../../universal/config';
import { Datalist } from '../../components/Datalist/Datalist';
import { useAppStateGetter } from '../../hooks';
import StatusDetail from '../StatusDetail/StatusDetail';

interface PageContentProps {
  vergunning?: VergunningV2;
}

function PageContent({ vergunning }: PageContentProps) {
  return (
    !!vergunning && (
      <Grid.Cell span="all">
        <Datalist
          rows={[
            {
              label: 'Zaaknummer',
              content: vergunning.identifier,
            },
            {
              label: 'Zaaktype',
              content: vergunning.caseType,
            },
          ]}
        />
      </Grid.Cell>
    )
  );
}

export default function VergunningV2Detail() {
  const appState = useAppStateGetter();
  const { VERGUNNINGENv2 } = appState;
  const { id } = useParams<{ id: string }>();
  const vergunning = VERGUNNINGENv2.content?.find((item) => item.id === id);

  return (
    <StatusDetail<VergunningV2>
      thema="VERGUNNINGENv2"
      stateKey="VERGUNNINGENv2"
      backLinkTitle={ThemaTitles.VERGUNNINGEN}
      pageContent={<PageContent vergunning={vergunning} />}
      documentPathForTracking={(document) =>
        `/downloads/vergunningen/${vergunning?.caseType}/${document.title.split(/\n/)[0]}`
      }
    />
  );
}
