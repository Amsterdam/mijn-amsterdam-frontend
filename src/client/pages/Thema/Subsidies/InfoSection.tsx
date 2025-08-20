import { featureToggle, themaId, themaTitle } from './Subsidies-thema-config';
import { SectionProps } from '../../GeneralInfo/GeneralInfo';

export const subsidiesSectionProps: SectionProps = {
  id: themaId,
  title: themaTitle,
  listItems: ['Uw aanvraag voor een subsidie'],
  active: featureToggle.subsidiesActive,
};
