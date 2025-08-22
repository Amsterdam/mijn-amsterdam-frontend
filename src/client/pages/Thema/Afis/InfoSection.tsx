import { featureToggle, themaId, themaTitle } from './Afis-thema-config';
import { SectionProps } from '../../GeneralInfo/GeneralInfo';

export const afisSectionProps: SectionProps = {
  id: themaId,
  title: themaTitle,
  listItems: ['Overzicht van facturen', 'Betalen van facturen'],
  active: featureToggle.AfisActive,
};
