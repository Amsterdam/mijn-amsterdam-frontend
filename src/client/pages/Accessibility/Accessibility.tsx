import {
  Heading,
  Link,
  Paragraph,
  UnorderedList,
} from '@amsterdam/design-system-react';

import {
  PageContentCell,
  PageContentV2,
  TextPageV2,
} from '../../components/Page/Page';
import { PageHeadingV2 } from '../../components/PageHeading/PageHeadingV2';
import { ThemaTitles } from '../../config/thema';
import { useTermReplacement } from '../../hooks/useTermReplacement';

export default function Accessibility() {
  const termReplace = useTermReplacement();
  return (
    <TextPageV2>
      <PageContentV2>
        <PageHeadingV2>Volledige toegankelijkheidsverklaring</PageHeadingV2>
        <PageContentCell>
          <Paragraph className="ams-mb--sm">
            De gemeente Amsterdam wil dat iedereen Mijn Amsterdam kan gebruiken.
            Komt u toch een pagina tegen die u niet kunt lezen of gebruiken?
            Meld het via ons{' '}
            <Link
              rel="noopener noreferrer"
              href="https://formulieren.amsterdam.nl/TriplEforms/DirectRegelen/formulier/nl-NL/evAmsterdam/Contactformulier.aspx"
            >
              contactformulier
            </Link>
            .
          </Paragraph>
          <Heading level={3} size="level-4">
            Toegankelijk Mijn Amsterdam
          </Heading>
          <Paragraph className="ams-mb--sm">
            Iedereen moet websites van de overheid kunnen gebruiken. Dit is wat
            wij doen om Mijn Amsterdam toegankelijk te maken en te houden voor
            iedereen:
          </Paragraph>
          <UnorderedList>
            <UnorderedList.Item>
              Wij ontwikkelen Mijn Amsterdam samen met u, de Amsterdammer.{' '}
            </UnorderedList.Item>
            <UnorderedList.Item>
              We doen regelmatig gebruikersonderzoek en testen Mijn Amsterdam op
              toegankelijkheid.
            </UnorderedList.Item>
            <UnorderedList.Item>We lossen knelpunten op.</UnorderedList.Item>
            <UnorderedList.Item>
              Onze medewerkers houden hun kennis over toegankelijkheid op peil.
            </UnorderedList.Item>
          </UnorderedList>
          <Heading level={3} size="level-4">
            Onderdelen die nog niet toegankelijk zijn
          </Heading>
          <UnorderedList>
            <UnorderedList.Item>
              Pdf-bestanden zijn nog niet altijd toegankelijk.
            </UnorderedList.Item>
            <UnorderedList.Item>
              De persoonlijke plattegrond ‘{termReplace(ThemaTitles.BUURT)}’ is
              nog niet helemaal toegankelijk. We werken eraan om de plattegrond
              zo volledig toegankelijk te maken.
            </UnorderedList.Item>
          </UnorderedList>
          <Heading level={3} size="level-4">
            Toegankelijkheidsverklaring
          </Heading>
          <Paragraph>
            De eisen voor een toegankelijke website staan in het{' '}
            <Link
              rel="noopener noreferrer"
              href="https://wetten.overheid.nl/BWBR0040936/2018-07-01"
            >
              Tijdelijk besluit digitale toegankelijkheid overheid
            </Link>
            . In dat besluit staat ook dat wij een toegankelijkheidsverklaring
            op Mijn Amsterdam moeten zetten. Lees hier onze{' '}
            <Link
              rel="noopener noreferrer"
              href="https://www.toegankelijkheidsverklaring.nl/register/9142#verklaring"
            >
              volledige toegankelijkheidsverklaring
            </Link>
            . Lees hier de resultaten van het meest{' '}
            <Link
              rel="noopener noreferrer"
              href="/20211127%20Rapportage%20Audit%20Mijn%20Amsterdam%20Digitaal%20Toegankelijk%20WCAG-EM.pdf"
            >
              recente toegankelijkheidsonderzoek
            </Link>
            .
          </Paragraph>
        </PageContentCell>
      </PageContentV2>
    </TextPageV2>
  );
}
