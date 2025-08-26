import { featureToggle, themaId, themaTitle } from './Erfpacht-thema-config';
import { SectionProps } from '../../GeneralInfo/GeneralInfo';

export const erfpachtSectionProps: SectionProps = {
  id: themaId,
  title: themaTitle,
  listItems: ['Overzicht van uw erfpachtgegevens'],
  active: featureToggle.erfpachtActive,
};
