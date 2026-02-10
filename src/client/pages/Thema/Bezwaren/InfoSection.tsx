import { themaConfig } from './Bezwaren-thema-config';
import { InfoSection_DEPRECATED } from '../../GeneralInfo/GeneralInfo';

export const bezwarenSectionProps: InfoSection_DEPRECATED = {
  id: themaConfig.id,
  title: themaConfig.title,
  listItems: ['Bezwaren tegen een besluit van de gemeente Amsterdam'],
  active: themaConfig.featureToggle.active,
};
