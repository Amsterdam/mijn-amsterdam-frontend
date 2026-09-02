import { Alert, Paragraph } from '@amsterdam/design-system-react';

export function ApplicationError() {
  return (
    <Alert severity="error" heading="Er is iets misgegaan" headingLevel={1}>
      <Paragraph>
        Er is iets misgegaan bij het laden van de back office. Probeer de pagina
        te verversen.
      </Paragraph>
    </Alert>
  );
}
