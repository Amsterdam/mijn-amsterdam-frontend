import { featureToggle, themaId, themaTitle } from './Bezwaren-thema-config';
import { SectionProps } from '../../GeneralInfo/GeneralInfo';

export const bezwarenSectionProps: SectionProps = {
  id: themaId,
  title: themaTitle,
  listItems: ['Bezwaren tegen een besluit van de gemeente Amsterdam'],
  active: featureToggle.BezwarenActive,
};
