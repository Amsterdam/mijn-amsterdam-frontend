import { Grid } from '@amsterdam/design-system-react';
import { useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { ThemaTitles } from '../../../universal/config';
import { Datalist } from '../../components/Datalist/Datalist';
import { useAppStateGetter } from '../../hooks';
import StatusDetail, { StatusSourceItem } from '../StatusDetail/StatusDetail';

export default function VergunningV2Detail() {
  const appState = useAppStateGetter();
  const { VERGUNNINGEN_V2 } = appState;
  const { id } = useParams<{ id: string }>();
  const statusItem = VERGUNNINGEN_V2.content?.find((item) => item.id === id);

  const pageContent = useCallback(
    (isLoading: boolean, hliRegeling: StatusSourceItem) => {
      return (
        hliRegeling?.supplier && (
          <Grid.Cell span="all">
            <Datalist
              rows={[
                {
                  label: 'Aanbieder',
                  content: hliRegeling.supplier,
                },
              ]}
            />
          </Grid.Cell>
        )
      );
    },
    []
  );

  return (
    <StatusDetail
      thema="VERGUNNINGEN_V2"
      stateKey="VERGUNNINGEN_V2"
      backLinkTitle={ThemaTitles.VERGUNNINGEN}
      pageContent={pageContent}
      documentPathForTracking={(document) =>
        `/downloads/vergunningen/${statusItem?.caseType}/${document.title.split(/\n/)[0]}`
      }
    />
  );
}
