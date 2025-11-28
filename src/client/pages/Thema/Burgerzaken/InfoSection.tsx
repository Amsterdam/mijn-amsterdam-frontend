import { featureToggle, themaId, themaTitle } from './Burgerzaken-thema-config';
import { InfoSection_DEPRECATED } from '../../GeneralInfo/GeneralInfo';

export const burgerzakenSectionProps: InfoSection_DEPRECATED = {
  id: themaId,
  title: themaTitle,
  listItems: ['Gegevens van uw paspoort of ID-kaart'],
  active: featureToggle.burgerzakenActive,
};
