import { featureToggle, themaId, themaTitle } from './Parkeren-thema-config';
import { InfoSection } from '../../GeneralInfo/GeneralInfo';

export const parkerensectionProps: InfoSection = {
  id: themaId,
  title: themaTitle,
  listItems: ['Het inzien, aanvragen of wijzigen van een bewonersvergunning'],
  active: featureToggle.parkerenActive,
};
