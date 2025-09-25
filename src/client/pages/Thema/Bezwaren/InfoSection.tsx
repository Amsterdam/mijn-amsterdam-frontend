import { featureToggle, themaId, themaTitle } from './Bezwaren-thema-config';
import { Section } from '../../GeneralInfo/GeneralInfo';

export const bezwarenSectionProps: Section = {
  id: themaId,
  title: themaTitle,
  listItems: ['Bezwaren tegen een besluit van de gemeente Amsterdam'],
  active: featureToggle.BezwarenActive,
};
