import { featureToggle, themaId, themaTitle } from './Burgerzaken-thema-config';
import { InfoSection } from '../../GeneralInfo/GeneralInfo';

export const burgerzakenSectionProps: InfoSection = {
  id: themaId,
  title: themaTitle,
  listItems: ['Gegevens van uw paspoort of ID-kaart'],
  active: featureToggle.burgerzakenActive,
};
