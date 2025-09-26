import { featureToggle, themaId, themaTitle } from './Subsidies-thema-config';
import { Section } from '../../GeneralInfo/GeneralInfo';

export const subsidiesSectionProps: Section = {
  id: themaId,
  title: themaTitle,
  listItems: ['Uw aanvraag voor een subsidie'],
  active: featureToggle.subsidiesActive,
};
