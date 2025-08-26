import {
  featureToggle,
  themaId,
  themaTitle,
} from './Vergunningen-thema-config';
import { SectionProps } from '../../GeneralInfo/GeneralInfo';

export const vergunningensectionProps: SectionProps = {
  id: themaId,
  title: themaTitle,
  listItems: [
    {
      text: 'Uw aanvraag voor een ontheffing of vergunning voor de volgende activiteiten:',
      listItems: [
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
    'Uw aanvraag of kentekenwijziging voor een RVV-ontheffing Sloterweg',
    'Uw aanvraag voor een gehandicaptenparkeerkaart (GPK) of een vaste gehandicaptenparkeerplaats (GPP)',
    'Uw aanvraag voor een ontheffing touringcar',
    'Uw aanvraag voor een ontheffing zwaar verkeer',
    'Uw aanvraag voor een ontheffing blauwe zone',
    'Uw evenementvergunning of evenementmelding',
    'Uw aanvraag voor een splitsingsvergunning',
    'Uw aanvraag voor kamerverhuur (omzettingsvergunning)',
    'Uw aanvraag vergunning straatartiest, draaiorgel of het aanbieden van diensten op straat',
    'Uw aanvraag ontheffing verspreiden reclamemateriaal (sampling)',
    'Uw aanvraag voor een vergunning voor onttrekken, samenvoegen en vormen van woonruimte',
    'Uw aanvraag voor een ligplaatsvergunning',
    'Uw aanvraag voor een eigen parkeerplaats voor huisartsen, verloskundigen en consuls',
    'Uw aanvraag voor een vergunning exploitatie horecabedrijf',
  ],
  active: featureToggle.vergunningenActive,
};
