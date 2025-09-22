import { themaConfig } from './Bodem-thema-config';
import { SectionProps as Section } from '../../GeneralInfo/GeneralInfo';

export const bodemsectionProps: Section = {
  id: themaConfig.id,
  title: themaConfig.title,
  listItems: ["Uw aanvraag voor 'lood in de bodem-check'"],
  active: themaConfig.featureToggle.themaActive, // aanpassen op basis van bodem-thema-config.ts featuretoggle
};
