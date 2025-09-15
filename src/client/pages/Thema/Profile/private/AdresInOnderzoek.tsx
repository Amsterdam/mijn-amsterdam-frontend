import { Alert, Link, Paragraph } from '@amsterdam/design-system-react';

import styles from './AdresInOnderzoek.module.scss';
import { AppState } from '../../../../../universal/types/App.types';

type AdresInOnderzoekProps = {
  brpContent: AppState['BRP']['content'];
};

export function AdresInOnderzoek({ brpContent }: AdresInOnderzoekProps) {
  return (
    <Alert severity="warning" heading="Adres in onderzoek" headingLevel={4}>
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
        <Link
          rel="noopener noreferrer"
          href="https://www.amsterdam.nl/veelgevraagd/onderzoek-naar-uw-inschrijving-in-de-basisregistratie-personen-brp-51319"
        >
          Kijk voor meer informatie over een adresonderzoek op amsterdam.nl
        </Link>
        .
      </Paragraph>
      <Paragraph>
        Kloppen uw gegevens niet? Voorkom een boete en stuur een e-mail naar{' '}
        <Link
          className={styles.Email}
          href="mailto:adresonderzoek.basisinformatie@amsterdam.nl"
          rel="noopener noreferrer"
        >
          adresonderzoek.basisinformatie@amsterdam.nl
        </Link>
        .
      </Paragraph>
    </Alert>
  );
}
