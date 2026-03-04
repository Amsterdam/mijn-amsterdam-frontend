import { Alert } from '@amsterdam/design-system-react';

export function CobrowseScreenshareAlert() {
  return (
    <Alert
      className="ams-mb-m"
      heading="U deelt nu uw scherm met een medewerker van de gemeente Amsterdam."
      headingLevel={2}
      severity="warning"
    >
      De medewerker kan de onderdelen van uw scherm met een oranje achtergrond
      niet zien. Dit is om uw privacy te beschermen.
    </Alert>
  );
}
