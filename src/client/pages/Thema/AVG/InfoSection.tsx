import { featureToggle, themaId, themaTitle } from './AVG-thema-config';
import { Section } from '../../GeneralInfo/GeneralInfo';

export const AVGsectionProps: Section = {
  id: themaId,
  title: themaTitle,
  listItems: ['Uw inzage of wijziging persoonsgegevens AVG'],
  active: featureToggle.avgActive,
};
