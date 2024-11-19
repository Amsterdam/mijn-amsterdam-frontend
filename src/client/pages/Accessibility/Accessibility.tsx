import { Heading, Link } from '@amsterdam/design-system-react';

import { PageContent, PageHeading, TextPage } from '../../components';
import { ThemaTitles } from '../../config/thema';
import { useTermReplacement } from '../../hooks/useTermReplacement';

export default function Accessibility() {
  const termReplace = useTermReplacement();
  return (
    <TextPage>
      <PageHeading>Volledige toegankelijkheidsverklaring</PageHeading>
      <PageContent>
        <p>
          De gemeente Amsterdam wil dat iedereen Mijn Amsterdam kan gebruiken.
          Komt u toch een pagina tegen die u niet kunt lezen of gebruiken? Meld
          het via ons{' '}
          <Link
            variant="inline"
            href="https://formulieren.amsterdam.nl/TriplEforms/DirectRegelen/formulier/nl-NL/evAmsterdam/Contactformulier.aspx"
          >
            contactformulier
          </Link>
          .
        </p>
        <Heading level={3} size="level-4">
          Toegankelijk Mijn Amsterdam
        </Heading>
        <p>
          Iedereen moet websites van de overheid kunnen gebruiken. Dit is wat
          wij doen om Mijn Amsterdam toegankelijk te maken en te houden voor
          iedereen:
        </p>
        <ul>
          <li>Wij ontwikkelen Mijn Amsterdam samen met u, de Amsterdammer. </li>
          <li>
            We doen regelmatig gebruikersonderzoek en testen Mijn Amsterdam op
            toegankelijkheid.
          </li>
          <li>We lossen knelpunten op.</li>
          <li>
            Onze medewerkers houden hun kennis over toegankelijkheid op peil.
          </li>
        </ul>
        <Heading level={3} size="level-4">
          Onderdelen die nog niet toegankelijk zijn
        </Heading>
        <ul>
          <li>Pdf-bestanden zijn nog niet altijd toegankelijk.</li>
          <li>
            De persoonlijke plattegrond ‘{termReplace(ThemaTitles.BUURT)}’ is
            nog niet helemaal toegankelijk. We werken eraan om de plattegrond zo
            volledig toegankelijk te maken.
          </li>
        </ul>

        <Heading level={3} size="level-4">
          Toegankelijkheidsverklaring
        </Heading>
        <p>
          De eisen voor een toegankelijke website staan in het{' '}
          <Link
            variant="inline"
            href="https://wetten.overheid.nl/BWBR0040936/2018-07-01"
          >
            Tijdelijk besluit digitale toegankelijkheid overheid
          </Link>
          . In dat besluit staat ook dat wij een toegankelijkheidsverklaring op
          Mijn Amsterdam moeten zetten. Lees hier onze{' '}
          <Link
            variant="inline"
            href="https://www.toegankelijkheidsverklaring.nl/register/9142#verklaring"
          >
            volledige toegankelijkheidsverklaring
          </Link>
          . Lees hier de resultaten van het meest{' '}
          <Link
            variant="inline"
            href="/20211127%20Rapportage%20Audit%20Mijn%20Amsterdam%20Digitaal%20Toegankelijk%20WCAG-EM.pdf"
          >
            recente toegankelijkheidsonderzoek
          </Link>
          .
        </p>
      </PageContent>
    </TextPage>
  );
}
