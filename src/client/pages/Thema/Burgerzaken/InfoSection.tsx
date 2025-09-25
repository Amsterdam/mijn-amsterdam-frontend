import { featureToggle, themaId, themaTitle } from './Burgerzaken-thema-config';
import { Section } from '../../GeneralInfo/GeneralInfo';

export const burgerzakenSectionProps: Section = {
  id: themaId,
  title: themaTitle,
  listItems: ['Gegevens van uw paspoort of ID-kaart'],
  active: featureToggle.burgerzakenActive,
};
