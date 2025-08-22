import { featureToggle, themaId, themaTitle } from './Burgerzaken-thema-config';
import { SectionProps } from '../../GeneralInfo/GeneralInfo';

export const burgerzakenSectionProps: SectionProps = {
  id: themaId,
  title: themaTitle,
  listItems: ['Gegevens van uw paspoort of ID-kaart'],
  active: featureToggle.burgerzakenActive,
};
