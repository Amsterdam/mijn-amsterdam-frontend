import {
  featureToggle,
  regelingenTitle,
  stadspasTitle,
  themaId,
} from './HLI-thema-config';
import { SectionProps } from '../../GeneralInfo/GeneralInfo';

export const HLIRegelingenSectionProps: SectionProps = {
  id: themaId,
  title: regelingenTitle,
  listItems: [
    'Collectieve zorgverzekering',
    'Declaratie Kindtegoed',
    'Kindtegoed Voorschool',
    'Reiskostenvergoeding',
    'Gratis laptop of tablet middelbare school',
    'Gratis laptop of tablet basisschool',
    'Individuele inkomenstoeslag',
    "Gratis openbaar vervoer voor AOW'ers",
    'Tegemoetkoming aanvullend openbaar vervoer voor ouderen',
    'Tegemoetkoming openbaar vervoer voor mantelzorgers',
  ],
  active: featureToggle.hliThemaRegelingenActive,
};
export const HLIstadspasSectionProps: SectionProps = {
  id: themaId,
  title: stadspasTitle,
  listItems: [
    'Status aanvraag Stadspas van u of uw gezin',
    'Het saldo Kindtegoed en/of andere tegoeden en de bestedingen',
    'Stadspasnummer',
    'Stadspas blokkeren',
  ],
  active: featureToggle.hliStadspasActive,
};
