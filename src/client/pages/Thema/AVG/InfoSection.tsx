import { featureToggle, themaId, themaTitle } from './AVG-thema-config';
import { InfoSection_DEPRECATED } from '../../GeneralInfo/GeneralInfo';

export const AVGsectionProps: InfoSection_DEPRECATED = {
  id: themaId,
  title: themaTitle,
  listItems: ['Uw inzage of wijziging persoonsgegevens AVG'],
  active: featureToggle.avgActive,
};
