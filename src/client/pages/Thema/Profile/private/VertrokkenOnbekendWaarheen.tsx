import { Alert, Link, Paragraph } from '@amsterdam/design-system-react';

import { defaultDateFormat } from '../../../../../universal/helpers/date';
import { AppState } from '../../../../../universal/types/App.types';

type VertrokkenOnbekendWaarheenProps = {
  brpContent: AppState['BRP']['content'];
};

export function VertrokkenOnbekendWaarheen({
  brpContent,
}: VertrokkenOnbekendWaarheenProps) {
  return (
    <Alert severity="warning" heading="Vertrokken Onbekend Waarheen">
      <Paragraph>
        U staat sinds{' '}
        {brpContent?.persoon.datumVertrekUitNederland
          ? defaultDateFormat(brpContent?.persoon.datumVertrekUitNederland)
          : 'enige tijd'}{' '}
        in de Basisregistratie Personen (BRP) met de melding ‘Vertrokken
        Onbekend Waarheen (VOW)’.
      </Paragraph>
      <Paragraph>
        Als u in de BRP staat met de melding ‘Vertrokken Onbekend Waarheen
        (VOW)’ bent u onvindbaar voor de overheid. De overheid beschouwt u dan
        niet langer als inwoner van Nederland en u kunt geen gebruik meer maken
        van overheidsdiensten. U krijgt bijvoorbeeld geen paspoort,
        ziektekostenverzekering of toeslagen meer. Geef uw adres zo snel
        mogelijk door aan de gemeente.{' '}
        <Link
          aria-label="Meer informatie over de melding `Vertrokken Onbekend Waarheen (VOW)`"
          href="https://www.amsterdam.nl/veelgevraagd/onderzoek-naar-uw-inschrijving-in-de-basisregistratie-personen-brp-51319"
        >
          Meer informatie over onderzoek naar uw inschrijving in de
          Basisregistratie Personen (BRP)
        </Link>
      </Paragraph>
    </Alert>
  );
}
