import StatusDetail from '../StatusDetail/StatusDetail';

export const MAX_STEP_COUNT_WPI_REQUEST = 4;

export default function StadspasAanvraagDetail() {
  return (
    <StatusDetail
      showToggleMore={true}
      chapter="STADSPAS"
      stateKey="WPI_STADSPAS"
      getItems={(stadspasContent) => stadspasContent?.aanvragen || []}
      maxStepCount={(hasDecision) =>
        !hasDecision ? MAX_STEP_COUNT_WPI_REQUEST : undefined
      }
      documentPathForTracking={(document) =>
        `/downloads/stadspas/${document.title}`
      }
    />
  );
}
