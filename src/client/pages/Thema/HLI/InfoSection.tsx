import { themaId } from './HLI-thema-config';
import * as generalInfo from '../../GeneralInfo/GeneralInfo';

// RP TODO: getThemaTitle voor de titels, bij het dynamisch maken.
export const HLISectionProps: generalInfo.SectionProps = {
  id: themaId,
  title: 'Regelingen bij laag inkomen',
  listItems: [
    {
      text: 'Collectieve zorgverzekering',
    },
    {
      text: 'Declaratie Kindtegoed',
    },
    {
      text: 'Kindtegoed Voorschool',
    },
    {
      text: 'Gratis laptop of tablet middelbare school',
    },
    {
      text: 'Gratis laptop of tablet basisschool',
    },
    { text: 'Individuele inkomenstoeslag' },
    { text: "Gratis openbaar vervoer voor AOW'ers" },
    { text: 'Tegemoetkoming aanvullend openbaar vervoer voor ouderen' },
    { text: 'Tegemoetkoming openbaar vervoer voor mantelzorgers' },
  ],
};
export const stadspasSectionProps: generalInfo.SectionProps = {
  id: themaId,
  title: 'Stadspas',
  listItems: [
    {
      text: 'Status aanvraag Stadspas van u of uw gezin',
    },
    {
      text: 'Het saldo Kindtegoed en/of andere tegoeden en de bestedingen',
    },
    {
      text: 'Stadspasnummer',
    },
    {
      text: 'Stadspas blokkeren',
    },
  ],
};
