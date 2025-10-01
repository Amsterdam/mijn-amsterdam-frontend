import { featureToggle, themaId, themaTitle } from './Klachten-thema-config';
import { InfoSection } from '../../GeneralInfo/GeneralInfo';

export const klachtenSectionProps: InfoSection = {
  id: themaId,
  title: themaTitle,
  listItems: ['Uw ingediende klachten'],
  active: featureToggle.klachtenActive,
};
