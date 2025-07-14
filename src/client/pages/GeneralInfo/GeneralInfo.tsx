import { ReactNode } from 'react';

import {
  Heading,
  Paragraph,
  UnorderedList,
} from '@amsterdam/design-system-react';

import {
  PageContentCell,
  PageContentV2,
  TextPageV2,
} from '../../components/Page/Page';
import { PageHeadingV2 } from '../../components/PageHeading/PageHeadingV2';

const mijnGegevensListItems = [
  'Uw inschrijving bij de gemeente',
  'Uw contactmomenten met de gemeente',
];

function Section({
  title,
  listItems,
}: {
  title: string;
  listItems: ReactNode;
}) {
  return (
    <>
      <Heading level={4} size="level-4" className="ams-mb-s">
        {title}
      </Heading>
      <UnorderedList className="ams-mb-xl">{listItems}</UnorderedList>
    </>
  );
}

export function GeneralInfo() {
  return (
    <TextPageV2>
      <PageContentV2 span={8}>
        <PageContentCell>
          <PageHeadingV2>Dit ziet u in Mijn Amsterdam</PageHeadingV2>
        </PageContentCell>
        <PageContentCell>
          <Paragraph className="ams-mb-m">
            Welkom op Mijn Amsterdam: dit is uw persoonlijke online portaal bij
            de gemeente Amsterdam.
          </Paragraph>
          <Paragraph className="ams-mb-m">
            Hier ziet u op 1 centrale plek welke gegevens de gemeente van u
            heeft vastgelegd. U ziet hier ook wat u bij de gemeente heeft
            aangevraagd, hoe het met uw aanvraag staat en hoe u kunt doorgeven
            als er iets niet klopt.
          </Paragraph>
          <Paragraph className="ams-mb-m">
            <b>Let op!</b> Een thema of een product verschijnt alléén als u deze
            ook heeft afgenomen!
          </Paragraph>
          <Paragraph className="ams-mb-xl">
            Op dit moment kunnen de volgende gegevens getoond worden:
          </Paragraph>
          <Section
            title="Mijn gegevens"
            listItems={
              <>
                <UnorderedList.Item>
                  Uw inschrijving bij de gemeente
                </UnorderedList.Item>
                <UnorderedList.Item>
                  Uw contactmomenten met de gemeente
                </UnorderedList.Item>
              </>
            }
          />
        </PageContentCell>
      </PageContentV2>
    </TextPageV2>
  );
}

/*
Paspoort en ID-kaart

    Gegevens van uw paspoort of ID-kaart

Mijn buurt

    Overzicht van gemeentelijke informatie rond uw woning

Afval

    Informatie over afval laten ophalen en wegbrengen in uw buurt

Belastingen

    Belastingaanslagen betalen
    Automatische incasso regelen
    Bezwaar indienen
    Kwijtschelding aanvragen
    Betalingsregeling aanvragen
    Aangifte doen

Persoonsgegevens AVG

    Uw inzage of wijziging persoonsgegevens AVG

Bezwaren

    Bezwaren tegen een besluit van de gemeente Amsterdam

Klachten

    Uw ingediende klachten

Erfpacht

    Overzicht van uw erfpachtgegevens

Facturen en betalen

    Overzicht van facturen
    Betalen van facturen

Inkomen

    Uw aanvraag voor een bijstandsuitkering of bijstand voor zelfstandigen (Bbz)
    De uitkeringsspecificaties en jaaropgaven van uw bijstandsuitkering of bijstand voor zelfstandigen (Bbz)
    Uw aanvraag voor de Tijdelijke overbruggingsregeling zelfstandig ondernemers (Tozo 1, 2, 3 en 4)
    Uw aanvraag voor de Tijdelijke Ondersteuning Noodzakelijke Kosten (TONK)
    Uw aanvraag voor de Inkomensvoorziening oudere en gedeeltelijk arbeidsongeschikte gewezen zelfstandigen (IOAZ)

Regelingen bij laag inkomen

    Collectieve zorgverzekering
    Declaratie Kindtegoed
    Kindtegoed Voorschool
    Gratis laptop of tablet middelbare school
    Gratis laptop of tablet basisschool
    Individuele inkomenstoeslag
    Gratis openbaar vervoer voor AOW'ers
    Tegemoetkoming aanvullend openbaar vervoer voor ouderen
    Tegemoetkoming openbaar vervoer voor mantelzorgers

Stadspas

    Status aanvraag Stadspas van u of uw gezin
    Het saldo Kindtegoed en/of andere tegoeden en de bestedingen
    Stadspasnummer
    Stadspas blokkeren

Zorg en ondersteuning

    Uw Wmo-regelingen (Wmo: wet maatschappelijke ondersteuning)

Subsidies

    Uw aanvraag voor een subsidie

Kredietbank & FIBU

    Informatie over ondersteuning door Kredietbank en Budgetbeheer (FIBU)

Toeristische verhuur

    Uw aanvraag voor een vergunning vakantieverhuur of bed & breakfast
    Uw landelijk registratienummer toeristische verhuur
    Link naar het landelijk portaal om vakantieverhuur door te geven en het aantal nachten verhuur in te zien

Parkeren

    Het inzien, aanvragen of wijzigen van een bewonersvergunning

Milieuzone

    Inzien van uw ontheffingen in de milieuzone

Overtredingen voertuigen

    Inzien van uw overtredingen in de milieuzone

Vergunningen en ontheffingen

    Uw aanvraag voor een ontheffing of vergunning voor de volgende activiteiten:
        Ergens rijden of stilstaan waar dat normaal niet mag (RVV en e-RVV)
        Straat tijdelijk afsluiten of afzetten (TVM)
        Object neerzetten op parkeervak, straat of stoep (Objectvergunning)
        Parkeervakken reserveren (TVM)
        Tijdelijk toegang krijgen tot gebied dat is afgesloten met paaltjes (RVV)
        Werkzaamheden uitvoeren op tijden dat het normaal niet mag (Nachtwerkontheffing)
        Filmen (Filmmelding)
        Fietsen en/of fietsenrekken verwijderen
    Uw aanvraag of kentekenwijziging voor een RVV-ontheffing Sloterweg
    Uw aanvraag voor een gehandicaptenparkeerkaart (GPK) of een vaste gehandicaptenparkeerplaats (GPP)
    Uw aanvraag voor een ontheffing touringcar
    Uw aanvraag voor een ontheffing zwaar verkeer
    Uw aanvraag voor een ontheffing blauwe zone
    Uw evenementvergunning of evenementmelding
    Uw aanvraag voor een splitsingsvergunning
    Uw aanvraag voor kamerverhuur (omzettingsvergunning)
    Uw aanvraag vergunning straatartiest, draaiorgel of het aanbieden van diensten op straat
    Uw aanvraag ontheffing verspreiden reclamemateriaal (sampling)
    Uw aanvraag voor een vergunning voor onttrekken, samenvoegen en vormen van woonruimte
    Uw aanvraag voor een ligplaatsvergunning
    Uw aanvraag voor een eigen parkeerplaats voor huisartsen, verloskundigen en consuls
    Uw aanvraag voor een vergunning exploitatie horecabedrijf

Bodem

    Uw aanvraag voor 'lood in de bodem-check'
*/
