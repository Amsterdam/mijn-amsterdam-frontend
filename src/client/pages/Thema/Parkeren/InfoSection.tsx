import { featureToggle, themaId, themaTitle } from './Parkeren-thema-config';
import { Section } from '../../GeneralInfo/GeneralInfo';

export const parkerensectionProps: Section = {
  id: themaId,
  title: themaTitle,
  listItems: ['Het inzien, aanvragen of wijzigen van een bewonersvergunning'],
  active: featureToggle.parkerenActive,
};
