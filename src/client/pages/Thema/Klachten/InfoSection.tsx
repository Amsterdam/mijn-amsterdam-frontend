import { featureToggle, themaId, themaTitle } from './Klachten-thema-config';
import { Section } from '../../GeneralInfo/GeneralInfo';

export const klachtenSectionProps: Section = {
  id: themaId,
  title: themaTitle,
  listItems: ['Uw ingediende klachten'],
  active: featureToggle.klachtenActive,
};
