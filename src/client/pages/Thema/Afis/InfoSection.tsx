import { featureToggle, themaId, themaTitle } from './Afis-thema-config';
import { InfoSection } from '../../GeneralInfo/GeneralInfo';

export const afisSectionProps: InfoSection = {
  id: themaId,
  title: themaTitle,
  listItems: ['Overzicht van facturen', 'Betalen van facturen'],
  active: featureToggle.AfisActive,
};
