import { useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { REQUEST_PROCESS_COMPLETED_STATUS_IDS } from '../../../server/services/wpi/config';
import Linkd from '../../components/Button/Button';
import { ExternalUrls } from '../../config/app';
import { useAppStateGetter } from '../../hooks';
import StatusDetail from '../StatusDetail/StatusDetail';

export default function InkomenDetailBbz() {
  const { WPI_BBZ } = useAppStateGetter();
  const { id } = useParams<{ id: string }>();
  const statusItem = WPI_BBZ.content?.find((item) => item.id === id);
  const hasDecisionStep =
    statusItem?.steps.some((step) => step.id.includes('besluit')) ?? false;

  const pageContent = useCallback((isLoading, inkomenItem) => {
    return (
      <>
        <p>
          Hieronder ziet u de status van uw aanvraag voor een uitkering of
          lening van het Bbz. Ook als u een IOAZ uitkering heeft aangevraagd
          ziet u de status hieronder. Als u meerdere aanvragen voor het Bbz hebt
          gedaan, dan krijgt u 1 besluit als antwoord op al uw aanvragen voor
          het Bbz. Het duurt maximaal 3 werkdagen voordat uw documenten over het
          Bbz in Mijn Amsterdam staan.
        </p>
        <p>
          Hebt u schuldhulp aangevraagd? Dan wordt daarover contact met u
          opgenomen.
        </p>
        <p>
          <Linkd external={true} href={ExternalUrls.WPI_BBZ}>
            Meer informatie over het Bbz
          </Linkd>
        </p>
      </>
    );
  }, []);

  return (
    <StatusDetail
      chapter="INKOMEN"
      stateKey="WPI_BBZ"
      showToggleMore={false}
      pageContent={pageContent}
      maxStepCount={() => -1}
      highlightKey={false}
      statusLabel={() => `Bbz-aanvraag`}
      showStatusLineConnection={!hasDecisionStep} // There is no logical connection between the historic BBZ steps, therefor we do not show the checkmarks as they imply a linear proces.
      documentPathForTracking={(document) =>
        `/downloads/inkomen/bbz/${document.title.split(/\n/)[0]}`
      }
      getItems={() => {
        if (!statusItem) {
          return [];
        }

        if (
          statusItem.steps.some((s) =>
            REQUEST_PROCESS_COMPLETED_STATUS_IDS.includes(s.id)
          )
        ) {
          // If its a completed request, pass data without processing (show's all steps seperate)
          return [statusItem] as any[];
        }

        // It's an open request, combine all aanvraag steps into one.
        const requests = statusItem.steps.filter((s) => s.id === 'aanvraag');

        // Only 1 aanvraag steps, early return
        if (requests.length === 1) {
          return [statusItem] as any[];
        }

        const requestStep = { ...requests[0] };
        const otherRequestDocuments = requests
          .slice(1)
          .map((s) => s.documents)
          .flat();

        // Combine the documents
        requestStep.documents = [
          ...requestStep.documents,
          ...otherRequestDocuments,
        ];
        const otherSteps = statusItem.steps.filter((s) => s.id !== 'aanvraag');

        // Create new item.
        const returnItem = {
          ...statusItem,
          steps: [requestStep, ...otherSteps],
        };

        return [returnItem] as any[];
      }}
    />
  );
}
