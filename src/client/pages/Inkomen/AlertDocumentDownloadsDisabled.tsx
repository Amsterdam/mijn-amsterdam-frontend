import React from 'react';
import { FeatureToggle } from '../../../universal/config';
import { Alert } from '../../components';

export default function AlertDocumentDownloadsDisabled() {
  return (
    (!FeatureToggle.focusDocumentDownloadsActive && (
      <Alert type="warning">
        <p>
          In verband met technische problemen zijn de documenten van Werk
          Participatie en Inkomen tijdelijk niet in te zien en te downloaden
        </p>
      </Alert>
    )) ||
    null
  );
}
