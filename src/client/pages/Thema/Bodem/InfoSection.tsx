import { featureToggle, themaId, themaTitle } from './Bodem-thema-config';
import { InfoSection } from '../../GeneralInfo/GeneralInfo';

export const bodemsectionProps: InfoSection = {
  id: themaId,
  title: themaTitle,
  listItems: ["Uw aanvraag voor 'lood in de bodem-check'"],
  active: featureToggle.BodemActive,
};
