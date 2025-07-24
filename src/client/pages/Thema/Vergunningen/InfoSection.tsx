import { themaTitle } from './Vergunningen-thema-config';
import * as generalInfo from '../../GeneralInfo/GeneralInfo';

export const vergunningensectionProps: generalInfo.SectionProps = {
  title: themaTitle,
  listItems: [
    {
      text: 'Uw aanvraag voor een ontheffing of vergunning voor de volgende activiteiten:',
      nested: [
        'Ergens rijden of stilstaan waar dat normaal niet mag (RVV en e-RVV)',
        'Straat tijdelijk afsluiten of afzetten (TVM)',
        'Object neerzetten op parkeervak, straat of stoep (Objectvergunning)',
        'Parkeervakken reserveren (TVM)',
        'Tijdelijk toegang krijgen tot gebied dat is afgesloten met paaltjes (RVV)',
        'Werkzaamheden uitvoeren op tijden dat het normaal niet mag (Nachtwerkontheffing)',
        'Filmen (Filmmelding)',
        'Fietsen en/of fietsenrekken verwijderen',
      ],
    },
    {
      text: 'Uw aanvraag of kentekenwijziging voor een RVV-ontheffing Sloterweg',
    },
    {
      text: 'Uw aanvraag voor een gehandicaptenparkeerkaart (GPK) of een vaste gehandicaptenparkeerplaats (GPP)',
    },
    { text: 'Uw aanvraag voor een ontheffing touringcar' },
    { text: 'Uw aanvraag voor een ontheffing zwaar verkeer' },
    { text: 'Uw aanvraag voor een ontheffing blauwe zone' },
    { text: 'Uw evenementvergunning of evenementmelding' },
    { text: 'Uw aanvraag voor een splitsingsvergunning' },
    { text: 'Uw aanvraag voor kamerverhuur (omzettingsvergunning)' },
    {
      text: 'Uw aanvraag vergunning straatartiest, draaiorgel of het aanbieden van diensten op straat',
    },
    { text: 'Uw aanvraag ontheffing verspreiden reclamemateriaal (sampling)' },
    {
      text: 'Uw aanvraag voor een vergunning voor onttrekken, samenvoegen en vormen van woonruimte',
    },
    { text: 'Uw aanvraag voor een ligplaatsvergunning' },
    {
      text: 'Uw aanvraag voor een eigen parkeerplaats voor huisartsen, verloskundigen en consuls',
    },
    { text: 'Uw aanvraag voor een vergunning exploitatie horecabedrijf' },
  ],
};
