import { themaConfig } from './Klachten-thema-config';
import { InfoSection_DEPRECATED } from '../../GeneralInfo/GeneralInfo';

export const klachtenSectionProps: InfoSection_DEPRECATED = {
  id: themaConfig.id,
  title: themaConfig.title,
  listItems: ['Uw ingediende klachten'],
  active: themaConfig.featureToggle.active,
};
