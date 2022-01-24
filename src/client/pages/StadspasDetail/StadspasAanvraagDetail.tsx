import StatusDetail from '../StatusDetail/StatusDetail';

export const MAX_STEP_COUNT_FOCUS_REQUEST = 4;

export default function StadspasAanvraagDetail() {
  return (
    <StatusDetail
      showToggleMore={true}
      chapter="STADSPAS"
      stateKey="FOCUS_AANVRAGEN"
      maxStepCount={(hasDecision) =>
        !hasDecision ? MAX_STEP_COUNT_FOCUS_REQUEST : undefined
      }
      trackPath={(document) => `/downloads/stadspas/${document.title}`}
    />
  );
}
