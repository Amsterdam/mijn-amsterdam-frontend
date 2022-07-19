import { useCallback } from 'react';
import { useParams } from 'react-router-dom';
import Linkd from '../../components/Button/Button';
import { ExternalUrls } from '../../config/app';
import { useAppStateGetter } from '../../hooks';
import StatusDetail from '../StatusDetail/StatusDetail';

export default function InkomenDetailBbz() {
  const { WPI_BBZ } = useAppStateGetter();
  const { id } = useParams<{ id: string }>();
  const statusItem = WPI_BBZ.content?.find((item) => item.id === id);
  const hasDecisionStep = statusItem?.steps.some(step => step.id === "besluit") ?? false;
  const pageContent = useCallback((isLoading, inkomenItem) => {
    return (
      <>
        <p>
          Hieronder ziet u de status van uw aanvraag voor een uitkering of
          lening van het Bbz. Ook als u een IOAZ uitkering heeft aangevraagd
          ziet u de status hieronder. Het duurt maximaal 3 werkdagen voordat uw
          documenten over het Bbz in Mijn Amsterdam staan.
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
      reverseSteps={hasDecisionStep} // For an unknown business reason, the historic steps of BBZ are shown in reverse.
      documentPathForTracking={(document) =>
        `/downloads/inkomen/bbz/${document.title.split(/\n/)[0]}`
      }
    />
  );
}
