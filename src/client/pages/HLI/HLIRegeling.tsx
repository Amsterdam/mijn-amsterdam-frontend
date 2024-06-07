import { useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useAppStateGetter } from '../../hooks';
import StatusDetail, { StatusSourceItem } from '../StatusDetail/StatusDetail';
import InfoDetail from '../../components/InfoDetail/InfoDetail';
import { Grid } from '@amsterdam/design-system-react';
import { Datalist } from '../../components/Datalist/Datalist';

export default function HLIRegeling() {
  const { HLI } = useAppStateGetter();
  const { id } = useParams<{ id: string }>();
  const statusItem = HLI.content?.regelingen?.find((item) => item.id === id);
  const soortRegeling = statusItem?.about;

  console.log('statusItem', statusItem);

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
      thema="HLI"
      stateKey="HLI"
      getItems={(hliContent) => {
        if (hliContent !== null && 'regelingen' in hliContent) {
          return hliContent.regelingen;
        }
        return [];
      }}
      pageContent={pageContent}
      documentPathForTracking={(document) =>
        `/downloads/regelingen-bij-laag-inkomen/${soortRegeling}/${document.title.split(/\n/)[0]}`
      }
    />
  );
}
