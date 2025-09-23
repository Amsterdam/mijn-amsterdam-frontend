import { featureToggle, themaId, themaTitle } from './Afis-thema-config';
import { Section } from '../../GeneralInfo/GeneralInfo';

export const afisSectionProps: Section = {
  id: themaId,
  title: themaTitle,
  listItems: ['Overzicht van facturen', 'Betalen van facturen'],
  active: featureToggle.AfisActive,
};
