import { featureToggle, themaId, themaTitle } from './Klachten-thema-config';
import { InfoSection_DEPRECATED } from '../../GeneralInfo/GeneralInfo';

export const klachtenSectionProps: InfoSection_DEPRECATED = {
  id: themaId,
  title: themaTitle,
  listItems: ['Uw ingediende klachten'],
  active: featureToggle.klachtenActive,
};
