import { useTermReplacement } from '../../hooks/useTermReplacement';
import { ChapterTitles } from '../../../universal/config/chapter';
import {
  TextPage,
  PageHeading,
  PageContent,
  LinkdInline,
  Heading,
} from '../../components';

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
          <LinkdInline
            external={true}
            href="https://formulieren.amsterdam.nl/TripleForms/DirectRegelen/formulier/nl-NL/evAmsterdam/Klachtenformulier.aspx"
          >
            contactformulier
          </LinkdInline>
          .
        </p>
        <Heading el="h3" size="small">
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
        <Heading el="h3" size="small">
          Onderdelen die nog niet toegankelijk zijn
        </Heading>
        <ul>
          <li>Pdf-bestanden zijn nog niet altijd toegankelijk.</li>
          <li>
            De persoonlijke plattegrond ‘{termReplace(ChapterTitles.BUURT)}’ is
            nog niet helemaal toegankelijk. We werken eraan om de plattegrond zo
            volledig toegankelijk te maken.
          </li>
        </ul>

        <Heading el="h3" size="small">
          Voor deze onderdelen geldt WCAG status C
        </Heading>
        <ul>
          <li>Mijn Erfpacht</li>
          <li>Erfpacht Overstapportaal</li>
          <li>Kredietbank</li>
          <li>Milieuzone</li>
        </ul>
        <p>
          WCAG status C betekent dat wij de eerste stappen hebben gezet om deze
          onderdelen toegankelijk te maken. We hebben onderzoek ingepland. Na
          dit onderzoek gaan we de onderdelen zo snel mogelijk volledig
          toegankelijk maken.
        </p>
        <Heading el="h3" size="small">
          Toegankelijkheidsverklaring
        </Heading>
        <p>
          De eisen voor een toegankelijke website staan in het{' '}
          <LinkdInline
            external={true}
            href="https://wetten.overheid.nl/BWBR0040936/2018-07-01"
          >
            Tijdelijk besluit digitale toegankelijkheid overheid
          </LinkdInline>
          . In dat besluit staat ook dat wij een toegankelijkheidsverklaring op
          Mijn Amsterdam moeten zetten. Lees hier onze{' '}
          <LinkdInline
            external={true}
            href={'/Uitslag WCAG Onderzoek 15-02-2021.pdf'}
          >
            volledige toegankelijkheidsverklaring
          </LinkdInline>
          .
        </p>
      </PageContent>
    </TextPage>
  );
}
