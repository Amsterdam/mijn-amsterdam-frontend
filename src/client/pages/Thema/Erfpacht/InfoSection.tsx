import { featureToggle, themaId, themaTitle } from './Erfpacht-thema-config';
import { InfoSection } from '../../GeneralInfo/GeneralInfo';

export const erfpachtSectionProps: InfoSection = {
  id: themaId,
  title: themaTitle,
  listItems: ['Overzicht van uw erfpachtgegevens'],
  active: featureToggle.erfpachtActive,
};
