import { Alert, Paragraph } from '@amsterdam/design-system-react';

import { useAppStateGetter } from '../../../../hooks/useAppStateStore.ts';

export function GemachtigdeAlert() {
  const { BRP } = useAppStateGetter();
  const aanschrijfwijze = BRP.content?.persoon?.aanschrijfwijze;
  const geboortedatum = BRP.content?.persoon?.geboortedatum;

  return (
    <Alert heading="Ingelogd als gemachtigde" headingLevel={2}>
      <Paragraph>
        U bent ingelogd als gemachtigde van{' '}
        <strong>
          {aanschrijfwijze} ({geboortedatum})
        </strong>
        . U ziet alleen de gegevens waarvoor u een machtiging heeft gekregen.
      </Paragraph>
      <Paragraph>
        Wilt u uw eigen gegevens zien? Log dan uit en kies ‘Inloggen met DigiD’.
      </Paragraph>
    </Alert>
  );
}
