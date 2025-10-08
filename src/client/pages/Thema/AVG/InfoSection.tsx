import { featureToggle, themaId, themaTitle } from './AVG-thema-config';
import { InfoSection } from '../../GeneralInfo/GeneralInfo';

export const AVGsectionProps: InfoSection = {
  id: themaId,
  title: themaTitle,
  listItems: ['Uw inzage of wijziging persoonsgegevens AVG'],
  active: featureToggle.avgActive,
};
