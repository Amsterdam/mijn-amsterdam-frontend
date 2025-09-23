import { featureToggle, themaId, themaTitle } from './Erfpacht-thema-config';
import { Section } from '../../GeneralInfo/GeneralInfo';

export const erfpachtSectionProps: Section = {
  id: themaId,
  title: themaTitle,
  listItems: ['Overzicht van uw erfpachtgegevens'],
  active: featureToggle.erfpachtActive,
};
