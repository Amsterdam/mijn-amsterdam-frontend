import { Grid } from '@amsterdam/design-system-react';
import { useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Datalist } from '../../components/Datalist/Datalist';
import { useAppStateGetter } from '../../hooks';
import StatusDetail, { StatusSourceItem } from '../StatusDetail/StatusDetail';
import { getThemaTitleWithAppState } from './helpers';

export default function HLIRegeling() {
  const appState = useAppStateGetter();
  const { HLI } = appState;
  const { id } = useParams<{ id: string }>();
  const statusItem = HLI.content?.regelingen?.find((item) => item.id === id);
  const soortRegeling = statusItem?.about;

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
      backLinkTitle={getThemaTitleWithAppState(appState)}
      maxStepCount={(hasDescision, regeling) => {
        const decisionStep = regeling?.steps.find(
          (step) => step.status === 'Besluit'
        );
        return decisionStep?.decision === 'afgewezen'
          ? -1
          : regeling?.steps.length ?? -1;
      }}
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
