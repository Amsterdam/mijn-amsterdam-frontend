import { featureToggle, themaId, themaTitle } from './Bezwaren-thema-config';
import { InfoSection } from '../../GeneralInfo/GeneralInfo';

export const bezwarenSectionProps: InfoSection = {
  id: themaId,
  title: themaTitle,
  listItems: ['Bezwaren tegen een besluit van de gemeente Amsterdam'],
  active: featureToggle.BezwarenActive,
};
