import { featureToggle, themaId, themaTitle } from './Erfpacht-thema-config';
import { InfoSection_DEPRECATED } from '../../GeneralInfo/GeneralInfo';

export const erfpachtSectionProps: InfoSection_DEPRECATED = {
  id: themaId,
  title: themaTitle,
  listItems: ['Overzicht van uw erfpachtgegevens'],
  active: featureToggle.erfpachtActive,
};
