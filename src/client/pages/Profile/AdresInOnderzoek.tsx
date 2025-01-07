import { Alert, Paragraph } from '@amsterdam/design-system-react';

import { AppState } from '../../../universal/types';
import { LinkdInline } from '../../components';

type AdresInOnderzoekProps = {
  brpContent: AppState['BRP']['content'];
};

export function AdresInOnderzoek({ brpContent }: AdresInOnderzoekProps) {
  return (
    <Alert severity="warning" heading="Adres in onderzoek">
      <Paragraph>
        {brpContent?.persoon?.adresInOnderzoek === '080000' ? (
          <>
            Op dit moment onderzoeken wij of u nog steeds woont op het adres
            waar u ingeschreven staat.
          </>
        ) : (
          <>
            U woont niet meer op het adres waarop u staat ingeschreven. Op dit
            moment onderzoeken wij op welk adres u nu woont.
          </>
        )}{' '}
        <LinkdInline
          external={true}
          href="https://www.amsterdam.nl/veelgevraagd/onderzoek-naar-uw-inschrijving-in-de-basisregistratie-personen-brp-51319"
        >
          Kijk voor meer informatie over een adresonderzoek op amsterdam.nl
        </LinkdInline>
        .
      </Paragraph>
      <Paragraph>
        Kloppen uw gegevens niet? Voorkom een boete en stuur een e-mail naar{' '}
        <a
          href="mailto:adresonderzoek.basisinformatie@amsterdam.nl"
          rel="external noopener noreferrer"
        >
          adresonderzoek.basisinformatie@amsterdam.nl
        </a>
        .
      </Paragraph>
    </Alert>
  );
}
