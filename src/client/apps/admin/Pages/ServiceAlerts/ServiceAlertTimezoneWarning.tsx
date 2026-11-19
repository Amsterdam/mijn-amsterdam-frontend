import { Alert } from '@amsterdam/design-system-react';

import { isAmsterdamTimezone } from '../../../../../universal/helpers/timezone.ts';

export function ServiceAlertTimezoneWarning() {
  if (isAmsterdamTimezone()) {
    return null;
  }

  return (
    <Alert
      className="ams-mb-m"
      heading="Let op"
      headingLevel={4}
      severity="warning"
    >
      Je browser staat ingesteld op een andere tijdzone dan Amsterdam. Datums en
      tijden worden weergegeven in de tijdzone van je browser. Controleer daarom
      de tijden goed.
    </Alert>
  );
}
