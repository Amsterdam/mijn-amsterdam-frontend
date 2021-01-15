import { FeatureToggle } from '../../../universal/config';
import { Alert } from '../../components';

export default function AlertDocumentDownloadsDisabled() {
  return (
    (FeatureToggle.focusDocumentDownloadsAlert && (
      <Alert type="warning">
        <p>
          Door technische problemen kunt u de brieven van Inkomen en Stadspas op
          dit moment niet openen en downloaden. Onze excuses voor het ongemak.
        </p>
      </Alert>
    )) ||
    null
  );
}
