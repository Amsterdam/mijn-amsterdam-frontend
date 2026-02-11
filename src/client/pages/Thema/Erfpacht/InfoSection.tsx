import { themaConfig } from './Erfpacht-thema-config';
import { InfoSection_DEPRECATED } from '../../GeneralInfo/GeneralInfo';

export const erfpachtSectionProps: InfoSection_DEPRECATED = {
  id: themaConfig.id,
  title: themaConfig.title,
  listItems: ['Overzicht van uw erfpachtgegevens'],
  active: themaConfig.featureToggle.active,
};
