import { featureToggle, themaId, themaTitle } from './Bodem-thema-config';
import { Section } from '../../GeneralInfo/GeneralInfo';

export const bodemsectionProps: Section = {
  id: themaId,
  title: themaTitle,
  listItems: ["Uw aanvraag voor 'lood in de bodem-check'"],
  active: featureToggle.BodemActive,
};
