import { themaTitle } from './HLI-thema-config';
import * as generalInfo from '../../GeneralInfo/GeneralInfo';

export const HLISectionProps: generalInfo.SectionProps = {
  title: themaTitle,
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
  title: themaTitle,
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
